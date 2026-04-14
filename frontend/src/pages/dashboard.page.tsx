import { Link } from 'react-router-dom'
import { Building2, Users, UserCheck, BarChart3, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
  const { usuario } = useAuthStore()

  const isAdminOrGestor = usuario?.perfil === 'ADMINISTRADOR' || usuario?.perfil === 'GESTOR'
  const podeGerenciarImoveis = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR'].includes(usuario?.perfil ?? '')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Olá, {usuario?.nome?.split(' ')[0]}</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel — perfil: <span className="font-medium">{usuario?.perfil}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Imóveis</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Visualize e gerencie o catálogo de imóveis</CardDescription>
            <div className="flex gap-2 mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to="/imoveis">Ver todos</Link>
              </Button>
              {podeGerenciarImoveis && (
                <Button asChild size="sm">
                  <Link to="/imoveis/novo">
                    <Plus className="h-4 w-4" />
                    Novo
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>Gerencie a carteira de clientes</CardDescription>
            <div className="mt-4">
              <Button asChild size="sm" variant="outline">
                <Link to="/clientes">Ver clientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {isAdminOrGestor && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Corretores</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerencie a equipe de corretores</CardDescription>
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/corretores">Ver corretores</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>Desempenho de corretores e imóveis</CardDescription>
                <div className="mt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/relatorios">Ver relatórios</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
