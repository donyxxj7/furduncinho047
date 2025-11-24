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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// --- 1. IMPORTAÇÕES ADICIONADAS ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// --- FIM DAS IMPORTAÇÕES ---
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, XCircle, Eye } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminPayments() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
  } = useAuth({
    redirectOnUnauthenticated: true, // Garante que só admin acesse
  });
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showImageDialog, setShowImageDialog] = useState(false);

  const utils = trpc.useUtils();
  const { data: payments, isLoading: paymentsLoading } =
    trpc.payments.listPending.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

  const approveMutation = trpc.payments.approve.useMutation({
    onSuccess: () => {
      toast.success("Pagamento aprovado com sucesso!");
      utils.payments.listPending.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: error => {
      toast.error(error.message || "Erro ao aprovar pagamento");
    },
  });

  const rejectMutation = trpc.payments.reject.useMutation({
    onSuccess: () => {
      toast.success("Pagamento rejeitado");
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedPayment(null);
      utils.payments.listPending.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: error => {
      toast.error(error.message || "Erro ao rejeitar pagamento");
    },
  });

  // --- 2. FUNÇÃO 'handleApprove' REMOVIDA ---
  // A lógica agora está dentro do AlertDialog

  const handleReject = () => {
    if (!selectedPayment) return;
    rejectMutation.mutate({
      paymentId: selectedPayment.id,
      reason: rejectionReason || "Comprovante inválido",
    });
  };

  if (authLoading || paymentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // A checagem de !isAuthenticated ou role !admin é feita pelo useAuth
  // Mas podemos manter uma dupla checagem para segurança
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta página.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar para Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO}
              alt="Furduncinho047"
              className="h-10 w-10 rounded-full"
            />
            <h1 className="text-xl font-bold text-primary">
              Pagamentos Pendentes
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Pagamentos Pendentes</h2>

          {!payments || payments.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum pagamento pendente no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {payments.map((payment: any) => (
                <Card key={payment.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Pagamento #{payment.id}</CardTitle>
                        <CardDescription>
                          Ingresso #{payment.ticketId} -{" "}
                          {payment.user?.name || "Usuário desconhecido"}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Enviado em
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(payment.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Email do Comprador
                          </p>
                          <p className="font-medium">
                            {payment.user?.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Telefone
                          </p>
                          <p className="font-medium">
                            {payment.user?.phone || "N/A"}
                          </p>
                        </div>
                      </div>

                      {payment.comprovantePath && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Comprovante
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowImageDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar Comprovante
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={payment.comprovantePath}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Abrir em Nova Aba
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-border">
                        {/* --- 3. BOTÃO DE APROVAR SUBSTITUÍDO --- */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="flex-1"
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Aprovar Pagamento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Você tem certeza que deseja aprovar o pagamento
                                #{payment.id}? Esta ação é permanente e irá
                                gerar o ingresso (QR Code) para o usuário.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  approveMutation.mutate({
                                    paymentId: payment.id,
                                  })
                                }
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending
                                  ? "Aprovando..."
                                  : "Confirmar e Aprovar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {/* --- FIM DA SUBSTITUIÇÃO --- */}

                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectDialog(true);
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Pagamento</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Motivo da Rejeição</Label>
            <Input
              id="reason"
              placeholder="Ex: Comprovante ilegível, valor incorreto..."
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejeitando..." : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprovante de Pagamento</DialogTitle>
            {/* --- ADICIONADO PARA CORRIGIR O AVISO --- */}
            <DialogDescription>
              Visualização ampliada do comprovante enviado pelo usuário.
            </DialogDescription>
            {/* ---------------------------------------- */}
          </DialogHeader>
          <div className="py-4 flex justify-center">
            {" "}
            {/* Adicionei flex justify-center para centralizar */}
            {selectedPayment?.comprovantePath && (
              <img
                src={selectedPayment.comprovantePath}
                alt="Comprovante"
                className="max-w-full max-h-[80vh] h-auto rounded-lg object-contain" // Melhorei o CSS da imagem
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
