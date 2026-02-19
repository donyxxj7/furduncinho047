import { useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/Countdown";
import { Card, CardContent } from "@/components/ui/card"; // Importante: certifique-on de ter o card.tsx
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useIsMobile } from "@/hooks/useMobile";
import {
  Ticket,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Loader2,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile();
  const WHATSAPP_MARY_PODS =
    "https://chat.whatsapp.com/GRtrDCO55Qw9MOTx0JCKLc?mode=gi_t";

  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();

  const eventDate = useMemo(() => {
    const dateString = settings?.eventDate;
    if (!dateString) return { dia: "07", mes: "FEV", ano: "2026" };

    const date = new Date(dateString);
    const meses = [
      "JAN",
      "FEV",
      "MAR",
      "ABR",
      "MAI",
      "JUN",
      "JUL",
      "AGO",
      "SET",
      "OUT",
      "NOV",
      "DEZ",
    ];

    return {
      dia: date.getDate().toString().padStart(2, "0"),
      mes: meses[date.getMonth()],
      ano: date.getFullYear(),
    };
  }, [settings?.eventDate]);

  const eventNameParts = useMemo(() => {
    const parts = settings?.eventName?.split(" ") || ["FURDUNCINHO", "047"];
    return {
      first: parts[0],
      second: parts[1] || "",
    };
  }, [settings?.eventName]);

  const handleLogout = useCallback(() => logout(), [logout]);

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500 shadow-[0_0_15px_#a855f7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-purple-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 shrink">
            <img
              src={APP_LOGO}
              alt="Logo Furduncinho047"
              width="48"
              height="48"
              className="h-8 w-8 md:h-12 md:w-12 rounded-full border border-white/10 shrink-0 object-cover"
            />
            <h1 className="text-sm md:text-xl font-bold text-white tracking-wider uppercase truncate">
              {eventNameParts.first}{" "}
              <span className="text-purple-500">{eventNameParts.second}</span>
            </h1>
          </div>

          <nav className="flex items-center gap-1 md:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link href="/meus-ingressos">
                  <Button
                    variant="ghost"
                    className="text-gray-200 h-9 px-2 md:px-4"
                  >
                    <Ticket className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Ingressos</span>
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className="text-purple-400 h-9 px-2 md:px-4"
                    >
                      <ShieldCheck className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </Link>
                )}
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 h-9 w-9 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex gap-1 md:gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white h-8 md:h-10 text-[10px] md:text-sm px-2"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black font-bold h-8 md:h-10 text-[10px] md:text-sm px-2 md:px-4 hover:bg-gray-200">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 z-10">
          <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-purple-300 mb-8">
              Edição {eventDate.ano} Confirmada
            </div>

            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                {eventNameParts.first.toUpperCase()}
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500">
                {eventNameParts.second}
              </span>
            </h1>

            <p className="text-base md:text-2xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              O maior encontro automotivo de Santa Catarina.
              <strong className="text-white font-semibold block mt-1">
                Prepare sua nave.
              </strong>
            </p>

            <div className="mb-12 scale-75 md:scale-100 min-h-[120px] flex items-center justify-center">
              <Countdown />
            </div>

            <Link href={isAuthenticated ? "/comprar" : "/login"}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-bold bg-purple-600 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:scale-105 transition-all"
              >
                <Ticket className="mr-2 h-5 w-5" />
                {isAuthenticated ? "GARANTIR INGRESSO" : "COMPRAR AGORA"}
              </Button>
            </Link>
          </div>
        </section>

        {/* METRICS SECTION */}
        <section className="py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-gray-300 text-xs font-semibold uppercase mb-2 tracking-widest">
                  Data
                </p>
                <p className="text-2xl font-bold text-white">
                  {eventDate.dia} {eventDate.mes}
                </p>
                <p className="text-purple-400 font-mono text-sm">
                  {eventDate.ano}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                <p className="text-gray-300 text-xs font-semibold uppercase mb-2 tracking-widest">
                  Local
                </p>
                <p className="text-xl font-bold text-white truncate">
                  {settings?.location || "A definir"}
                </p>
                <p className="text-blue-400 text-sm">Joinville - SC</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 p-6 rounded-2xl group transition-all">
                <p className="text-purple-200 text-xs font-semibold uppercase mb-2 tracking-widest">
                  Entrada
                </p>
                <p className="text-3xl font-bold text-white">
                  R$ {settings ? (settings.priceNormal / 100).toFixed(0) : "0"}
                </p>
                <Link href={isAuthenticated ? "/comprar" : "/login"}>
                  <div className="flex items-center text-purple-400 text-xs font-bold mt-4 cursor-pointer hover:text-white transition-colors">
                    Garantir agora{" "}
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PARCERIA MARY PODS - RED NEON EDITION */}
        <section className="py-24 relative z-10 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col items-center mb-12">
              <h2 className="text-zinc-500 text-xs md:text-sm font-black uppercase tracking-[0.5em] mb-4">
                Parceria <span className="text-red-500">Exclusiva</span>
              </h2>
              <div className="h-1 w-12 bg-red-600 rounded-full shadow-[0_0_10px_#ef4444]"></div>
            </div>

            <Card className="group relative bg-zinc-950/80 border-red-500/30 shadow-[0_0_60px_rgba(0,0,0,1)] overflow-hidden backdrop-blur-xl transition-all duration-700 hover:border-red-500/60">
              {/* Badge de Frete Grátis com Neon Vermelho */}
              <div className="absolute top-4 right-4 z-20">
                <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm shadow-[0_0_15px_#ef4444] animate-bounce">
                  FRETE GRÁTIS JOINVILLE
                </div>
              </div>

              <CardContent className="p-0 relative z-10">
                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Lado Esquerdo: Vitrine Vermelha */}
                  <div className="w-full md:w-2/5 relative bg-black flex justify-center items-center p-14 overflow-hidden border-b md:border-b-0 md:border-r border-white/5">
                    {/* Brilhos Internos em Vermelho */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent"></div>

                    <div className="relative group-hover:scale-110 transition-transform duration-700">
                      <div className="absolute -inset-6 bg-red-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <ShoppingBag className="w-24 h-24 text-white drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]" />
                    </div>
                  </div>

                  {/* Lado Direito: Conteúdo e Benefício */}
                  <div className="p-10 md:p-14 flex-1 flex flex-col justify-center bg-gradient-to-br from-transparent to-red-900/10">
                    <div className="mb-8">
                      <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic leading-none mb-4">
                        MARY{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-700 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                          PODS
                        </span>
                      </h3>
                      <p className="inline-block bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold text-red-500 tracking-widest uppercase">
                        100% CONFIÁVEL
                      </p>
                    </div>

                    <div className="space-y-4 mb-10">
                      <p className="text-zinc-300 text-lg leading-relaxed">
                        Use o cupom{" "}
                        <span className="text-white font-black underline decoration-red-600 decoration-2 underline-offset-4">
                          FURDUNCINHO
                        </span>{" "}
                        e garanta:
                      </p>
                      <ul className="text-zinc-400 text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_5px_#ef4444]"></div>
                          Entrega 100% gratuita em qualquer bairro de Joinville.
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_5px_#ef4444]"></div>
                          Atendimento prioritário para membros do grupo.
                        </li>
                      </ul>
                    </div>

                    <Button
                      asChild
                      className="relative overflow-hidden bg-white text-black hover:text-white font-black px-10 h-16 rounded-none transition-all duration-500 group/btn shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                    >
                      <a
                        href={WHATSAPP_MARY_PODS}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3"
                      >
                        {/* Efeito de preenchimento dinâmico em Vermelho */}
                        <div className="absolute inset-0 w-0 bg-red-600 transition-all duration-500 group-hover/btn:w-full"></div>

                        <span className="relative z-10 flex items-center gap-3 tracking-[0.2em] text-xs">
                          RESGATAR BENEFÍCIO{" "}
                          <ExternalLink
                            size={16}
                            className="group-hover/btn:translate-x-1 transition-transform"
                          />
                        </span>
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>

              {/* Detalhe de acabamento inferior em Vermelho */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-[10px] md:text-sm">
        <p>
          &copy; {eventDate.ano} {settings?.eventName || "Furduncinho047"}.
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
