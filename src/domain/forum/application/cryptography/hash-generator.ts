export abstract class HasherGenerator {
  abstract hash(plain: string, rounds: number): Promise<string>
}
