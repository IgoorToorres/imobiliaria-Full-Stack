import { api } from '@/lib/api'
import type {
  LoginInput,
  LoginResponse,
  RecuperarSenhaInput,
  RedefinirSenhaInput,
} from '@/types'

export const authApi = {
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.delete('/auth/logout')
  },

  recuperarSenha: async (data: RecuperarSenhaInput): Promise<{ token: string }> => {
    const response = await api.post<{ token: string }>('/auth/recuperar-senha', data)
    return response.data
  },

  redefinirSenha: async (data: RedefinirSenhaInput): Promise<void> => {
    await api.post('/auth/redefinir-senha', data)
  },
}
