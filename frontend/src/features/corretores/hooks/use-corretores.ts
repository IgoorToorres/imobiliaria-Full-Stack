import { useMutation, useQueryClient } from '@tanstack/react-query'
import { corretoresApi } from '../api/corretores.api'
import type { CadastrarCorretorInput } from '@/types'

export function useCadastrarCorretor() {
  return useMutation({
    mutationFn: (data: CadastrarCorretorInput) => corretoresApi.cadastrar(data),
  })
}

export function useVincularCorretorImovel(corretorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imovelId: string) => corretoresApi.vincularImovel(corretorId, imovelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corretores', corretorId] })
    },
  })
}

export function useVincularCorretorCliente(corretorId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (clienteId: string) => corretoresApi.vincularCliente(corretorId, clienteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corretores', corretorId] })
    },
  })
}
