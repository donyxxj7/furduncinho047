import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cpf: z
    .string()
    .min(14, "CPF incompleto") // 14 caracteres considerando pontos e traço
    .max(14, "CPF inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    setValue, // Adicionado para atualizar o valor mascarado
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  // FUNÇÃO DE MÁSCARA: Transforma números em formato CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
    if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos

    // Aplica a formatação 000.000.000-00
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

    setValue("cpf", value, { shouldValidate: true }); // Atualiza o campo no formulário
  };

  const mutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Entrando...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    },
    onError: error => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <Card className="w-full max-w-md bg-zinc-950/50 border-purple-500/20 backdrop-blur-xl relative z-10 shadow-[0_0_50px_rgba(0,0,0,1)]">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <UserPlus className="h-8 w-8 text-purple-500 drop-shadow-[0_0_10px_#a855f7]" />
          </div>
          <CardTitle className="text-2xl font-black italic text-white text-center tracking-tighter">
            CRIAR CONTA
          </CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Entre para o time Furduncinho 047
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(data => mutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400">
                Nome Completo
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="bg-white/5 border-zinc-800 focus:border-purple-500 transition-all placeholder:text-zinc-700"
                placeholder="Ex: João da Silva"
              />
              {errors.name && (
                <p className="text-purple-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="bg-white/5 border-zinc-800 focus:border-purple-500 transition-all placeholder:text-zinc-700"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="text-purple-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-zinc-400">
                CPF
              </Label>
              <Input
                id="cpf"
                {...register("cpf")}
                onChange={handleCpfChange} // <--- CHAMADA DA MÁSCARA
                maxLength={14}
                className="bg-white/5 border-zinc-800 focus:border-purple-500 transition-all placeholder:text-zinc-700"
                placeholder="000.000.000-00"
              />
              {errors.cpf && (
                <p className="text-purple-500 text-xs mt-1">
                  {errors.cpf.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="bg-white/5 border-zinc-800 focus:border-purple-500 transition-all placeholder:text-zinc-700"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="text-purple-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-12 mt-6 rounded-none transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "FINALIZAR CADASTRO"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-purple-500 hover:underline font-bold"
            >
              Faça login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
