import { Controller, Get, Delete, Post, Query, UseGuards, Param } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@Controller('linkedin')
export class LinkedinController {
  constructor(
    private linkedinService: LinkedinService,
    private configService: ConfigService,
  ) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  getAuthUrl(@CurrentUser() user: any) {
    const authUrl = this.linkedinService.getAuthUrl(user.id);
    return { authUrl };
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('state') state: string) {
    await this.linkedinService.handleCallback(code, state);
    const frontendUrl = this.configService.get('FRONTEND_URL');
    return `
      <html>
        <script>
          window.opener.postMessage({ type: 'linkedin-auth-success' }, '${frontendUrl}');
          window.close();
        </script>
        <body>
          <h2>LinkedIn connected successfully! You can close this window.</h2>
        </body>
      </html>
    `;
  }

  @Get('account')
  @UseGuards(JwtAuthGuard)
  getAccount(@CurrentUser() user: any) {
    return this.linkedinService.getLinkedInAccount(user.id);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  disconnect(@CurrentUser() user: any) {
    return this.linkedinService.disconnectLinkedIn(user.id);
  }

  @Post('publish/:postId')
  @UseGuards(JwtAuthGuard)
  publishPost(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.linkedinService.publishPost(postId, user.id);
  }
}