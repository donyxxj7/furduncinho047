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
import { useState, useMemo } from "react";

const ADMINS_WHATSAPP = [
  { nome: "Rosário", numero: "5547996979192" },
  { nome: "Miorim", numero: "5547988996771" },
  { nome: "Sutter", numero: "5547999488522" },
  { nome: "Barcelos", numero: "5547996402934" },
];

const PIX_INFO = {
  chave: "oorosario9@gmail.com",
  nome: "Matheus Vinicius Do Rosário",
  banco: "Nubank",
};

export default function BuyTicket() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [createdTicketId, setCreatedTicketId] = useState<number | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [includeCooler, setIncludeCooler] = useState(false);

  // Utilitário para limpar o cache após criar um ingresso
  const utils = trpc.useUtils();

  const selectedAdmin = useMemo(() => {
    return ADMINS_WHATSAPP[Math.floor(Math.random() * ADMINS_WHATSAPP.length)];
  }, [isSuccessOpen]);

  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();
  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: async data => {
      if (data.success && data.ticketId) {
        setCreatedTicketId(data.ticketId);
        // Atualiza o cache para o sistema saber que agora existe um ingresso
        await utils.tickets.myTickets.invalidate();
        setIsSuccessOpen(true);
        toast.success("Pedido gerado! Anexe o comprovante.");
      }
    },
    onError: error => {
      toast.error(error.message || "Erro ao criar ingresso");
    },
  });

  const precoBase = settings?.priceNormal ?? 3000;
  const precoCooler = settings?.priceCooler ?? 7000;
  const taxaServico = settings?.serviceFee ?? 0;
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

  // Verifica se o cara já tem boleto/pix pendente ou pago
  const existingTicket = tickets?.find(
    t => t.status === "pending" || t.status === "paid"
  );

  const handleCreateTicket = () => {
    if (existingTicket) {
      toast.error("Você já possui um pedido em andamento!");
      setLocation("/meus-ingressos");
      return;
    }
    createTicketMutation.mutate({ hasCooler: includeCooler });
  };

  const handleWhatsAppNotify = () => {
    const message = encodeURIComponent(
      `Olá ${selectedAdmin.nome}, acabei de fazer o PIX do pedido #${createdTicketId}. Aqui está o comprovante!`
    );
    window.open(
      `https://wa.me/${selectedAdmin.numero}?text=${message}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt="Logo"
              className="h-10 w-10 rounded-full border border-white/10"
            />
            <h1 className="text-xl font-bold">
              Furduncinho<span className="text-purple-500">047</span>
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">
            Garantir Ingresso
          </h2>

          {existingTicket ? (
            <Card className="bg-white/5 border-purple-500/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-6 w-6 text-yellow-500" /> Pedido em
                  Aberto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Você já iniciou uma compra. Finalize o envio do comprovante
                  para validar.
                </p>
                <Button
                  onClick={() => setLocation("/meus-ingressos")}
                  className="w-full bg-purple-600 hover:bg-purple-500 h-12"
                >
                  Ver Meu Ingresso Ativo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Resumo */}
              <Card className="bg-white/5 border-white/10 mb-6">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-3">
                    <span className="text-gray-400 font-bold uppercase text-xs">
                      Valor do Ingresso
                    </span>
                    <span className="font-bold">
                      R$ {(precoBase / 100).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total a Pagar</span>
                    <span className="text-4xl font-black text-purple-400">
                      R$ {totalAmount.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* PIX INFO */}
              <div className="bg-purple-600/10 border border-purple-500/30 p-6 rounded-xl mb-6 text-center">
                <p className="text-xs text-purple-300 uppercase font-bold mb-2">
                  Chave PIX {PIX_INFO.banco}
                </p>
                <code className="text-xl font-mono block mb-3">
                  {PIX_INFO.chave}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(PIX_INFO.chave);
                    toast.success("Copiado!");
                  }}
                  className="border-purple-500/50 hover:bg-purple-500/20"
                >
                  <Copy className="h-4 w-4 mr-2" /> Copiar Chave
                </Button>
              </div>

              <Button
                className="w-full h-16 text-xl font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
                onClick={handleCreateTicket}
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  "JÁ FIZ O PIX, CONFIRMAR"
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* MODAL DE SUCESSO - OBRIGATÓRIO REDIRECIONAR */}
      <Dialog
        open={isSuccessOpen}
        onOpenChange={open => {
          if (!open) setLocation("/meus-ingressos"); // Se fechar o modal, vai pros ingressos
          setIsSuccessOpen(open);
        }}
      >
        <DialogContent className="bg-zinc-950 border-purple-500/50 text-white backdrop-blur-xl">
          <DialogHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <DialogTitle className="text-2xl font-black">
              PEDIDO #{createdTicketId} GERADO!
            </DialogTitle>
            <DialogDescription className="text-gray-400 italic">
              Não feche esta tela antes de anexar ou notificar.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <Button
              onClick={() =>
                setLocation(`/enviar-comprovante/${createdTicketId}`)
              }
              className="w-full h-14 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <UploadCloud className="mr-2 h-5 w-5" /> ANEXAR COMPROVANTE AGORA
            </Button>

            <Button
              onClick={handleWhatsAppNotify}
              className="w-full h-14 font-bold bg-[#25D366] hover:bg-[#20ba5a] text-black"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> NOTIFICAR{" "}
              {selectedAdmin?.nome.toUpperCase()}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setLocation("/meus-ingressos")}
              className="w-full text-zinc-500 hover:text-white"
            >
              Fazer isso mais tarde
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
