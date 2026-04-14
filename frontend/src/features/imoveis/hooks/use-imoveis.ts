import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { imoveisApi } from '../api/imoveis.api'
import type { CadastrarImovelInput, EditarImovelInput, FiltrosImovel } from '@/types'

export const imoveisKeys = {
  all: ['imoveis'] as const,
  lists: () => [...imoveisKeys.all, 'list'] as const,
  list: (filtros?: FiltrosImovel) => [...imoveisKeys.lists(), filtros] as const,
  details: () => [...imoveisKeys.all, 'detail'] as const,
  detail: (id: string) => [...imoveisKeys.details(), id] as const,
}

export function useImoveis(filtros?: FiltrosImovel) {
  return useQuery({
    queryKey: imoveisKeys.list(filtros),
    queryFn: () => imoveisApi.pesquisar(filtros),
  })
}

export function useImovel(id: string) {
  return useQuery({
    queryKey: imoveisKeys.detail(id),
    queryFn: () => imoveisApi.buscarPorId(id),
    enabled: !!id,
  })
}

export function useCadastrarImovel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CadastrarImovelInput) => imoveisApi.cadastrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imoveisKeys.lists() })
    },
  })
}

export function useEditarImovel(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditarImovelInput) => imoveisApi.editar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imoveisKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: imoveisKeys.lists() })
    },
  })
}

export function useExcluirImovel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => imoveisApi.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imoveisKeys.lists() })
    },
  })
}
