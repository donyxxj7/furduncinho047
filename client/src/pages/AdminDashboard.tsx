import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
  LogOut,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Busca os dados reais do backend unificado
  const { data: stats, isLoading: statsLoading } =
    trpc.admin.dashboard.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
      refetchInterval: 10000, // Atualiza a cada 10s para ver check-ins em tempo real
    });

  // Mutação de Logout Profissional
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Sessão encerrada com sucesso!", {
        description: "Até a próxima, administrador.",
        style: {
          background: "#000",
          color: "#a855f7",
          border: "1px solid #3b0764",
        },
      });
      // Força o redirecionamento e limpeza de estado
      window.location.href = "/";
    },
    onError: () => toast.error("Erro ao sair da conta."),
  });

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Card className="max-w-md w-full mx-4 bg-zinc-950 border-red-500/20 text-white">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle /> Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full bg-white/5 hover:bg-white/10">
                Voltar para Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      {/* Background Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Site
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              className="h-10 w-10 rounded-full border border-white/10 shadow-lg shadow-purple-500/20"
            />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">
              Diretoria 047
            </h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all gap-2"
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <LayoutDashboard className="h-8 w-8 text-purple-500" />
            <h2 className="text-3xl font-bold">Monitoramento</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Cards de Estatísticas com Design Neon */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-purple-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-gray-500">
                  Total Ingressos
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-4xl font-black">
                  {stats?.totalTickets || 0}
                </span>
                <Ticket className="h-8 w-8 text-purple-500 group-hover:scale-110 transition-transform" />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-yellow-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-gray-500">
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-4xl font-black text-yellow-500">
                  {stats?.pendingPayments || 0}
                </span>
                <Clock className="h-8 w-8 text-yellow-500 group-hover:animate-pulse" />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-green-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-gray-500">
                  Pagos / Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-4xl font-black text-green-500">
                  {stats?.paidTickets || 0}
                </span>
                <CheckCircle2 className="h-8 w-8 text-green-500 group-hover:scale-110 transition-transform" />
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono uppercase tracking-widest text-gray-500">
                  Check-ins Realizados
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-4xl font-black text-blue-500">
                  {stats?.totalCheckins || 0}
                </span>
                <Users className="h-8 w-8 text-blue-500 group-hover:scale-110 transition-transform" />
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping" />
            Ações da Portaria
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/admin/pagamentos">
              <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                      <Clock className="h-6 w-6" />
                    </div>
                    Validar Pagamentos
                  </CardTitle>
                  <CardDescription>
                    Aprovar comprovantes e liberar QR Codes
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/scanner">
              <Card className="bg-gradient-to-br from-zinc-900 to-black border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                      <Ticket className="h-6 w-6" />
                    </div>
                    Abrir Portaria (Scanner)
                  </CardTitle>
                  <CardDescription>
                    Validar ingressos via QR Code em tempo real
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
