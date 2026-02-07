import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GeneratePostDto } from './dto/generate-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('generate')
  generatePost(@Body() generatePostDto: GeneratePostDto, @CurrentUser() user: any) {
    return this.postsService.generatePost(generatePostDto, user.id);
  }

  @Post()
  createPost(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    return this.postsService.createPost(createPostDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.postsService.findAll(user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.postsService.delete(id, user.id);
  }
}