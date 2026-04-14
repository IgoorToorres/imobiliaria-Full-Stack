import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useCadastrarCliente } from '@/features/clientes/hooks/use-clientes'
import { useLogin } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function CadastroPage() {
  const navigate = useNavigate()
  const cadastrar = useCadastrarCliente()
  const login = useLogin()
  const setClienteId = useAuthStore((s) => s.setClienteId)

  const [form, setForm] = useState({ nome: '', email: '', senha: '', telefone: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    cadastrar.mutate(form, {
      onSuccess: ({ clienteId }) => {
        setClienteId(clienteId)
        login.mutate(
          { email: form.email, senha: form.senha },
          { onSuccess: () => navigate('/dashboard') },
        )
      },
    })
  }

  const isLoading = cadastrar.isPending || login.isPending

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>Preencha os dados para se cadastrar</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {cadastrar.error && (
              <p className="text-sm text-destructive text-center">
                Erro ao cadastrar. Verifique os dados.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" name="nome" placeholder="João Silva" value={form.nome} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" name="telefone" placeholder="11987654321" value={form.telefone} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input id="senha" name="senha" type="password" placeholder="••••••" value={form.senha} onChange={handleChange} required minLength={6} />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Já tem conta?{' '}
              <Link to="/login" className="underline underline-offset-4 hover:text-primary">
                Entrar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
