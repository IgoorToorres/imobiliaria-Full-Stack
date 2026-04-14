import { useQuery } from '@tanstack/react-query'
import { relatoriosApi } from '../api/relatorios.api'

export const relatoriosKeys = {
  imoveisMarcados: (corretorId: string) =>
    ['relatorios', 'imoveis-marcados', corretorId] as const,
  desempenho: () => ['relatorios', 'desempenho-corretores'] as const,
}

export function useRelatorioImoveisMarcados(corretorId: string) {
  return useQuery({
    queryKey: relatoriosKeys.imoveisMarcados(corretorId),
    queryFn: () => relatoriosApi.imoveisMarcados(corretorId),
    enabled: !!corretorId,
  })
}

export function useRelatorioDesempenhoCorretores() {
  return useQuery({
    queryKey: relatoriosKeys.desempenho(),
    queryFn: () => relatoriosApi.desempenhoCorretores(),
  })
}
