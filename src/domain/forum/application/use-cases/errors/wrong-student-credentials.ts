import { UseCaseError } from '@/core/errors/use-case-error'

export class WrongStudentCredentialsError
  extends Error
  implements UseCaseError
{
  constructor() {
    super('Credentials do not match.')
  }
}
