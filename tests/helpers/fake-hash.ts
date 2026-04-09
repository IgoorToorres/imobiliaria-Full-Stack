import type { HashPort } from '../../src/application/ports/hash.port.js'

/** Hash fake para testes: simplesmente prefixa a string com "hashed:" */
export class FakeHash implements HashPort {
  async hash(plain: string): Promise<string> {
    return `hashed:${plain}`
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return hashed === `hashed:${plain}`
  }
}
