import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clientesApi } from '../api/clientes.api'
import type { CadastrarClienteInput, EditarClienteInput } from '@/types'

export const clientesKeys = {
  all: ['clientes'] as const,
  favoritos: (clienteId: string) => ['clientes', clienteId, 'favoritos'] as const,
  interesses: (clienteId: string) => ['clientes', clienteId, 'interesses'] as const,
}

export function useCadastrarCliente() {
  return useMutation({
    mutationFn: (data: CadastrarClienteInput) => clientesApi.cadastrar(data),
  })
}

export function useEditarCliente(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EditarClienteInput) => clientesApi.editar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all })
    },
  })
}

export function useExcluirCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => clientesApi.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all })
    },
  })
}

export function useFavoritos(clienteId: string) {
  return useQuery({
    queryKey: clientesKeys.favoritos(clienteId),
    queryFn: () => clientesApi.listarFavoritos(clienteId),
    enabled: !!clienteId,
  })
}

export function useAdicionarFavorito(clienteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imovelId: string) => clientesApi.adicionarFavorito(clienteId, imovelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.favoritos(clienteId) })
    },
  })
}

export function useRemoverFavorito(clienteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imovelId: string) => clientesApi.removerFavorito(clienteId, imovelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.favoritos(clienteId) })
    },
  })
}

export function useInteressesCliente(clienteId: string) {
  return useQuery({
    queryKey: clientesKeys.interesses(clienteId),
    queryFn: () => clientesApi.listarInteresses(clienteId),
    enabled: !!clienteId,
  })
}
