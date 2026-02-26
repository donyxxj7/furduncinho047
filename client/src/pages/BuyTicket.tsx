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
  Beer,
  Check,
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
        await utils.tickets.myTickets.invalidate();
        setIsSuccessOpen(true);
        toast.success("Pedido gerado! Anexe o comprovante.");
      }
    },
    onError: error => toast.error(error.message || "Erro ao criar ingresso"),
  });

  // LÓGICA DINÂMICA DO BANCO AQUI
  const precoBase = settings?.priceNormal ?? 2500;
  const precoCooler = settings?.priceCooler ?? 1500;
  const taxaServico = settings?.serviceFee ?? 0;
  const isCoolerAllowed = settings?.allowCooler ?? true;

  const totalEmCentavos =
    precoBase +
    taxaServico +
    (includeCooler && isCoolerAllowed ? precoCooler : 0);
  const totalAmount = totalEmCentavos / 100;

  if (authLoading || ticketsLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-purple-500" />
      </div>
    );
  }

  const existingTicket = tickets?.find(
    t => t.status === "pending" || t.status === "paid"
  );

  const handleCreateTicket = () => {
    if (existingTicket) {
      toast.error("Você já possui um pedido em andamento!");
      setLocation(`/suporte?id=${existingTicket.id}`);
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
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-black mb-8 text-center uppercase tracking-tighter">
            GARANTIR INGRESSO
          </h2>

          {/* CARD DE RESUMO - DESIGN MANTIDO */}
          <Card className="bg-zinc-900/40 border-white/5 mb-6">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">
                  Valor do Ingresso
                </span>
                <span className="text-sm font-bold">
                  R$ {(precoBase / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>

              {/* CARD DE SELEÇÃO DO COOLER */}
              {isCoolerAllowed && (
                <div
                  onClick={() => setIncludeCooler(!includeCooler)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    includeCooler
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/5 bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Beer
                      size={16}
                      className={
                        includeCooler ? "text-purple-400" : "text-zinc-600"
                      }
                    />
                    <span className="text-[10px] font-bold uppercase">
                      Adicional Cooler
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-purple-400">
                      + R$ {(precoCooler / 100).toFixed(2)}
                    </span>
                    {includeCooler && (
                      <Check size={12} className="text-purple-400" />
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Total a Pagar</span>
                <span className="text-4xl font-black text-purple-500">
                  R$ {totalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* CHAVE PIX NUBANK */}
          <div className="bg-zinc-950/60 border border-purple-500/20 p-6 rounded-xl mb-6 text-center">
            <p className="text-[10px] text-purple-400 font-bold uppercase mb-2">
              Chave Pix Nubank
            </p>
            <p className="text-lg font-bold mb-4 tracking-tight">
              {PIX_INFO.chave}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(PIX_INFO.chave);
                toast.success("Copiado!");
              }}
              className="border-white/10 h-8 text-[10px] uppercase font-bold hover:bg-white hover:text-black transition-all"
            >
              <Copy className="h-3 w-3 mr-2" /> Copiar Chave
            </Button>
          </div>

          <Button
            className="w-full h-14 text-lg font-black bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg active:scale-95 transition-all"
            onClick={handleCreateTicket}
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "JÁ FIZ O PIX, CONFIRMAR"
            )}
          </Button>
        </div>
      </div>

      <Dialog
        open={isSuccessOpen}
        onOpenChange={open => {
          if (!open) setLocation(`/suporte?id=${createdTicketId}`);
          setIsSuccessOpen(open);
        }}
      >
        <DialogContent className="bg-zinc-950 border-purple-500/40 text-white">
          <DialogHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <DialogTitle className="text-xl font-black uppercase">
              PEDIDO #{createdTicketId} GERADO!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => setLocation(`/suporte?id=${createdTicketId}`)}
              className="w-full h-12 font-bold bg-purple-600 hover:bg-purple-700"
            >
              <UploadCloud className="mr-2 h-4 w-4" /> ANEXAR COMPROVANTE
            </Button>
            <Button
              onClick={handleWhatsAppNotify}
              className="w-full h-12 font-bold bg-[#25D366] text-black"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> NOTIFICAR{" "}
              {selectedAdmin?.nome.toUpperCase()}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
