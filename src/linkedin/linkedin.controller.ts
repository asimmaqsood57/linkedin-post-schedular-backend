import { Controller, Get, Delete, Post, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { LinkedinService } from './linkedin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('linkedin')
@Controller('linkedin')
export class LinkedinController {
  constructor(
    private linkedinService: LinkedinService,
    private configService: ConfigService,
  ) {}

  @Get('auth-url')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get LinkedIn OAuth URL',
    description: 'Generate LinkedIn authorization URL for OAuth flow',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Authorization URL generated',
    schema: {
      example: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=...',
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  getAuthUrl(@CurrentUser() user: any) {
    const authUrl = this.linkedinService.getAuthUrl(user.id);
    return { authUrl };
  }

  @Get('callback')
  @ApiOperation({ 
    summary: 'LinkedIn OAuth callback',
    description: 'Handle LinkedIn OAuth callback and exchange code for access token',
  })
  @ApiQuery({ 
    name: 'code', 
    description: 'Authorization code from LinkedIn',
    example: 'AQSlHBGcJYqDvI_xBWzpRfx2ZTnDYr...',
  })
  @ApiQuery({ 
    name: 'state', 
    description: 'State parameter for CSRF protection',
    example: 'eyJ1c2VySWQiOiIxMjMifQ==',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'LinkedIn account connected successfully',
    content: {
      'text/html': {
        schema: {
          type: 'string',
          example: '<html>...</html>',
        },
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Failed to connect LinkedIn account',
  })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get connected LinkedIn account',
    description: 'Retrieve information about the connected LinkedIn account',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'LinkedIn account information',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        profileUrl: 'https://www.linkedin.com/in/johndoe',
        createdAt: '2026-02-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'LinkedIn account not connected',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  getAccount(@CurrentUser() user: any) {
    return this.linkedinService.getLinkedInAccount(user.id);
  }

  @Delete('disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Disconnect LinkedIn account',
    description: 'Remove the connection to LinkedIn account',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'LinkedIn account disconnected',
    schema: {
      example: {
        success: true,
      },
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  disconnect(@CurrentUser() user: any) {
    return this.linkedinService.disconnectLinkedIn(user.id);
  }

  @Post('publish/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Publish post to LinkedIn',
    description: 'Immediately publish a post to LinkedIn',
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'Post ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Post published successfully',
    schema: {
      example: {
        success: true,
        linkedinPostId: 'urn:li:share:123456789',
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Post not found',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized or LinkedIn account not connected',
  })
  publishPost(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.linkedinService.publishPost(postId, user.id);
  }
}