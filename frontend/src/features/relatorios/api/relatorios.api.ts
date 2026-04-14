import { api } from '@/lib/api'
import type { RelatorioDesempenhoCorretor, RelatorioImovelMarcado } from '@/types'

export const relatoriosApi = {
  imoveisMarcados: async (
    corretorId: string,
  ): Promise<{ itens: RelatorioImovelMarcado[] }> => {
    const response = await api.get<{ itens: RelatorioImovelMarcado[] }>(
      `/relatorios/imoveis-marcados/${corretorId}`,
    )
    return response.data
  },

  desempenhoCorretores: async (): Promise<{ corretores: RelatorioDesempenhoCorretor[] }> => {
    const response = await api.get<{ corretores: RelatorioDesempenhoCorretor[] }>(
      '/relatorios/desempenho-corretores',
    )
    return response.data
  },
}
