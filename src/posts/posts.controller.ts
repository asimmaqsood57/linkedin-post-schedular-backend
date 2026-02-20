import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GeneratePostDto } from './dto/generate-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('posts')
@Controller('posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generate AI post content',
    description:
      'Use AI (Groq Llama 3.3 70B) to generate professional LinkedIn post content',
  })
  @ApiBody({ type: GeneratePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post content generated successfully',
    schema: {
      example: {
        content:
          "As we navigate the ever-evolving landscape of technology, it's exciting to see how AI is transforming businesses...\n\n#Technology #AI #Innovation",
        category: 'Technology',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async generatePost(
    @Body() generatePostDto: GeneratePostDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.generatePost(generatePostDto, user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new post',
    description: 'Save a post (generated or manual) to the database',
  })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Excited to share insights...',
        category: 'Technology',
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
        linkedinPostId: null,
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-02-08T10:00:00.000Z',
        updatedAt: '2026-02-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return this.postsService.createPost(createPostDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all user posts',
    description: 'Retrieve all posts for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Posts retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          content: 'Post content here...',
          category: 'Technology',
          status: 'published',
          scheduledAt: '2026-02-08T10:00:00.000Z',
          publishedAt: '2026-02-08T10:00:05.000Z',
          linkedinPostId: 'urn:li:share:123456789',
          scheduleId: null,
          userId: '123e4567-e89b-12d3-a456-426614174001',
          createdAt: '2026-02-08T09:00:00.000Z',
          updatedAt: '2026-02-08T10:00:05.000Z',
          schedule: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@CurrentUser() user: any) {
    return this.postsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single post',
    description: 'Retrieve a specific post by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        content: 'Post content here...',
        category: 'Technology',
        status: 'draft',
        scheduledAt: null,
        publishedAt: null,
        linkedinPostId: null,
        scheduleId: null,
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-02-08T10:00:00.000Z',
        updatedAt: '2026-02-08T10:00:00.000Z',
        schedule: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.findOne(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a post',
    description: 'Permanently delete a post',
  })
  @ApiParam({
    name: 'id',
    description: 'Post ID (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Post not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.delete(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @CurrentUser() user: any,
  ) {
    return this.postsService.update(id, updatePostDto, user.id);
  }
}
