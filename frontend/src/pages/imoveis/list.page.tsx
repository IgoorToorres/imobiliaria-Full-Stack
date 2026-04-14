import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Bath, Car, Plus } from 'lucide-react'
import { useImoveis } from '@/features/imoveis/hooks/use-imoveis'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { FiltrosImovel, StatusImovel } from '@/types'

const statusLabel: Record<StatusImovel, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  LOCADO: 'Locado',
  INATIVO: 'Inativo',
}

const statusVariant: Record<StatusImovel, 'success' | 'warning' | 'secondary' | 'outline' | 'destructive'> = {
  DISPONIVEL: 'success',
  RESERVADO: 'warning',
  VENDIDO: 'secondary',
  LOCADO: 'secondary',
  INATIVO: 'outline',
}

export function ImoveisListPage() {
  const { isAuthenticated, usuario } = useAuthStore()
  const podeGerenciar = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR'].includes(usuario?.perfil ?? '')

  const [filtros, setFiltros] = useState<FiltrosImovel>({})
  const [cidade, setCidade] = useState('')

  const { data, isLoading } = useImoveis(filtros)

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    setFiltros((prev) => ({ ...prev, cidade: cidade || undefined }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Imóveis</h1>
          <p className="text-muted-foreground">
            {data?.total ?? 0} imóvel(is) encontrado(s)
          </p>
        </div>
        {isAuthenticated && podeGerenciar && (
          <Button asChild>
            <Link to="/imoveis/novo">
              <Plus className="h-4 w-4" />
              Cadastrar imóvel
            </Link>
          </Button>
        )}
      </div>

      {/* Filtros */}
      <form onSubmit={handleBuscar} className="flex gap-2">
        <Input
          placeholder="Buscar por cidade..."
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit" variant="outline">Buscar</Button>
        {Object.keys(filtros).length > 0 && (
          <Button type="button" variant="ghost" onClick={() => { setFiltros({}); setCidade('') }}>
            Limpar
          </Button>
        )}
      </form>

      {/* Lista */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><div className="h-5 bg-muted rounded w-3/4" /></CardHeader>
              <CardContent><div className="h-4 bg-muted rounded w-1/2" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.imoveis.map((imovel) => (
            <Card key={imovel.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{imovel.titulo}</CardTitle>
                  <Badge variant={statusVariant[imovel.status]} className="shrink-0">
                    {statusLabel[imovel.status]}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {imovel.endereco.bairro}, {imovel.endereco.cidade} — {imovel.endereco.estado}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" /> {imovel.quartos}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> {imovel.banheiros}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="h-3.5 w-3.5" /> {imovel.vagas}
                  </span>
                </div>

                <p className="text-lg font-semibold">{formatCurrency(imovel.preco)}</p>
              </CardContent>

              <CardFooter>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/imoveis/${imovel.id}`}>Ver detalhes</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && data?.imoveis.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          Nenhum imóvel encontrado com os filtros aplicados.
        </div>
      )}
    </div>
  )
}
