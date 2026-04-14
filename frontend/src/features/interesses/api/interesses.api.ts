import { api } from '@/lib/api'
import type { Interesse, RegistrarInteresseInput } from '@/types'

export const interessesApi = {
  registrar: async (data: RegistrarInteresseInput): Promise<{ interesse: Interesse }> => {
    const response = await api.post<{ interesse: Interesse }>('/interesses', data)
    return response.data
  },
}
