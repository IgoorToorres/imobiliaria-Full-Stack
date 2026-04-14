import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useRecuperarSenha } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function RecuperarSenhaPage() {
  const [email, setEmail] = useState('')
  const recuperar = useRecuperarSenha()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    recuperar.mutate({ email })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Building2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Recuperar senha</CardTitle>
          <CardDescription>Informe seu e-mail para receber o token de recuperação</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {recuperar.isSuccess && (
              <p className="text-sm text-green-600 text-center">
                Token gerado com sucesso. Verifique seu e-mail.
              </p>
            )}

            {recuperar.error && (
              <p className="text-sm text-destructive text-center">
                E-mail não encontrado.
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={recuperar.isPending}>
              {recuperar.isPending ? 'Enviando...' : 'Enviar'}
            </Button>
            <Link
              to="/login"
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary text-center"
            >
              Voltar ao login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
