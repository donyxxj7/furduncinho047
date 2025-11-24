import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const registerMutation = trpc.auth.register.useMutation({
    // --- LÓGICA CORRETA E RÁPIDA ---
    onSuccess: data => {
      toast.success("Conta criada com sucesso! Você foi logado.");

      // 1. Atualizamos o cache do 'auth.me' manualmente.
      utils.auth.me.setData(undefined, data.user);

      // 2. Redirecionamos. A Home vai ler este cache.
      setLocation("/");
    },
    // --- FIM DA LÓGICA ---
    onError: error => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost">← Voltar para Home</Button>
        </Link>
      </div>

      <Card className="max-w-md w-full mx-4 border-primary/20">
        <CardHeader className="text-center">
          <img
            src={APP_LOGO}
            alt="Furduncinho047"
            className="w-20 h-20 mx-auto rounded-full mb-4"
          />
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>
            Crie sua conta para comprar seu ingresso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha (mínimo 6 caracteres)</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Faça o login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
