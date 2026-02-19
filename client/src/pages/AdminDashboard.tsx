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
  QrCode,
  Receipt,
  Settings,
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
      toast.success("Reset concluído!", {
        description: "IDs reiniciados para #1 e dados limpos.",
      });
      setIsResetModalOpen(false);
      refetch();
    },
    onError: err => toast.error("Falha no reset: " + err.message),
  });

  if (authLoading || statsLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500 h-12 w-12" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 pb-20">
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
            className="text-gray-400 hover:text-red-400 gap-2"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* ESTATÍSTICAS COM NOMES FIXOS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* TOTAL INGRESSOS */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                      Total Ingressos
                    </p>
                    <span className="text-4xl font-black">
                      {stats?.totalTickets ?? 0}
                    </span>
                  </div>
                  <Ticket className="text-purple-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* PENDENTES */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                      Pendentes
                    </p>
                    <span className="text-4xl font-black text-yellow-500">
                      {stats?.pendingPayments ?? 0}
                    </span>
                  </div>
                  <Clock className="text-yellow-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* APROVADOS */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                      Aprovados
                    </p>
                    <span className="text-4xl font-black text-green-500">
                      {stats?.paidTickets ?? 0}
                    </span>
                  </div>
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* CHECK-INS */}
            <Card className="bg-white/5 border-white/10 text-white">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                      Check-ins
                    </p>
                    <span className="text-4xl font-black text-blue-500">
                      {stats?.totalCheckins ?? 0}
                    </span>
                  </div>
                  <Users className="text-blue-500 h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestão */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2 uppercase tracking-tighter">
              <LayoutDashboard className="h-5 w-5" /> Gestão Operacional
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/admin/pagamentos">
                <Card className="bg-zinc-900 border-white/10 hover:border-purple-500/50 cursor-pointer transition-all p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                      <Receipt className="text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold">Pagamentos</p>
                      <p className="text-xs text-gray-500">Validar Pix</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/scanner">
                <Card className="bg-zinc-900 border-white/10 hover:border-blue-500/50 cursor-pointer transition-all p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                      <QrCode className="text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold">Scanner</p>
                      <p className="text-xs text-gray-500">Portaria</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/admin/configuracoes">
                <Card className="bg-zinc-900 border-white/10 hover:border-orange-500/50 cursor-pointer transition-all p-4 group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                      <Settings className="text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold">Configurar</p>
                      <p className="text-xs text-gray-500">Preços e Data</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div className="p-8 border-2 border-red-500/20 bg-red-500/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-red-500 text-xl uppercase tracking-tighter">
                  Zona de Perigo
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Apaga tickets, pagamentos e clientes comuns.
                  <strong> Os IDs voltarão a começar do #1.</strong>
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsResetModalOpen(true)}
              className="bg-red-600 font-bold px-10 h-14 rounded-xl shadow-lg shadow-red-600/20 hover:scale-105 transition-transform"
            >
              <Trash2 className="mr-2 h-5 w-5" /> RESETAR TUDO
            </Button>
          </div>
        </div>
      </main>

      {/* Modal Reset */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="bg-zinc-950 border-red-500/30 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-red-500 text-2xl font-black uppercase tracking-tighter">
              Ação Irreversível
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Isso apagará permanentemente todos os tickets e reiniciará a
              contagem de pedidos. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsResetModalOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 font-black px-6 rounded-xl"
              onClick={() => resetMutation.mutate()}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "CONFIRMAR LIMPEZA TOTAL"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
