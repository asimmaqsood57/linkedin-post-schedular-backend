import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { GeneratePostDto } from './dto/generate-post.dto';
import { CreatePostDto } from './dto/create-post.dto';

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
    const { category } = generatePostDto;

    const prompt = `Generate a professional LinkedIn post about ${category}. 
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

  async generatePostWithDescription(category: string, description: string, userId: string) {
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
        scheduledAt: createPostDto.scheduledAt ? new Date(createPostDto.scheduledAt) : null,
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

  async delete(id: string, userId: string) {
    return this.prisma.post.delete({
      where: { id, userId },
    });
  }
}