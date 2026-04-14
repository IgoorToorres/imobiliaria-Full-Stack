import { useMutation, useQueryClient } from '@tanstack/react-query'
import { interessesApi } from '../api/interesses.api'
import { clientesKeys } from '@/features/clientes/hooks/use-clientes'
import type { RegistrarInteresseInput } from '@/types'

export function useRegistrarInteresse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegistrarInteresseInput) => interessesApi.registrar(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: clientesKeys.interesses(variables.clienteId),
      })
    },
  })
}
