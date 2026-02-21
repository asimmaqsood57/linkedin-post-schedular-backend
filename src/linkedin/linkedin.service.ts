import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class LinkedinService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  getAuthUrl(userId: string): string {
    const clientId = this.configService.get<string>('LINKEDIN_CLIENT_ID') || '';
    const redirectUri =
      this.configService.get<string>('LINKEDIN_REDIRECT_URI') || '';
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const scope = 'openid profile email w_member_social';
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  }

  async handleCallback(code: string, state: string) {
    try {
      const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

      const tokenResponse = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id:
            this.configService.get<string>('LINKEDIN_CLIENT_ID') || '',
          client_secret:
            this.configService.get<string>('LINKEDIN_CLIENT_SECRET') || '',
          redirect_uri:
            this.configService.get<string>('LINKEDIN_REDIRECT_URI') || '',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      const profileResponse = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );

      const profile = profileResponse.data;
      const resolvedName = this.resolveName(profile);

      console.log('[LinkedIn] Profile data:', JSON.stringify(profile));
      console.log('[LinkedIn] Resolved name:', resolvedName);

      await this.prisma.linkedinAccount.upsert({
        where: { linkedinId: profile.sub },
        update: {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          name: resolvedName,
          email: profile.email || null,
          profileUrl: profile.picture || null,
        },
        create: {
          userId,
          linkedinId: profile.sub,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt: new Date(Date.now() + expires_in * 1000),
          name: resolvedName,
          email: profile.email || null,
          profileUrl: profile.picture || null,
        },
      });

      return { success: true };
    } catch (error) {
      console.error(
        'LinkedIn callback error:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException('Failed to connect LinkedIn account');
    }
  }

  private resolveName(profile: any): string | null {
    // Try full name first — ensure it doesn't contain "undefined"
    if (
      profile.name &&
      !profile.name.includes('undefined') &&
      profile.name.trim()
    ) {
      return profile.name.trim();
    }
    // Try given + family name
    if (profile.given_name || profile.family_name) {
      const combined = [profile.given_name, profile.family_name]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (combined) return combined;
    }
    // Fall back to email username
    if (profile.email) {
      return profile.email.split('@')[0];
    }
    return null;
  }

  async getLinkedInAccount(userId: string) {
    return this.prisma.linkedinAccount.findFirst({
      where: { userId },
      select: {
        id: true,
        name: true,
        email: true,
        profileUrl: true,
        createdAt: true,
      },
    });
  }

  async disconnectLinkedIn(userId: string) {
    await this.prisma.linkedinAccount.deleteMany({ where: { userId } });
    return { success: true };
  }

  async publishPost(postId: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, userId },
    });

    if (!post) throw new Error('Post not found');

    const linkedinAccount = await this.prisma.linkedinAccount.findFirst({
      where: { userId },
    });

    if (!linkedinAccount) {
      throw new UnauthorizedException('LinkedIn account not connected');
    }

    try {
      const response = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: `urn:li:person:${linkedinAccount.linkedinId}`,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: post.content },
              shareMediaCategory: 'NONE',
            },
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${linkedinAccount.accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0',
          },
        },
      );

      await this.prisma.post.update({
        where: { id: postId },
        data: {
          status: 'published',
          publishedAt: new Date(),
          linkedinPostId: response.data.id,
        },
      });

      return { success: true, linkedinPostId: response.data.id };
    } catch (error) {
      console.error(
        'LinkedIn publish error:',
        error.response?.data || error.message,
      );
      await this.prisma.post.update({
        where: { id: postId },
        data: { status: 'failed' },
      });
      throw new Error('Failed to publish to LinkedIn');
    }
  }
}