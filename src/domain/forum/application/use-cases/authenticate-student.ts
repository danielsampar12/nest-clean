import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { StudentsRepository } from '../repositories/students-repository'
import { HasherComparator } from '../cryptography/hash-comparator'
import { Encrypter } from '../cryptography/encrypter'
import { WrongStudentCredentialsError } from './errors/wrong-student-credentials'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongStudentCredentialsError,
  {
    accessToken: string
  }
>

// I know I'm not supposed to use Nest Injectable class here, but it's a trade off
// so I don''t have to create a Nest class with injectable and blablabla
@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private studentsRepository: StudentsRepository,
    private hashComparator: HasherComparator,
    private encrypter: Encrypter,
  ) {}

  async execute({
    email,
    password,
  }: AuthenticateStudentUseCaseRequest): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(email)

    if (!student) {
      return left(new WrongStudentCredentialsError())
    }

    const isSamePassword = await this.hashComparator.compare(
      password,
      student.password,
    )

    if (!isSamePassword) {
      return left(new WrongStudentCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: student.id.toString(),
    })

    return right({
      accessToken,
    })
  }
}
