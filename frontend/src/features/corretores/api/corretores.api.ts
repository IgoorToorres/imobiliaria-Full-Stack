import { api } from '@/lib/api'
import type { CadastrarCorretorInput } from '@/types'

export const corretoresApi = {
  cadastrar: async (
    data: CadastrarCorretorInput,
  ): Promise<{ usuarioId: string; corretorId: string }> => {
    const response = await api.post<{ usuarioId: string; corretorId: string }>('/corretores', data)
    return response.data
  },

  vincularImovel: async (corretorId: string, imovelId: string): Promise<void> => {
    await api.post(`/corretores/${corretorId}/imoveis`, { imovelId })
  },

  vincularCliente: async (corretorId: string, clienteId: string): Promise<void> => {
    await api.post(`/corretores/${corretorId}/clientes`, { clienteId })
  },
}
