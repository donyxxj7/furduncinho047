import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, Ticket, Phone, Copy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function BuyTicket() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: data => {
      toast.success("Ingresso criado com sucesso!");
      setLocation(`/enviar-comprovante/${data.ticketId}`);
    },
    onError: error => {
      toast.error(error.message || "Erro ao criar ingresso");
    },
  });

  const handleCopyPix = () => {
    navigator.clipboard.writeText("47997051529");
    toast.success("Chave PIX copiada para a área de transferência!");
  };

  if (authLoading || ticketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
            <CardDescription>
              Você precisa estar logado para comprar ingressos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Fazer Login</Link>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
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
            <h1 className="text-xl font-bold text-primary">Furduncinho047</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Comprar Ingresso
          </h2>

          {hasPendingOrPaid ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                  Você já possui um ingresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Você já possui um ingresso pendente ou pago. Acesse a página
                  "Meus Ingressos" para ver os detalhes.
                </p>
                <Link href="/meus-ingressos">
                  <Button className="w-full">
                    <Ticket className="mr-2 h-4 w-4" />
                    Ver Meus Ingressos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-primary/20 mb-6">
                <CardHeader>
                  <CardTitle>Ingresso Access</CardTitle>
                  <CardDescription>
                    Entrada garantida no Furduncinho047
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">
                        Tipo de Ingresso
                      </span>
                      <span className="font-semibold text-primary">Access</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Quantidade</span>
                      <span className="font-semibold">1 unidade</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-3xl font-bold text-primary">
                        R$ 25,00
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 mb-6">
                <CardHeader>
                  <CardTitle>Informações de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">PIX</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-medium">
                            Endony Paradela Rodrigues
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Banco:</span>
                          <span className="font-medium">Mercado Pago</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-3">
                          <span className="text-muted-foreground">
                            Chave PIX (Celular):
                          </span>
                          <div className="flex items-center gap-2">
                            <code className="bg-background p-2 rounded text-lg font-bold text-center break-all select-all cursor-text text-primary flex-1">
                              47997051529
                            </code>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={handleCopyPix}
                              title="Copiar chave PIX"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-1">
                            Clique no ícone para copiar
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <img
                        src="/qr-payment.jpg"
                        alt="QR Code para pagamento"
                        className="max-w-xs w-full rounded-lg border border-border"
                      />
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-3 text-center">
                        Ou envie o comprovante diretamente para um ADM via
                        WhatsApp:
                      </p>
                      <div className="space-y-2">
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start gap-3 text-left h-auto"
                        >
                          <a
                            href="https://wa.me/5547992618136"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="h-4 w-4 shrink-0" />
                            (47) 99261-8136 — Ruan
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start gap-3 text-left h-auto"
                        >
                          <a
                            href="https://wa.me/5547996979192"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="h-4 w-4 shrink-0" />
                            (47) 99697-9192 — Rosario
                          </a>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          className="w-full justify-start gap-3 text-left h-auto"
                        >
                          <a
                            href="https://wa.me/5547999590746"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Phone className="h-4 w-4 shrink-0" />
                            (47) 99959-0746 — Gaba
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-yellow-500/50 bg-yellow-500/5 mb-6">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> Após realizar o pagamento via
                    PIX, você precisará enviar o comprovante para validação.
                    Clique no botão abaixo para criar seu pedido e enviar o
                    comprovante.
                  </p>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                size="lg"
                onClick={() => createTicketMutation.mutate()}
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Criando pedido...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 h-5 w-5" />
                    Criar Pedido e Enviar Comprovante
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
