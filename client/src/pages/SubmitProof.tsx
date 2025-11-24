import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Upload, CheckCircle2, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function SubmitProof() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery(
    { id: Number(ticketId) },
    { enabled: isAuthenticated && !!ticketId }
  );

  const { data: payment } = trpc.payments.getByTicket.useQuery(
    { ticketId: Number(ticketId) },
    { enabled: isAuthenticated && !!ticketId }
  );

  const submitProofMutation = trpc.payments.submitProof.useMutation({
    onSuccess: () => {
      toast.success("Comprovante enviado com sucesso!");
      setLocation("/meus-ingressos");
    },
    onError: error => {
      toast.error(error.message || "Erro ao enviar comprovante");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("O arquivo deve ter no máximo 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Apenas imagens são permitidas");
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Selecione um arquivo");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      submitProofMutation.mutate({
        ticketId: Number(ticketId),
        proofData: base64,
        proofMimeType: selectedFile.type,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Ingresso não encontrado</CardTitle>
            <CardDescription>
              O ingresso solicitado não foi encontrado.
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

  if (ticket.status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              Pagamento Aprovado
            </CardTitle>
            <CardDescription>Seu ingresso já foi aprovado!</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/meus-ingressos">
              <Button className="w-full">Ver Meu Ingresso</Button>
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
          <Link href="/meus-ingressos">
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
            Enviar Comprovante
          </h2>

          <Card className="border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Informações do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Código do Pedido:
                  </span>
                  <span className="font-semibold">#{ticket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-semibold text-primary">R$ 25,00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold">
                    {payment?.status === "pending" && "Aguardando Aprovação"}
                    {payment?.status === "rejected" && "Rejeitado"}
                    {!payment && "Aguardando Comprovante"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {payment?.status === "rejected" && payment.rejectionReason && (
            <Card className="border-destructive/50 bg-destructive/5 mb-6">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Comprovante Rejeitado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  <strong>Motivo:</strong> {payment.rejectionReason}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, envie um novo comprovante válido.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Dados para Pagamento</CardTitle>
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
                      {/* --- CHAVE PIX ATUALIZADA --- */}
                      <code className="bg-background p-2 rounded text-lg font-bold text-center break-all select-all cursor-text">
                        47997051529
                      </code>
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
              </div>
            </CardContent>
          </Card>

          {/* --- CARD DE CONTATOS ADICIONADO --- */}
          <Card className="border-primary/20 mb-6">
            <CardHeader>
              <CardTitle>Dúvidas ou Envio Rápido?</CardTitle>
              <CardDescription>
                Você também pode enviar o comprovante diretamente para um dos
                administradores via WhatsApp:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                variant="outline"
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
                variant="outline"
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
                variant="outline"
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
            </CardContent>
          </Card>
          {/* ----------------------------------- */}

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Upload do Comprovante</CardTitle>
              <CardDescription>
                Envie uma foto ou print do comprovante de pagamento via PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="proof">Comprovante (máx. 5MB)</Label>
                  <Input
                    id="proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                </div>

                {preview && (
                  <div className="mt-4">
                    <Label>Preview:</Label>
                    <img
                      src={preview}
                      alt="Preview do comprovante"
                      className="mt-2 max-w-full h-auto rounded-lg border border-border"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!selectedFile || submitProofMutation.isPending}
                >
                  {submitProofMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Enviar Comprovante
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
