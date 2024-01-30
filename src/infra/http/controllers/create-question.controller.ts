import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user.decorator'

import { JwtAuthGuard } from '@/infra/auth/jwt-auth.guard'
import { TokenPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

import { z } from 'zod'
import { NestCreateQuestionUseCase } from '@/infra/use-cases/nest-create-question.usecase'

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
  constructor(private readonly createQuestion: NestCreateQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(createQuestionsValidationPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: TokenPayload,
  ) {
    const { title, content } = body
    const { sub: authorId } = user

    await this.createQuestion.execute({
      title,
      content,
      authorId,
      attachmentsIds: [],
    })
  }
}
