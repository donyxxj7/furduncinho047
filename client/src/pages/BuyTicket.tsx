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
  Loader2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

const PIX_INFO = {
  chave: "47996979192",
  nome: "Matheus Vinicius Do Rosário",
  banco: "Mercado Pago",
};

export default function BuyTicket() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [includeCooler, setIncludeCooler] = useState(false);

  // Busca as configurações reais (Preços e Taxas) do seu banco Neon
  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();
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

  // CÁLCULO DINÂMICO: Transforma centavos do banco em Reais
  const precoBase = settings?.priceNormal ?? 3000;
  const precoCooler = settings?.priceCooler ?? 7000;
  const taxaServico = settings?.serviceFee ?? 0; // Se for 0 no Admin, soma 0 aqui

  // A SOMA QUE NÃO ERRA: Acumula todos os valores habilitados
  const totalEmCentavos =
    precoBase + taxaServico + (includeCooler ? precoCooler : 0);
  const totalAmount = totalEmCentavos / 100;

  if (authLoading || ticketsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
      </div>
    );
  }

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
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400">
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
            <h1 className="text-xl font-bold text-white tracking-wider uppercase">
              Furduncinho<span className="text-purple-500">047</span>
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 uppercase">
            Garantir Ingresso
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
              {/* Opção de Cooler */}
              {settings?.allowCooler && (
                <Card
                  onClick={() => setIncludeCooler(!includeCooler)}
                  className={`bg-white/5 backdrop-blur-xl mb-6 text-white cursor-pointer border transition-all ${includeCooler ? "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "border-white/10"}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div>
                      <CardTitle className="text-lg">
                        Taxa de Cooler (Opcional)
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Leve suas próprias bebidas por + R${" "}
                        {(precoCooler / 100).toFixed(2).replace(".", ",")}
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
              )}

              {/* Resumo Dinâmico */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl mb-6 text-white">
                <CardHeader>
                  <CardTitle className="text-purple-300">
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 py-3">
                    <span className="text-gray-400">Ingresso Access</span>
                    <span className="font-bold text-white">
                      R$ {(precoBase / 100).toFixed(2).replace(".", ",")}
                    </span>
                  </div>

                  {/* SÓ MOSTRA TAXA DE SERVIÇO SE O VALOR NO ADMIN FOR MAIOR QUE 0 */}
                  {taxaServico > 0 && (
                    <div className="flex justify-between border-b border-white/10 py-3 text-orange-400">
                      <span>Taxa de Serviço</span>
                      <span className="font-bold">
                        R$ {(taxaServico / 100).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  {includeCooler && settings?.allowCooler && (
                    <div className="flex justify-between border-b border-white/10 py-3 text-blue-400">
                      <span>Adicional Cooler</span>
                      <span className="font-bold">
                        R$ {(precoCooler / 100).toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-3 items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-4xl font-black text-purple-400">
                      R$ {totalAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* PIX e Instruções */}
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
                      <code className="text-2xl md:text-3xl font-mono font-bold text-white select-all">
                        {PIX_INFO.chave}
                      </code>
                      <Button
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(PIX_INFO.chave);
                          toast.success("Chave copiada!");
                        }}
                        className="h-10 w-10 rounded-full bg-purple-600"
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-purple-300">
                      {PIX_INFO.nome} • {PIX_INFO.banco}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                    <p className="text-sm text-gray-300">
                      Pagamento realizado? Clique no botão abaixo para gerar seu
                      pedido e anexar o comprovante.
                      <strong className="block mt-2 text-purple-400 uppercase text-[10px] tracking-widest">
                        Dica: Tire um print do comprovante agora para agilizar
                        sua aprovação!
                      </strong>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all hover:scale-[1.02]"
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
        <DialogContent className="bg-black/90 border-purple-500/50 text-white backdrop-blur-xl rounded-2xl">
          <DialogHeader className="text-center pt-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <DialogTitle className="text-2xl font-black">
              PEDIDO GERADO!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Envie o ID para um admin notificar o pagamento.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                ID do Pedido
              </p>
              <p className="text-5xl font-mono font-bold text-purple-400">
                #{createdTicketId}
              </p>
            </div>
            <Button
              onClick={() =>
                setLocation(`/enviar-comprovante/${createdTicketId}`)
              }
              className="w-full h-14 font-bold bg-purple-600 hover:bg-purple-500"
            >
              <UploadCloud className="mr-2" /> ANEXAR COMPROVANTE AGORA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
