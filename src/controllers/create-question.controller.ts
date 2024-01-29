import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common'

import { CurrentUser } from 'src/auth/current-user.decorator'

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { TokenPayload } from 'src/auth/jwt.strategy'
import { ZodValidationPipe } from 'src/pipes/zod-validation-pipe'
import { PrismaService } from 'src/prisma/prisma.service'

import { z } from 'zod'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>
const createQuestionsValidationPipe = new ZodValidationPipe(
  createQuestionBodySchema,
)

@Controller('/questions')
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  // @UsePipes(new ZodValidationPipe(createQuestionBodySchema))
  async handle(
    @Body(createQuestionsValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: TokenPayload,
  ) {
    const { title, content } = body
    const { sub: authorId } = user
    const slug = this.convertTitleToSlug(title)

    const existQuestionWithSameSlug = await this.prisma.question.findUnique({
      where: { slug },
    })

    if (existQuestionWithSameSlug) {
      throw new ConflictException('Question with same title already exists.')
    }

    await this.prisma.question.create({
      data: {
        slug,
        title,
        content,
        authorId,
      },
    })
  }

  private convertTitleToSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters except hyphen
      .replace(/\s+/g, '-') // Replace white spaces with hyphens
  }
}