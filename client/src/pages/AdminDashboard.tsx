import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  Users,
  LogOut,
  Loader2,
  LayoutDashboard,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch,
  } = trpc.admin.dashboard.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Sessão encerrada!");
      window.location.href = "/";
    },
  });

  const resetMutation = trpc.admin.resetData.useMutation({
    onSuccess: () => {
      toast.success("Banco de dados resetado com sucesso!", {
        description: "Apenas administradores foram mantidos.",
      });
      setIsResetModalOpen(false);
      refetch(); // Atualiza os números na tela
    },
    onError: err => toast.error("Falha no reset: " + err.message),
  });

  if (authLoading || statsLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Site
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              className="h-10 w-10 rounded-full border border-white/10"
            />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-400">
              Diretoria 047
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            className="text-gray-400 hover:text-red-400 gap-2"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Estatísticas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-white/5 border-white/10 text-white hover:border-purple-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-500">
                  TOTAL INGRESSOS
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-4xl font-black">
                  {stats?.totalTickets || 0}
                </span>
                <Ticket className="text-purple-500" />
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white hover:border-yellow-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-500">
                  PENDENTES
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-4xl font-black text-yellow-500">
                  {stats?.pendingPayments || 0}
                </span>
                <Clock className="text-yellow-500" />
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white hover:border-green-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-500">
                  APROVADOS
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-4xl font-black text-green-500">
                  {stats?.paidTickets || 0}
                </span>
                <CheckCircle2 className="text-green-500" />
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white hover:border-blue-500/50 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-gray-500">
                  CHECK-INS
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-4xl font-black text-blue-500">
                  {stats?.totalCheckins || 0}
                </span>
                <Users className="text-blue-500" />
              </CardContent>
            </Card>
          </div>

          {/* Zona de Perigo */}
          <div className="p-8 border-2 border-red-500/20 bg-red-500/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-500">
                  Zona de Perigo
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Apaga todos os ingressos, pagamentos e usuários comuns. Apenas
                  administradores serão mantidos.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setIsResetModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 font-bold px-10"
            >
              <Trash2 className="mr-2 h-5 w-5" /> RESETAR TUDO
            </Button>
          </div>
        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO DO RESET */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="bg-zinc-950 border-red-500/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-red-500">
              CONFIRMAR RESET?
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Essa ação é irreversível. Todos os ingressos vendidos e
              comprovantes enviados serão deletados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsResetModalOpen(false)}
              className="text-gray-400"
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 font-bold"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "SIM, APAGAR AGORA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
