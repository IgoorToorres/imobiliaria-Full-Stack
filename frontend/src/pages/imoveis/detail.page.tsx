import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Bed, Bath, Car, Heart, MessageSquare, Pencil } from 'lucide-react'
import { useImovel } from '@/features/imoveis/hooks/use-imoveis'
import { useAdicionarFavorito, useRemoverFavorito, useFavoritos } from '@/features/clientes/hooks/use-clientes'
import { useRegistrarInteresse } from '@/features/interesses/hooks/use-interesses'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { StatusImovel } from '@/types'

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

export function ImovelDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, usuario, clienteId } = useAuthStore()

  const { data, isLoading, isError } = useImovel(id!)
  const { data: favoritosData } = useFavoritos(clienteId ?? '')

  const adicionarFavorito = useAdicionarFavorito(clienteId ?? '')
  const removerFavorito = useRemoverFavorito(clienteId ?? '')
  const registrarInteresse = useRegistrarInteresse()

  const [mensagem, setMensagem] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const podeGerenciar = ['ADMINISTRADOR', 'GESTOR', 'CORRETOR'].includes(usuario?.perfil ?? '')
  const isCliente = usuario?.perfil === 'CLIENTE'

  const isFavorito = favoritosData?.favoritos.some((f) => f.imovelId === id)

  function handleFavorito() {
    if (!clienteId) return
    if (isFavorito) {
      removerFavorito.mutate(id!)
    } else {
      adicionarFavorito.mutate(id!)
    }
  }

  function handleInteresse() {
    if (!clienteId) return
    registrarInteresse.mutate(
      { clienteId, imovelId: id!, mensagem: mensagem || undefined },
      {
        onSuccess: () => {
          setMensagem('')
          setDialogOpen(false)
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-40 bg-muted rounded" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Imóvel não encontrado.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/imoveis">Voltar à lista</Link>
        </Button>
      </div>
    )
  }

  const { imovel, totalFavoritos } = data

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link to="/imoveis">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>

        {isAuthenticated && podeGerenciar && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/imoveis/${id}/editar`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">{imovel.titulo}</h1>
          <Badge variant={statusVariant[imovel.status]}>{statusLabel[imovel.status]}</Badge>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          {imovel.endereco.logradouro}, {imovel.endereco.numero}
          {imovel.endereco.complemento && ` — ${imovel.endereco.complemento}`},{' '}
          {imovel.endereco.bairro}, {imovel.endereco.cidade}/{imovel.endereco.estado}
        </div>
      </div>

      <p className="text-3xl font-bold">{formatCurrency(imovel.preco)}</p>

      {/* Características */}
      <Card>
        <CardHeader>
          <CardTitle>Características</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex justify-center"><Bed className="h-5 w-5 text-muted-foreground" /></div>
              <p className="text-xl font-semibold">{imovel.quartos}</p>
              <p className="text-xs text-muted-foreground">Quartos</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center"><Bath className="h-5 w-5 text-muted-foreground" /></div>
              <p className="text-xl font-semibold">{imovel.banheiros}</p>
              <p className="text-xs text-muted-foreground">Banheiros</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center"><Car className="h-5 w-5 text-muted-foreground" /></div>
              <p className="text-xl font-semibold">{imovel.vagas}</p>
              <p className="text-xs text-muted-foreground">Vagas</p>
            </div>
            <div className="space-y-1">
              <div className="flex justify-center"><Heart className="h-5 w-5 text-muted-foreground" /></div>
              <p className="text-xl font-semibold">{totalFavoritos}</p>
              <p className="text-xs text-muted-foreground">Favoritos</p>
            </div>
          </div>

          {(imovel.areaTotal || imovel.areaUtil) && (
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
              {imovel.areaTotal && (
                <div>
                  <span className="text-muted-foreground">Área total: </span>
                  <span className="font-medium">{imovel.areaTotal} m²</span>
                </div>
              )}
              {imovel.areaUtil && (
                <div>
                  <span className="text-muted-foreground">Área útil: </span>
                  <span className="font-medium">{imovel.areaUtil} m²</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Descrição */}
      {imovel.descricao && (
        <Card>
          <CardHeader><CardTitle>Descrição</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{imovel.descricao}</p>
          </CardContent>
        </Card>
      )}

      {/* Informações */}
      <Card>
        <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo</span>
            <span className="font-medium">{imovel.tipo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Finalidade</span>
            <span className="font-medium">{imovel.finalidade.replace('_', ' ')}</span>
          </div>
          {imovel.dataConstrucao && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Construção</span>
              <span className="font-medium">{formatDate(imovel.dataConstrucao)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Publicado em</span>
            <span className="font-medium">{formatDate(imovel.criadoEm)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Ações — apenas para clientes autenticados com clienteId */}
      {isAuthenticated && isCliente && clienteId && (
        <div className="flex gap-3">
          {/* Botão Tenho interesse — abre dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <MessageSquare className="h-4 w-4" />
                Tenho interesse
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar interesse</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem ao corretor sobre este imóvel. O campo é opcional.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Ex: Gostaria de agendar uma visita para o próximo fim de semana."
                  rows={4}
                />
              </div>

              {registrarInteresse.error && (
                <p className="text-sm text-destructive">
                  Erro ao registrar interesse. Você já pode ter um interesse ativo neste imóvel.
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleInteresse} disabled={registrarInteresse.isPending}>
                  {registrarInteresse.isPending ? 'Enviando...' : 'Confirmar interesse'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Botão Favoritar */}
          <Button
            variant={isFavorito ? 'default' : 'outline'}
            onClick={handleFavorito}
            disabled={adicionarFavorito.isPending || removerFavorito.isPending}
          >
            <Heart className={isFavorito ? 'fill-current h-4 w-4' : 'h-4 w-4'} />
            {isFavorito ? 'Favoritado' : 'Favoritar'}
          </Button>
        </div>
      )}

      {/* Usuário autenticado mas sem clienteId (ex: admin/corretor) */}
      {isAuthenticated && !isCliente && (
        <p className="text-sm text-muted-foreground text-center border rounded-lg py-3">
          Ações de interesse e favorito estão disponíveis apenas para clientes.
        </p>
      )}

      {/* Não autenticado */}
      {!isAuthenticated && (
        <div className="text-center border rounded-lg py-4 space-y-2">
          <p className="text-sm text-muted-foreground">Faça login para favoritar ou registrar interesse.</p>
          <Button asChild size="sm">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
