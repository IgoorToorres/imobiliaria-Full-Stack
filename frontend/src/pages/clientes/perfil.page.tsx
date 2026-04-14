import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, User, Heart, MessageSquare } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import {
  useEditarCliente,
  useFavoritos,
  useRemoverFavorito,
  useInteressesCliente,
} from '@/features/clientes/hooks/use-clientes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { StatusInteresse } from '@/types'

const statusInteresseLabel: Record<StatusInteresse, string> = {
  PENDENTE: 'Pendente',
  EM_ATENDIMENTO: 'Em atendimento',
  AGENDADO: 'Agendado',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
}

const statusInteresseVariant: Record<StatusInteresse, 'default' | 'success' | 'warning' | 'secondary' | 'outline' | 'destructive'> = {
  PENDENTE: 'warning',
  EM_ATENDIMENTO: 'default',
  AGENDADO: 'success',
  FINALIZADO: 'secondary',
  CANCELADO: 'destructive',
}

export function ClientePerfilPage() {
  const { usuario, clienteId } = useAuthStore()
  const editar = useEditarCliente(clienteId ?? '')

  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nome: usuario?.nome ?? '',
    telefone: '',
    profissao: '',
  })

  const { data: favoritosData, isLoading: loadingFavoritos } = useFavoritos(clienteId ?? '')
  const removerFavorito = useRemoverFavorito(clienteId ?? '')
  const { data: interessesData, isLoading: loadingInteresses } = useInteressesCliente(clienteId ?? '')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    editar.mutate(
      { nome: form.nome, telefone: form.telefone || undefined, profissao: form.profissao || undefined },
      { onSuccess: () => setEditando(false) },
    )
  }

  if (!clienteId) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground space-y-2">
            <User className="h-8 w-8 mx-auto opacity-40" />
            <p>Informações de perfil não disponíveis para esta sessão.</p>
            <p className="text-xs">Faça o cadastro pelo app para acessar favoritos e interesses.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Minha conta</h1>

      {/* Dados pessoais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Dados pessoais</CardTitle>
          {!editando && (
            <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editando ? (
            <form onSubmit={handleSalvar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} placeholder="11987654321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profissao">Profissão</Label>
                <Input id="profissao" name="profissao" value={form.profissao} onChange={handleChange} placeholder="Engenheiro, Médico..." />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={editar.isPending}>
                  {editar.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setEditando(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{usuario?.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">E-mail</span>
                <span className="font-medium">{usuario?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perfil</span>
                <span className="font-medium">{usuario?.perfil}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favoritos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Imóveis favoritos
            {favoritosData && (
              <Badge variant="secondary">{favoritosData.favoritos.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingFavoritos ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : favoritosData?.favoritos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum imóvel favoritado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {favoritosData?.favoritos.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <Link
                      to={`/imoveis/${fav.imovelId}`}
                      className="text-sm font-medium hover:underline underline-offset-4"
                    >
                      Ver imóvel
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Favoritado em {formatDate(fav.criadoEm)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={removerFavorito.isPending}
                    onClick={() => removerFavorito.mutate(fav.imovelId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interesses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Meus interesses
            {interessesData && (
              <Badge variant="secondary">{interessesData.interesses.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInteresses ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
            </div>
          ) : interessesData?.interesses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum interesse registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {interessesData?.interesses.map((interesse) => (
                <div key={interesse.id} className="p-3 rounded-lg border space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/imoveis/${interesse.imovelId}`}
                      className="text-sm font-medium hover:underline underline-offset-4"
                    >
                      Ver imóvel
                    </Link>
                    <Badge variant={statusInteresseVariant[interesse.status]}>
                      {statusInteresseLabel[interesse.status]}
                    </Badge>
                  </div>
                  {interesse.mensagem && (
                    <p className="text-xs text-muted-foreground italic">"{interesse.mensagem}"</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Registrado em {formatDate(interesse.criadoEm)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
