import bcrypt from 'bcryptjs'
import type { HashPort } from '../../application/ports/hash.port.js'

export class BcryptHashAdapter implements HashPort {
  private readonly rounds = 10

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
