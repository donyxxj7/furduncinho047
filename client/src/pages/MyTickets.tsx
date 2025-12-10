import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
// --- CORREÇÃO AQUI: Adicionado "Ticket" na importação ---
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UploadCloud,
  Ticket,
} from "lucide-react";
import { Link } from "wouter";

export default function MyTickets() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  if (authLoading || ticketsLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white relative">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full"></div>
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
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              className="h-10 w-10 rounded-full border border-white/10"
            />
            <h1 className="text-xl font-bold">Meus Ingressos</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {tickets && tickets.length > 0 ? (
            <div className="grid gap-6">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all hover:bg-white/10"
                >
                  {/* Faixa decorativa lateral */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-2 ${
                      ticket.status === "paid"
                        ? "bg-green-500 shadow-[0_0_15px_#22c55e]"
                        : ticket.status === "pending"
                          ? "bg-yellow-500 shadow-[0_0_15px_#eab308]"
                          : ticket.status === "used"
                            ? "bg-blue-500"
                            : "bg-red-500"
                    }`}
                  ></div>

                  <div className="p-6 pl-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                          ID: #{ticket.id.toString().padStart(4, "0")}
                        </span>
                        {ticket.status === "paid" && (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                            APROVADO
                          </span>
                        )}
                        {ticket.status === "pending" && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                            PENDENTE
                          </span>
                        )}
                        {ticket.status === "used" && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                            UTILIZADO
                          </span>
                        )}
                        {ticket.paymentStatus === "rejected" && (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                            REJEITADO
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Ingresso Furduncinho047
                      </h3>
                      <p className="text-gray-400 text-sm">
                        07/03/2026 • Local a definir
                      </p>

                      {ticket.paymentStatus === "rejected" && (
                        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <div>
                            <strong>Motivo da recusa:</strong>{" "}
                            {ticket.rejectionReason || "Comprovante inválido."}
                            <div className="mt-1 text-xs opacity-80">
                              Por favor, envie um novo comprovante válido.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      {ticket.status === "paid" && ticket.qrImagePath && (
                        <div className="bg-white p-2 rounded-lg mx-auto">
                          <img
                            src={ticket.qrImagePath}
                            alt="QR Code"
                            className="h-32 w-32 object-contain"
                          />
                        </div>
                      )}

                      {ticket.status === "pending" && (
                        <Link href={`/enviar-comprovante/${ticket.id}`}>
                          <Button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            {ticket.paymentStatus === "rejected"
                              ? "Reenviar Comprovante"
                              : "Enviar Comprovante"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Você não tem ingressos
              </h3>
              <p className="text-gray-400 mb-6">
                Garanta sua presença no maior evento do ano.
              </p>
              <Link href="/comprar">
                <Button className="bg-purple-600 hover:bg-purple-500">
                  Comprar Agora
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
