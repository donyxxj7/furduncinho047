import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Check,
  X,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminPayments() {
  const { user, isAuthenticated } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [searchTerm, setSearchTerm] = useState(""); // Estado da pesquisa
  const utils = trpc.useUtils();

  const { data: payments, isLoading } = trpc.payments.listPending.useQuery(
    undefined,
    {
      enabled: isAuthenticated && user?.role === "admin",
    }
  );

  const approveMutation = trpc.payments.approve.useMutation({
    onSuccess: () => {
      toast.success("Pagamento aprovado! QR Code gerado.");
      utils.payments.listPending.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: err => toast.error("Erro ao aprovar: " + err.message),
  });

  const rejectMutation = trpc.payments.reject.useMutation({
    onSuccess: () => {
      toast.success("Pagamento rejeitado.");
      utils.payments.listPending.invalidate();
      utils.admin.dashboard.invalidate();
    },
  });

  // --- LÓGICA DE FILTRO POR NOME ---
  const filteredPayments = payments?.filter(
    payment =>
      payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.ticketId.toString().includes(searchTerm)
  );
  // ---------------------------------

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-purple-500" />
      </div>
    );
  }

  if (user?.role !== "admin")
    return <div className="p-10 text-center text-white">Acesso Negado</div>;

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <img src={APP_LOGO} className="h-8 w-8 rounded-full" />
            Aprovação de Pagamentos
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* --- CAMPO DE PESQUISA --- */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input
            placeholder="Pesquisar por nome completo ou ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 rounded-xl"
          />
        </div>
        {/* ------------------------- */}

        {filteredPayments && filteredPayments.length > 0 ? (
          <div className="space-y-4">
            {filteredPayments.map(payment => (
              <Card
                key={payment.id}
                className="bg-white/5 border-white/10 overflow-hidden hover:border-purple-500/50 transition-colors"
              >
                <CardContent className="p-0 flex flex-col md:flex-row">
                  {/* Área da Imagem (Comprovante) */}
                  <div className="w-full md:w-48 h-48 md:h-auto bg-black/50 relative group border-b md:border-b-0 md:border-r border-white/10 shrink-0">
                    {payment.comprovantePath ? (
                      <>
                        <img
                          src={payment.comprovantePath}
                          alt="Comprovante"
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <a
                          href={payment.comprovantePath}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-black/50 border-white/30 text-white"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> Ver
                            Original
                          </Button>
                        </a>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                        Sem imagem
                      </div>
                    )}
                  </div>

                  {/* Dados e Ações */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {payment.user?.name || "Usuário Desconhecido"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {payment.user?.email}
                          </p>
                        </div>
                        <span className="bg-yellow-500/10 text-yellow-500 text-xs font-mono px-2 py-1 rounded border border-yellow-500/20">
                          TICKET #{payment.ticketId}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Enviado em:{" "}
                        {new Date(payment.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 justify-end">
                      <Button
                        variant="destructive"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500"
                        onClick={() => {
                          const reason = prompt(
                            "Motivo da rejeição (opcional):"
                          );
                          rejectMutation.mutate({
                            paymentId: payment.id,
                            reason: reason || undefined,
                          });
                        }}
                        disabled={
                          rejectMutation.isPending || approveMutation.isPending
                        }
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        Rejeitar
                      </Button>

                      <Button
                        className="bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                        onClick={() =>
                          approveMutation.mutate({ paymentId: payment.id })
                        }
                        disabled={
                          rejectMutation.isPending || approveMutation.isPending
                        }
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Aprovar Pagamento
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/5 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-300">Tudo limpo!</h3>
            <p className="text-gray-500">
              Nenhum pagamento pendente encontrado
              {searchTerm && " com esse nome"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
