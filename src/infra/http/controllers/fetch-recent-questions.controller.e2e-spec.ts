import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Createa questions (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] questions', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '12345678',
      },
    })

    const accessToken = jwt.sign({ sub: user.id })

    await prisma.question.createMany({
      data: [
        {
          title: 'Question 1',
          content: 'Content 1',
          authorId: user.id,
          slug: 'question-1',
        },
        {
          title: 'Question 2',
          content: 'Content 2',
          authorId: user.id,
          slug: 'question-2',
        },
        {
          title: 'Question 3',
          content: 'Content 3',
          authorId: user.id,
          slug: 'question-3',
        },
        {
          title: 'Question 4',
          content: 'Content 4',
          authorId: user.id,
          slug: 'question-4',
        },
        {
          title: 'Question 5',
          content: 'Content 5',
          authorId: user.id,
          slug: 'question-5',
        },
      ],
    })

    const response = await request(app.getHttpServer())
      .get('/questions')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)

    console.log(response.body.questions)

    expect(response.body).toEqual({
      questions: [
        expect.objectContaining({ title: 'Question 1' }),
        expect.objectContaining({ title: 'Question 2' }),
        expect.objectContaining({ title: 'Question 3' }),
        expect.objectContaining({ title: 'Question 4' }),
        expect.objectContaining({ title: 'Question 5' }),
      ],
    })
  })
})
