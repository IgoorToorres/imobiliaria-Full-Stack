import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, Users, UserCheck, BarChart3, LogOut, LogIn } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth/hooks/use-auth'

export function AppLayout() {
  const { isAuthenticated, usuario } = useAuthStore()
  const navigate = useNavigate()
  const logout = useLogout()

  const isAdminOrGestor = usuario?.perfil === 'ADMINISTRADOR' || usuario?.perfil === 'GESTOR'

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/imoveis" className="flex items-center gap-2 font-semibold text-lg">
            <Building2 className="h-5 w-5" />
            Imobiliária
          </Link>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/imoveis">Imóveis</Link>
            </Button>

            {isAuthenticated && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>

                <Button variant="ghost" size="sm" asChild>
                  <Link to="/clientes">
                    <Users className="h-4 w-4" />
                    Clientes
                  </Link>
                </Button>

                {isAdminOrGestor && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/corretores">
                        <UserCheck className="h-4 w-4" />
                        Corretores
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/relatorios">
                        <BarChart3 className="h-4 w-4" />
                        Relatórios
                      </Link>
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/login') })}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <Button size="sm" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Entrar
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}
