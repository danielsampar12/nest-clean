export abstract class HasherComparator {
  abstract compare(plain: string, hash: string): Promise<boolean>
}
