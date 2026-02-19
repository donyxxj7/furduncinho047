import { useAuth } from "@/_core/hooks/useAuth";
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
import { Loader2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao entrar");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luzes de Fundo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(147,51,234,0.1)] relative z-10">
        <CardHeader className="text-center pb-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4 text-gray-400 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mx-auto mb-4 relative group">
            <div className="absolute inset-0 bg-purple-600 blur rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src={APP_LOGO}
              alt="Logo"
              className="h-16 w-16 rounded-full border border-white/10 relative"
            />
          </div>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Acessar Painel
          </CardTitle>
          <CardDescription className="text-gray-400">
            Entre na sua conta Furduncinho047
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Email</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Senha</Label>
            <Input
              type="password"
              placeholder="••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>
          <Button
            className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] border border-purple-400/20 mt-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Não tem conta?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold underline decoration-purple-500/30 underline-offset-4"
            >
              Criar agora
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
