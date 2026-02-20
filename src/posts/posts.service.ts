import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GeneratePostDto } from './dto/generate-post.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get('GROQ_API_KEY'),
    });
  }

  async generatePost(generatePostDto: GeneratePostDto, userId: string) {
    const { category, instructions } = generatePostDto;

    const prompt = instructions
      ? `Generate a professional LinkedIn post about ${category}.
       User instructions: ${instructions}
       Keep it engaging, informative, and between 100-200 words.
       Include relevant hashtags at the end.`
      : `Generate a professional LinkedIn post about ${category}.
       Keep it engaging, informative, and between 100-200 words.
       Include relevant hashtags at the end.`;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    const content = completion.choices[0].message.content || '';

    return { content, category };
  }

  async generatePostWithDescription(
    category: string,
    description: string,
    userId: string,
  ) {
    const prompt = `Generate a professional LinkedIn post about ${category}.
    Topic/Focus: ${description}
    Keep it engaging, informative, and between 100-200 words. 
    Include relevant hashtags at the end.`;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
    });

    const content = completion.choices[0].message.content || '';

    return {
      content,
      category,
    };
  }

  async createPost(createPostDto: CreatePostDto, userId: string) {
    return this.prisma.post.create({
      data: {
        content: createPostDto.content,
        category: createPostDto.category,
        scheduledAt: createPostDto.scheduledAt
          ? new Date(createPostDto.scheduledAt)
          : null,
        status: createPostDto.status || 'draft',
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        schedule: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, userId },
      include: {
        schedule: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }


  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
  const post = await this.prisma.post.findFirst({ where: { id, userId } });
  if (!post) throw new NotFoundException('Post not found');

  return this.prisma.post.update({
    where: { id },
    data: {
      ...(updatePostDto.content && { content: updatePostDto.content }),
      ...(updatePostDto.category && { category: updatePostDto.category }),
      scheduledAt: updatePostDto.scheduledAt
        ? new Date(updatePostDto.scheduledAt)
        : undefined,
    },
  });
}

  async delete(id: string, userId: string) {
    return this.prisma.post.delete({
      where: { id, userId },
    });
  }
}
