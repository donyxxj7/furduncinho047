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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  UploadCloud,
  MessageCircle,
  Download,
  Maximize2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const PIX_INFO = {
  chave: "47996979192",
  nome: "Endony Paradela Rodrigues",
  banco: "Mercado Pago",
};

export default function BuyTicket() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // ESTADO DO COOLER: Gerencia a escolha do usuário
  const [includeCooler, setIncludeCooler] = useState(false);

  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: data => {
      if (data.success && data.ticketId) {
        setCreatedTicketId(data.ticketId);
        setIsSuccessOpen(true);
        toast.success("Pedido gerado com sucesso!");
      }
    },
    onError: error => toast.error(error.message || "Erro ao criar ingresso"),
  });

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_INFO.chave);
    toast.success("Chave PIX copiada!");
  };

  const handleDownloadQR = () => {
    const link = document.createElement("a");
    link.href = "/qr-payment.jpg";
    link.download = "furduncinho-pix-qr.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code baixado!");
  };

  const getWhatsAppLink = (phone: string, id: number) => {
    const text = `Olá, segue o ID do meu pagamento para o Furduncinho047: Pedido #${id}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  // CÁLCULO DINÂMICO DO TOTAL
  const totalAmount = includeCooler ? 70 : 30;

  if (authLoading || ticketsLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-black/40 border-white/10 text-white backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Faça Login</CardTitle>
            <CardDescription className="text-gray-400">
              Você precisa estar logado para comprar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full bg-purple-600 hover:bg-purple-500 font-bold h-12"
            >
              <Link href="/login">Entrar na Conta</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasPendingOrPaid = tickets?.some(
    t => t.status === "pending" || t.status === "paid"
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-900/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
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
              alt="Logo"
              className="h-10 w-10 rounded-full border border-white/10"
            />
            <h1 className="text-xl font-bold text-white tracking-wider">
              FURDUNCINHO<span className="text-purple-500">047</span>
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            GARANTIR INGRESSO
          </h2>

          {hasPendingOrPaid ? (
            <Card className="bg-white/5 border-purple-500/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-6 w-6 text-green-500" /> Você já
                  tem um ingresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Acesse seus ingressos para ver o status ou enviar o
                  comprovante.
                </p>
                <Link href="/meus-ingressos">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 h-12 text-lg">
                    Ver Meus Ingressos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* OPÇÃO DE COOLER */}
              <Card
                onClick={() => setIncludeCooler(!includeCooler)}
                className={`bg-white/5 backdrop-blur-xl mb-6 text-white cursor-pointer border transition-all hover:scale-[1.01] ${
                  includeCooler
                    ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    : "border-white/10"
                }`}
              >
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-lg">
                      Taxa de Cooler (Opcional)
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Leve suas próprias bebidas por + R$ 40,00
                    </CardDescription>
                  </div>
                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${includeCooler ? "bg-purple-500 border-purple-400" : "border-white/20"}`}
                  >
                    {includeCooler && (
                      <div className="h-2 w-2 bg-white rounded-full" />
                    )}
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6 text-white">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 py-3">
                    <span className="text-gray-400">Ingresso Access</span>
                    <span className="font-bold text-white">R$ 30,00</span>
                  </div>
                  {includeCooler && (
                    <div className="flex justify-between border-b border-white/10 py-3">
                      <span className="text-gray-400">Taxa de Cooler</span>
                      <span className="font-bold text-white">R$ 40,00</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-3xl font-black text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      R$ {totalAmount},00
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
                <CardHeader>
                  <CardTitle>Pagamento via PIX</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-black/40 p-6 rounded-xl border border-purple-500/30 text-center">
                    <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest font-semibold">
                      Chave PIX (Celular)
                    </p>
                    <div className="flex items-center gap-2 justify-center mb-2">
                      <code className="text-2xl md:text-3xl font-mono font-bold text-white select-all break-all">
                        {PIX_INFO.chave}
                      </code>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={handleCopyPix}
                        className="h-10 w-10 shrink-0 rounded-full bg-purple-600 hover:bg-purple-500 text-white border-0"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-purple-300">
                      {PIX_INFO.nome} • {PIX_INFO.banco}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div
                        className="p-3 bg-white rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105"
                        onClick={() => window.open("/qr-payment.jpg", "_blank")}
                      >
                        <img
                          src="/qr-payment.jpg"
                          alt="QR Code"
                          className="max-w-[180px] rounded"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                          <Maximize2 className="text-white h-8 w-8" />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadQR}
                        className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <Download className="mr-2 h-4 w-4" /> Baixar Imagem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open("/qr-payment.jpg", "_blank")}
                        className="border-white/20 text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <Maximize2 className="mr-2 h-4 w-4" /> Ampliar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02] border border-green-400/30"
                // CORREÇÃO: Passando o objeto com a escolha do cooler
                onClick={() =>
                  createTicketMutation.mutate({ hasCooler: includeCooler })
                }
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending
                  ? "Gerando Pedido..."
                  : "JÁ FIZ O PIX, CONFIRMAR"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="bg-black/90 border border-purple-500/50 text-white backdrop-blur-xl w-[95%] rounded-2xl max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader className="text-center pt-4">
            <div className="mx-auto mb-4 bg-green-500/20 p-4 rounded-full w-fit border border-green-500/50">
              <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-green-500" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-black text-white">
              PEDIDO GERADO!
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm md:text-base">
              Envie o <strong>ID do Pedido</strong> para um dos administradores
              abaixo para notificar o pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
              <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest mb-1">
                Seu ID do Pedido
              </p>
              <p className="text-3xl md:text-4xl font-mono font-bold text-purple-400 tracking-wider">
                #{createdTicketId}
              </p>
            </div>

            <div className="grid gap-2">
              <p className="text-xs md:text-sm font-semibold text-center text-gray-300 mb-1">
                Enviar ID para:
              </p>

              <Button
                asChild
                variant="outline"
                className="h-10 md:h-12 w-full justify-start gap-3 border-white/10 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all"
              >
                <a
                  href={getWhatsAppLink("5547992618136", createdTicketId || 0)}
                  target="_blank"
                >
                  <MessageCircle className="h-5 w-5" /> Ruan
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-10 md:h-12 w-full justify-start gap-3 border-white/10 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all"
              >
                <a
                  href={getWhatsAppLink("5547996979192", createdTicketId || 0)}
                  target="_blank"
                >
                  <MessageCircle className="h-5 w-5" /> Rosario
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-10 md:h-12 w-full justify-start gap-3 border-white/10 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 transition-all"
              >
                <a
                  href={getWhatsAppLink("5547999590746", createdTicketId || 0)}
                  target="_blank"
                >
                  <MessageCircle className="h-5 w-5" /> Gaba
                </a>
              </Button>
            </div>

            <div className="w-full border-t border-white/10 my-2"></div>

            <Button
              onClick={() =>
                setLocation(`/enviar-comprovante/${createdTicketId}`)
              }
              className="w-full h-auto py-4 text-sm md:text-base font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] transition-all hover:scale-[1.02] border border-purple-400/50 whitespace-normal leading-tight"
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 shrink-0" />
                <span>QUERO ANEXAR O COMPROVANTE AGORA</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
