import { useMutation } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '@/store/auth.store'
import type { LoginInput, RecuperarSenhaInput, RedefinirSenhaInput } from '@/types'

export function useLogin() {
  const signIn = useAuthStore((state) => state.signIn)

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: ({ token, usuario }) => {
      signIn(token, usuario)
    },
  })
}

export function useLogout() {
  const signOut = useAuthStore((state) => state.signOut)

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      // Limpa o estado mesmo se a requisição falhar
      signOut()
    },
  })
}

export function useRecuperarSenha() {
  return useMutation({
    mutationFn: (data: RecuperarSenhaInput) => authApi.recuperarSenha(data),
  })
}

export function useRedefinirSenha() {
  return useMutation({
    mutationFn: (data: RedefinirSenhaInput) => authApi.redefinirSenha(data),
  })
}
