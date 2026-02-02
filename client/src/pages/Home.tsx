import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/Countdown";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc";
import { useIsMobile } from "@/hooks/useMobile"; // IMPORTADO O HOOK
import {
  Calendar,
  MapPin,
  Ticket,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const isMobile = useIsMobile(); // DETECTA SE É CELULAR

  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();

  const formatDate = (dateString?: string) => {
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
  };

  const eventDate = formatDate(settings?.eventDate);

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

      {/* HEADER CORRIGIDO COM RESPONSIVIDADE [cite: 2025-06-07] */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          {/* Logo e Nome do Evento com ajuste de espaço */}
          <div className="flex items-center gap-2 md:gap-3 min-w-0 shrink">
            <img
              src={APP_LOGO}
              alt="Logo"
              className="h-8 w-8 md:h-12 md:w-12 rounded-full border border-white/10 shrink-0"
            />
            <h1 className="text-sm md:text-xl font-bold text-white tracking-wider uppercase truncate">
              {settings?.eventName?.split(" ")[0] || "Furduncinho"}
              <span className="text-purple-500">
                {settings?.eventName?.split(" ")[1] || "047"}
              </span>
            </h1>
          </div>

          {/* Navegação que não encolhe para não quebrar o layout */}
          <nav className="flex items-center gap-1 md:gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link href="/meus-ingressos">
                  <Button
                    variant="ghost"
                    className="text-gray-300 h-9 px-2 md:px-4"
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
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-gray-400 h-9 w-9"
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
                  <Button className="bg-white text-black font-bold h-8 md:h-10 text-[10px] md:text-sm px-2 md:px-4">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm text-purple-300 mb-8">
            Edição {eventDate.ano} Confirmada
          </div>

          <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              {settings?.eventName?.split(" ")[0].toUpperCase() ||
                "FURDUNCINHO"}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500">
              {settings?.eventName?.split(" ")[1] || "047"}
            </span>
          </h1>

          <p className="text-base md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            O maior encontro automotivo de Santa Catarina.
            <strong className="text-white font-semibold block mt-1">
              Prepare sua nave.
            </strong>
          </p>

          <div className="mb-12 scale-75 md:scale-100">
            <Countdown />
          </div>

          <Link href={isAuthenticated ? "/comprar" : "/login"}>
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-bold bg-purple-600 rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all hover:scale-105"
            >
              <Ticket className="mr-2 h-5 w-5" />
              {isAuthenticated ? "GARANTIR INGRESSO" : "COMPRAR AGORA"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Info Cards dinâmicos mantidos */}
      <section className="py-12 md:py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-2">
                Data
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white">
                {eventDate.dia} {eventDate.mes}
              </p>
              <p className="text-purple-400 font-mono text-sm">
                {eventDate.ano}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-2">
                Local
              </p>
              <p className="text-xl md:text-2xl font-bold text-white truncate">
                {settings?.location || "A definir"}
              </p>
              <p className="text-blue-400 text-sm">Joinville - SC</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 p-6 md:p-8 rounded-2xl">
              <p className="text-purple-300 text-xs font-semibold uppercase mb-2">
                Entrada
              </p>
              <p className="text-3xl md:text-4xl font-bold text-white">
                R$ {settings ? (settings.priceNormal / 100).toFixed(0) : "0"}
              </p>
              <Link href={isAuthenticated ? "/comprar" : "/login"}>
                <div className="flex items-center text-purple-400 text-xs font-bold mt-4 hover:text-white transition-colors cursor-pointer">
                  Garantir agora <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-[10px] md:text-sm">
        <p>
          &copy; {eventDate.ano} {settings?.eventName || "Furduncinho047"}.
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
