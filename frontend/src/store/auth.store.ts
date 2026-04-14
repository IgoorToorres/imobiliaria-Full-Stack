import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  clienteId: string | null   // preenchido no cadastro de cliente
  corretorId: string | null  // preenchido no cadastro de corretor
  isAuthenticated: boolean
  signIn: (token: string, usuario: Usuario) => void
  signOut: () => void
  setClienteId: (id: string) => void
  setCorretorId: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      clienteId: null,
      corretorId: null,
      isAuthenticated: false,

      signIn: (token, usuario) => {
        localStorage.setItem('@imobiliaria:token', token)
        set({ token, usuario, isAuthenticated: true })
      },

      signOut: () => {
        localStorage.removeItem('@imobiliaria:token')
        set({ token: null, usuario: null, clienteId: null, corretorId: null, isAuthenticated: false })
      },

      setClienteId: (id) => set({ clienteId: id }),
      setCorretorId: (id) => set({ corretorId: id }),
    }),
    {
      name: '@imobiliaria:auth',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        clienteId: state.clienteId,
        corretorId: state.corretorId,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
