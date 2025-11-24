import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Ticket,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Share2,
  Download,
} from "lucide-react";
import { Link } from "wouter";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

export default function MyTickets() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
  } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const { data: tickets, isLoading: ticketsLoading } =
    trpc.tickets.myTickets.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // Estado para controlar qual ticket está sendo gerado para a carteirinha
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  // Referência para o elemento invisível que será "printado"
  const storyRef = useRef<HTMLDivElement>(null);
  // Estado para armazenar os dados do ticket que vai aparecer na carteirinha temporária
  const [activeStoryTicket, setActiveStoryTicket] = useState<any>(null);

  if (authLoading || ticketsLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getStatusBadge = (ticket: any) => {
    if (ticket.paymentStatus === "rejected") {
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          <XCircle className="h-3 w-3 mr-1" />
          Rejeitado
        </Badge>
      );
    }

    switch (ticket.status) {
      case "pending":
        if (ticket.paymentStatus === "pending") {
          return (
            <Badge
              variant="outline"
              className="border-yellow-500 text-yellow-500"
            >
              <Clock className="h-3 w-3 mr-1" />
              Em Análise
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case "paid":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case "used":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Utilizado
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{ticket.status}</Badge>;
    }
  };

  // Função para gerar e baixar a imagem
  const handleGenerateStory = async (ticket: any) => {
    if (!storyRef.current) return;

    setGeneratingId(ticket.id);
    setActiveStoryTicket(ticket);

    // Espera um pouco para o React renderizar os dados no template escondido
    setTimeout(async () => {
      try {
        if (!storyRef.current) return;

        const dataUrl = await toPng(storyRef.current, {
          quality: 1.0,
          pixelRatio: 2, // Melhor qualidade para celular
        });

        const link = document.createElement("a");
        link.download = `Carteirinha-Furduncinho-${ticket.id}.png`;
        link.href = dataUrl;
        link.click();

        toast.success(
          "Carteirinha gerada! Poste nos stories e marque a gente!"
        );
      } catch (err) {
        console.error(err);
        toast.error("Erro ao gerar carteirinha.");
      } finally {
        setGeneratingId(null);
        setActiveStoryTicket(null);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* --- TEMPLATE DA CARTEIRINHA (Invisível na tela normal) --- */}
      <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
        <div
          ref={storyRef}
          className="w-[1080px] h-[1920px] bg-black flex flex-col items-center relative overflow-hidden text-white"
        >
          {/* Fundo com gradiente e efeitos */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-black to-purple-900/40"></div>
          <div
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, #a855f7 10%, transparent 10%)",
              backgroundSize: "40px 40px",
            }}
          ></div>

          {/* Conteúdo */}
          <div className="z-10 flex flex-col items-center justify-center h-full w-full gap-12 p-20">
            <div className="animate-pulse">
              <img
                src={APP_LOGO}
                alt="Logo"
                className="w-64 h-64 rounded-full shadow-[0_0_100px_rgba(168,85,247,0.6)] border-4 border-purple-500"
              />
            </div>

            <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
              EU VOU!
            </h1>

            <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 w-full max-w-2xl">
              <p className="text-4xl text-gray-400 font-medium uppercase tracking-widest">
                Membro Oficial
              </p>
              <p className="text-7xl font-bold text-white text-center leading-tight">
                {activeStoryTicket ? user?.name : "Seu Nome"}
              </p>
              <div className="w-32 h-2 bg-purple-600 rounded-full my-4"></div>
              <p className="text-4xl text-purple-300 font-semibold">
                Ingresso Access
              </p>
              <p className="text-3xl text-gray-500 mt-2">
                #{activeStoryTicket?.ticketCode || "00000"}
              </p>
            </div>

            <div className="mt-20 text-center">
              <p className="text-5xl font-bold mb-4">FURDUNCINHO 047</p>
              <p className="text-3xl text-gray-400">
                O MAIOR EVENTO AUTOMOTIVO DE 2026
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="absolute bottom-20 text-center w-full">
            <p className="text-2xl text-gray-600">furduncinho047.com</p>
          </div>
        </div>
      </div>
      {/* -------------------------------------------------------- */}

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
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Meus Ingressos
          </h2>

          {!tickets || tickets.length === 0 ? (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Nenhum ingresso encontrado</CardTitle>
                <CardDescription>
                  Você ainda não possui ingressos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/comprar">
                    <Ticket className="mr-2 h-4 w-4" />
                    Comprar Ingresso
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Ticket className="h-5 w-5" />
                          Ingresso Access #{ticket.id}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Criado em{" "}
                          {new Date(ticket.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </CardDescription>
                      </div>
                      {getStatusBadge(ticket)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ticket.status === "paid" && ticket.ticketCode && (
                        <>
                          <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-6 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground mb-2">
                              Código do Ingresso
                            </p>
                            <p className="text-2xl font-bold text-primary mb-4">
                              {ticket.ticketCode}
                            </p>

                            {/* --- BOTÃO DE GERAR CARTEIRINHA --- */}
                            <div className="mb-6 flex justify-center">
                              <Button
                                onClick={() => handleGenerateStory(ticket)}
                                disabled={generatingId === ticket.id}
                                className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-[0_0_15px_rgba(168,85,247,0.4)] animate-pulse hover:animate-none"
                              >
                                {generatingId === ticket.id ? (
                                  "Gerando..."
                                ) : (
                                  <>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Gerar Carteirinha VIP
                                  </>
                                )}
                              </Button>
                            </div>
                            {/* ---------------------------------- */}

                            {ticket.qrImagePath && (
                              <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-lg inline-block">
                                  <img
                                    src={ticket.qrImagePath}
                                    alt="QR Code do ingresso"
                                    className="w-48 h-48"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Importante:</strong> Apresente este QR
                              Code na entrada do evento. Cada ingresso só pode
                              ser utilizado uma vez.
                            </p>
                          </div>
                        </>
                      )}

                      {ticket.status === "pending" && (
                        <div className="space-y-3">
                          {ticket.paymentStatus === "rejected" ? (
                            <div className="bg-destructive/10 p-4 rounded-lg">
                              <p className="text-sm text-destructive font-medium mb-1">
                                Pagamento Rejeitado
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Motivo:</strong>{" "}
                                {ticket.rejectionReason ||
                                  "Comprovante inválido."}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Por favor, envie um novo comprovante.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-yellow-500/10 p-4 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                {ticket.paymentStatus === "pending"
                                  ? "Seu pagamento está em análise pela administração."
                                  : "Seu pedido está aguardando o envio do comprovante."}
                              </p>
                            </div>
                          )}

                          <Link href={`/enviar-comprovante/${ticket.id}`}>
                            <Button className="w-full">
                              <Upload className="mr-2 h-4 w-4" />
                              {ticket.paymentStatus === "rejected"
                                ? "Enviar Novo Comprovante"
                                : "Enviar Comprovante"}
                            </Button>
                          </Link>
                        </div>
                      )}

                      {ticket.status === "used" && (
                        <div className="bg-blue-500/10 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Este ingresso já foi utilizado em{" "}
                            {new Date(ticket.validatedAt!).toLocaleString(
                              "pt-BR"
                            )}
                            .
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
