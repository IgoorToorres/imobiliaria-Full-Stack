import { api } from '@/lib/api'
import type {
  CadastrarClienteInput,
  EditarClienteInput,
  ClienteFavorito,
  Interesse,
  Usuario,
} from '@/types'

export const clientesApi = {
  cadastrar: async (
    data: CadastrarClienteInput,
  ): Promise<{ usuario: Usuario; clienteId: string }> => {
    const response = await api.post<{ usuario: Usuario; clienteId: string }>('/clientes', data)
    return response.data
  },

  editar: async (id: string, data: EditarClienteInput): Promise<void> => {
    await api.patch(`/clientes/${id}`, data)
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`)
  },

  listarFavoritos: async (id: string): Promise<{ favoritos: ClienteFavorito[] }> => {
    const response = await api.get<{ favoritos: ClienteFavorito[] }>(`/clientes/${id}/favoritos`)
    return response.data
  },

  adicionarFavorito: async (clienteId: string, imovelId: string): Promise<void> => {
    await api.post(`/clientes/${clienteId}/favoritos`, { imovelId })
  },

  removerFavorito: async (clienteId: string, imovelId: string): Promise<void> => {
    await api.delete(`/clientes/${clienteId}/favoritos/${imovelId}`)
  },

  listarInteresses: async (id: string): Promise<{ interesses: Interesse[] }> => {
    const response = await api.get<{ interesses: Interesse[] }>(`/clientes/${id}/interesses`)
    return response.data
  },
}
