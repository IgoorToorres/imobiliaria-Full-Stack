import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { LoginPage } from '@/pages/login.page'
import { CadastroPage } from '@/pages/cadastro.page'
import { RecuperarSenhaPage } from '@/pages/recuperar-senha.page'
import { ImoveisListPage } from '@/pages/imoveis/list.page'
import { ImovelDetailPage } from '@/pages/imoveis/detail.page'
import { ImovelFormPage } from '@/pages/imoveis/form.page'
import { DashboardPage } from '@/pages/dashboard.page'
import { ClientePerfilPage } from '@/pages/clientes/perfil.page'
import { AppLayout } from '@/components/layout/app-layout'

function PrivateRoute() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminGestorRoute() {
  const { usuario } = useAuthStore()
  const allowed = ['ADMINISTRADOR', 'GESTOR']
  if (!usuario || !allowed.includes(usuario.perfil)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export const router = createBrowserRouter([
  // Públicas sem layout
  { path: '/login', element: <LoginPage /> },
  { path: '/cadastro', element: <CadastroPage /> },
  { path: '/recuperar-senha', element: <RecuperarSenhaPage /> },

  // Públicas com layout
  {
    element: <AppLayout />,
    children: [
      { path: '/imoveis', element: <ImoveisListPage /> },
      { path: '/imoveis/:id', element: <ImovelDetailPage /> },
    ],
  },

  // Autenticadas
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },

          // Imóveis
          { path: '/imoveis/novo', element: <ImovelFormPage /> },
          { path: '/imoveis/:id/editar', element: <ImovelFormPage /> },

          // Clientes
          { path: '/clientes', element: <ClientePerfilPage /> },

          // Perfil
          { path: '/perfil', element: <ClientePerfilPage /> },

          // Apenas ADMIN / GESTOR
          {
            element: <AdminGestorRoute />,
            children: [
              { path: '/corretores', element: <div className="text-muted-foreground">Corretores (em breve)</div> },
              { path: '/relatorios', element: <div className="text-muted-foreground">Relatórios (em breve)</div> },
            ],
          },
        ],
      },
    ],
  },

  { path: '/', element: <Navigate to="/imoveis" replace /> },
  { path: '*', element: <Navigate to="/imoveis" replace /> },
])
