import { api } from '@/lib/api'
import type {
  CadastrarImovelInput,
  EditarImovelInput,
  FiltrosImovel,
  Imovel,
  PesquisarImoveisResponse,
  VisualizarImovelResponse,
} from '@/types'

export const imoveisApi = {
  pesquisar: async (filtros?: FiltrosImovel): Promise<PesquisarImoveisResponse> => {
    const response = await api.get<PesquisarImoveisResponse>('/imoveis', { params: filtros })
    return response.data
  },

  buscarPorId: async (id: string): Promise<VisualizarImovelResponse> => {
    const response = await api.get<VisualizarImovelResponse>(`/imoveis/${id}`)
    return response.data
  },

  cadastrar: async (data: CadastrarImovelInput): Promise<{ imovel: Imovel }> => {
    const response = await api.post<{ imovel: Imovel }>('/imoveis', data)
    return response.data
  },

  editar: async (id: string, data: EditarImovelInput): Promise<{ imovel: Imovel }> => {
    const response = await api.patch<{ imovel: Imovel }>(`/imoveis/${id}`, data)
    return response.data
  },

  excluir: async (id: string): Promise<void> => {
    await api.delete(`/imoveis/${id}`)
  },
}
