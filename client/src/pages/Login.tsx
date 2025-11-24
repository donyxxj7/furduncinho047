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
import { LogIn } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: data => {
      toast.success("Login realizado com sucesso!");
      utils.auth.me.setData(undefined, data.user);
      setLocation("/");
    },
    onError: error => {
      // Agora, isso vai funcionar e mostrar a mensagem do backend
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta para ver seus ingressos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                // --- A CORREÇÃO ESTÁ AQUI ---
                onChange={e => setEmail(e.target.value)} // Era e.g.value
                // --- FIM DA CORREÇÃO ---
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Crie uma agora
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
