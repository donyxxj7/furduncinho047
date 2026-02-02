import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Ticket,
  Clock,
  Loader2,
  Download,
  Maximize2,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function MyTickets() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR Code salvo!");
    } catch (error) {
      window.open(url, "_blank");
      toast.info("Imagem aberta. Segure para salvar.");
    }
  };

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
              {tickets.map(ticket => {
                // CORREÇÃO: Acessando o status de dentro do objeto payment
                const paymentStatus = ticket.payment?.status;
                const rejectionReason = ticket.payment?.rejectionReason;

                const isUnderReview =
                  ticket.status === "pending" && paymentStatus === "pending";
                const isRejected = paymentStatus === "rejected";
                const isPaid = ticket.status === "paid";
                const isUsed = ticket.status === "used";
                const isWaiting = ticket.status === "pending" && !paymentStatus;

                return (
                  <div
                    key={ticket.id}
                    className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all"
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-2 ${
                        isPaid
                          ? "bg-green-500 shadow-[0_0_15px_#22c55e]"
                          : isUnderReview
                            ? "bg-blue-500 shadow-[0_0_15px_#3b82f6]"
                            : isUsed
                              ? "bg-gray-500"
                              : isRejected
                                ? "bg-red-500"
                                : "bg-yellow-500 shadow-[0_0_15px_#eab308]"
                      }`}
                    ></div>

                    <div className="p-6 pl-8 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                            ID: #{ticket.id.toString().padStart(4, "0")}
                          </span>
                          {isPaid && (
                            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> APROVADO
                            </span>
                          )}
                          {isUnderReview && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                              <Clock className="h-3 w-3 animate-pulse" /> EM
                              ANÁLISE
                            </span>
                          )}
                          {isWaiting && (
                            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> AGUARDANDO
                              ENVIO
                            </span>
                          )}
                          {isUsed && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs font-bold">
                              UTILIZADO
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
                              REJEITADO
                            </span>
                          )}
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-1">
                          Ingresso Furduncinho047
                        </h3>
                        <p className="text-gray-400 text-sm">
                          07/02/2026 • Ilha Dourada
                        </p>

                        {/* TAXA DE COOLER */}
                        <div className="mt-2 text-xs font-semibold uppercase tracking-wider">
                          {ticket.hasCooler ? (
                            <span className="text-purple-400">
                              Com taxa de Cooler (R$ 70,00)
                            </span>
                          ) : (
                            <span className="text-gray-500">
                              Ingresso Individual (R$ 30,00)
                            </span>
                          )}
                        </div>

                        {isRejected && (
                          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                              <strong>Motivo:</strong>{" "}
                              {rejectionReason || "Comprovante inválido."}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px] items-center">
                        {isPaid && ticket.qrImagePath && (
                          <div className="flex flex-col gap-3 w-full">
                            <div
                              className="bg-white p-3 rounded-xl mx-auto shadow-lg cursor-zoom-in hover:scale-105 transition-transform group relative"
                              onClick={() =>
                                setZoomedImage(ticket.qrImagePath!)
                              }
                            >
                              <img
                                src={ticket.qrImagePath}
                                alt="QR Code"
                                className="h-32 w-32 object-contain"
                              />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                <Maximize2 className="text-black drop-shadow-md h-8 w-8" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 w-full">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-gray-300 h-9 text-xs"
                                onClick={() =>
                                  handleDownloadImage(
                                    ticket.qrImagePath!,
                                    `ingresso-${ticket.id}.png`
                                  )
                                }
                              >
                                <Download className="h-3 w-3 mr-1" /> Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-gray-300 h-9 text-xs"
                                onClick={() =>
                                  setZoomedImage(ticket.qrImagePath!)
                                }
                              >
                                <Maximize2 className="h-3 w-3 mr-1" /> Ampliar
                              </Button>
                            </div>
                          </div>
                        )}

                        {ticket.status === "pending" && (
                          <Link href={`/enviar-comprovante/${ticket.id}`}>
                            <Button
                              className={`w-full text-white shadow-lg transition-all ${isUnderReview ? "bg-blue-600 hover:bg-blue-500" : "bg-yellow-600 hover:bg-yellow-500"}`}
                            >
                              <UploadCloud className="mr-2 h-4 w-4" />{" "}
                              {isRejected
                                ? "Reenviar"
                                : isUnderReview
                                  ? "Reenviar (Correção)"
                                  : "Enviar Comprovante"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
              <Ticket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Você não tem ingressos
              </h3>
              <p className="text-gray-400 mb-6">Garanta sua presença agora.</p>
              <Link href="/comprar">
                <Button className="bg-purple-600">Comprar Agora</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="bg-white p-6 max-w-sm rounded-3xl border-0 shadow-2xl flex flex-col items-center outline-none">
          <div className="mb-4 text-center">
            <h3 className="text-black font-bold text-xl">Seu Ingresso</h3>
            <p className="text-gray-500 text-sm">Apresente na entrada</p>
          </div>
          {zoomedImage && (
            <img
              src={zoomedImage}
              alt="QR Zoom"
              className="w-full h-auto rounded-lg"
            />
          )}
          <Button
            className="mt-6 w-full rounded-xl bg-black text-white h-12"
            onClick={() => setZoomedImage(null)}
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
