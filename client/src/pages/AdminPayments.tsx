import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, X, Eye, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminPayments() {
  const utils = trpc.useUtils();
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [viewImage, setViewImage] = useState<string | null>(null);

  const { data: payments, isLoading } = trpc.payments.listPending.useQuery();

  const approveMutation = trpc.payments.approve.useMutation({
    onSuccess: () => {
      toast.success("Pagamento aprovado com sucesso!");
      utils.payments.listPending.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const rejectMutation = trpc.payments.reject.useMutation({
    onSuccess: () => {
      toast.success("Pagamento rejeitado.");
      setIsRejectModalOpen(false);
      setRejectionReason("");
      utils.payments.listPending.invalidate();
    },
    onError: err => toast.error(err.message),
  });

  const handleReject = () => {
    if (selectedPayment) {
      rejectMutation.mutate({
        paymentId: selectedPayment,
        reason: rejectionReason,
      });
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" />
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="text-gray-400">
              <ArrowLeft className="mr-2" /> Painel
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-purple-400">
            Pagamentos Pendentes
          </h1>
          <div className="w-20" />
        </header>

        {payments?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
            <Check className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400">
              Tudo limpo! Nenhum pagamento aguardando.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {payments?.map(p => (
              <Card
                key={p.id}
                className="bg-zinc-900 border-white/10 text-white overflow-hidden"
              >
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold">
                      {p.user?.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-bold">
                        {p.user?.name || "Usuário Desconhecido"}
                      </p>
                      <p className="text-xs text-gray-500">{p.user?.email}</p>
                      <p className="text-sm text-purple-400 font-mono mt-1">
                        R$ {(p.amount / 100).toFixed(2)}{" "}
                        {p.ticket?.hasCooler && " (COOLER)"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10"
                      onClick={() => setViewImage(p.comprovantePath)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Ver Comprovante
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-500"
                      onClick={() =>
                        approveMutation.mutate({ paymentId: p.id })
                      }
                      disabled={approveMutation.isPending}
                    >
                      {approveMutation.isPending ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}{" "}
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-500"
                      onClick={() => {
                        setSelectedPayment(p.id);
                        setIsRejectModalOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" /> Rejeitar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE REJEIÇÃO PROFISSIONAL */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle /> Rejeitar Pagamento
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Diga ao cliente por que o comprovante foi recusado.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="Ex: Valor incorreto ou imagem cortada"
            className="bg-white/5 border-white/10 focus:border-purple-500"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Confirmar Rejeição"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VISUALIZADOR DE IMAGEM */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="max-w-3xl bg-black border-white/10 p-1">
          {viewImage && (
            <img
              src={viewImage}
              alt="Comprovante"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
