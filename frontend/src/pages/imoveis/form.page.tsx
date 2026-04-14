import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCadastrarImovel, useEditarImovel, useImovel } from '@/features/imoveis/hooks/use-imoveis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { NativeSelect } from '@/components/ui/native-select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CadastrarImovelInput, TipoImovel, FinalidadeImovel, StatusImovel } from '@/types'

// ─── Estado inicial do formulário ─────────────────────────────────────────────

interface FormState {
  titulo: string
  tipo: TipoImovel
  finalidade: FinalidadeImovel
  status: StatusImovel
  descricao: string
  quartos: string
  banheiros: string
  vagas: string
  areaTotal: string
  areaUtil: string
  preco: string
  corretorResponsavelId: string
  dataConstrucao: string
  endCep: string
  endLogradouro: string
  endNumero: string
  endComplemento: string
  endBairro: string
  endCidade: string
  endEstado: string
}

const estadoInicial: FormState = {
  titulo: '', tipo: 'APARTAMENTO', finalidade: 'VENDA', status: 'DISPONIVEL',
  descricao: '', quartos: '0', banheiros: '0', vagas: '0',
  areaTotal: '', areaUtil: '', preco: '',
  corretorResponsavelId: '', dataConstrucao: '',
  endCep: '', endLogradouro: '', endNumero: '', endComplemento: '',
  endBairro: '', endCidade: '', endEstado: '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPayload(form: FormState): CadastrarImovelInput {
  return {
    titulo: form.titulo,
    tipo: form.tipo,
    finalidade: form.finalidade,
    descricao: form.descricao || undefined,
    quartos: Number(form.quartos),
    banheiros: Number(form.banheiros),
    vagas: Number(form.vagas),
    areaTotal: form.areaTotal ? Number(form.areaTotal) : undefined,
    areaUtil: form.areaUtil ? Number(form.areaUtil) : undefined,
    preco: Number(form.preco),
    corretorResponsavelId: form.corretorResponsavelId || undefined,
    dataConstrucao: form.dataConstrucao || undefined,
    endereco: {
      cep: form.endCep,
      logradouro: form.endLogradouro,
      numero: form.endNumero,
      complemento: form.endComplemento || undefined,
      bairro: form.endBairro,
      cidade: form.endCidade,
      estado: form.endEstado,
    },
  }
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function ImovelFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const navigate = useNavigate()

  const { data: imovelData, isLoading: loadingImovel } = useImovel(id ?? '')
  const cadastrar = useCadastrarImovel()
  const editar = useEditarImovel(id ?? '')

  const [form, setForm] = useState<FormState>(estadoInicial)

  // Pré-preenche o formulário no modo edição
  useEffect(() => {
    if (!imovelData) return
    const { imovel: v } = imovelData
    setForm({
      titulo: v.titulo,
      tipo: v.tipo,
      finalidade: v.finalidade,
      status: v.status,
      descricao: v.descricao ?? '',
      quartos: String(v.quartos),
      banheiros: String(v.banheiros),
      vagas: String(v.vagas),
      areaTotal: v.areaTotal ? String(v.areaTotal) : '',
      areaUtil: v.areaUtil ? String(v.areaUtil) : '',
      preco: String(v.preco),
      corretorResponsavelId: v.corretorResponsavelId ?? '',
      dataConstrucao: v.dataConstrucao ? v.dataConstrucao.split('T')[0] : '',
      endCep: v.endereco.cep,
      endLogradouro: v.endereco.logradouro,
      endNumero: v.endereco.numero,
      endComplemento: v.endereco.complemento ?? '',
      endBairro: v.endereco.bairro,
      endCidade: v.endereco.cidade,
      endEstado: v.endereco.estado,
    })
  }, [imovelData])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    set(e.target.name as keyof FormState, e.target.value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = buildPayload(form)

    if (isEditing) {
      editar.mutate({ ...payload, status: form.status }, {
        onSuccess: () => navigate(`/imoveis/${id}`),
      })
    } else {
      cadastrar.mutate(payload, {
        onSuccess: ({ imovel }) => navigate(`/imoveis/${imovel.id}`),
      })
    }
  }

  const isPending = cadastrar.isPending || editar.isPending
  const error = cadastrar.error || editar.error

  if (isEditing && loadingImovel) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/3" /><div className="h-64 bg-muted rounded" /></div>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to={isEditing ? `/imoveis/${id}` : '/imoveis'}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar imóvel' : 'Cadastrar imóvel'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
            Erro ao salvar. Verifique os dados e tente novamente.
          </p>
        )}

        {/* Informações básicas */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informações básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ex: Apartamento 3 quartos no centro" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <NativeSelect id="tipo" name="tipo" value={form.tipo} onChange={handleChange}>
                  <option value="APARTAMENTO">Apartamento</option>
                  <option value="CASA">Casa</option>
                  <option value="COMERCIAL">Comercial</option>
                  <option value="TERRENO">Terreno</option>
                  <option value="RURAL">Rural</option>
                  <option value="STUDIO">Studio</option>
                  <option value="COBERTURA">Cobertura</option>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalidade">Finalidade *</Label>
                <NativeSelect id="finalidade" name="finalidade" value={form.finalidade} onChange={handleChange}>
                  <option value="VENDA">Venda</option>
                  <option value="LOCACAO">Locação</option>
                  <option value="VENDA_LOCACAO">Venda ou Locação</option>
                </NativeSelect>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <NativeSelect id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="RESERVADO">Reservado</option>
                  <option value="VENDIDO">Vendido</option>
                  <option value="LOCADO">Locado</option>
                  <option value="INATIVO">Inativo</option>
                </NativeSelect>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$) *</Label>
              <Input id="preco" name="preco" type="number" min="0" step="0.01" value={form.preco} onChange={handleChange} placeholder="350000" required />
            </div>
          </CardContent>
        </Card>

        {/* Características */}
        <Card>
          <CardHeader><CardTitle className="text-base">Características</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quartos">Quartos *</Label>
                <Input id="quartos" name="quartos" type="number" min="0" value={form.quartos} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banheiros">Banheiros *</Label>
                <Input id="banheiros" name="banheiros" type="number" min="0" value={form.banheiros} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vagas">Vagas *</Label>
                <Input id="vagas" name="vagas" type="number" min="0" value={form.vagas} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="areaTotal">Área total (m²)</Label>
                <Input id="areaTotal" name="areaTotal" type="number" min="0" step="0.01" value={form.areaTotal} onChange={handleChange} placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="areaUtil">Área útil (m²)</Label>
                <Input id="areaUtil" name="areaUtil" type="number" min="0" step="0.01" value={form.areaUtil} onChange={handleChange} placeholder="100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataConstrucao">Ano de construção</Label>
              <Input id="dataConstrucao" name="dataConstrucao" type="date" value={form.dataConstrucao} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="endCep">CEP *</Label>
                <Input id="endCep" name="endCep" value={form.endCep} onChange={handleChange} placeholder="00000-000" required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="endLogradouro">Logradouro *</Label>
                <Input id="endLogradouro" name="endLogradouro" value={form.endLogradouro} onChange={handleChange} placeholder="Rua das Flores" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endNumero">Número *</Label>
                <Input id="endNumero" name="endNumero" value={form.endNumero} onChange={handleChange} placeholder="100" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endComplemento">Complemento</Label>
                <Input id="endComplemento" name="endComplemento" value={form.endComplemento} onChange={handleChange} placeholder="Apto 42" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endBairro">Bairro *</Label>
              <Input id="endBairro" name="endBairro" value={form.endBairro} onChange={handleChange} placeholder="Centro" required />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="endCidade">Cidade *</Label>
                <Input id="endCidade" name="endCidade" value={form.endCidade} onChange={handleChange} placeholder="São Paulo" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endEstado">Estado *</Label>
                <Input id="endEstado" name="endEstado" value={form.endEstado} onChange={handleChange} placeholder="SP" maxLength={2} required />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes adicionais */}
        <Card>
          <CardHeader><CardTitle className="text-base">Detalhes adicionais</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descreva o imóvel..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="corretorResponsavelId">ID do corretor responsável</Label>
              <Input id="corretorResponsavelId" name="corretorResponsavelId" value={form.corretorResponsavelId} onChange={handleChange} placeholder="UUID do corretor (opcional)" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link to={isEditing ? `/imoveis/${id}` : '/imoveis'}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar imóvel'}
          </Button>
        </div>
      </form>
    </div>
  )
}
