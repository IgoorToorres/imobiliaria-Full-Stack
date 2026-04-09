export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super(id ? `${entity} não encontrado: ${id}` : `${entity} não encontrado`)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Acesso não autorizado') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessRuleError'
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Credenciais inválidas')
    this.name = 'InvalidCredentialsError'
  }
}
