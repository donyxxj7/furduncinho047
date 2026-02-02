import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/Countdown";
import { APP_LOGO } from "@/const";
import { trpc } from "@/lib/trpc"; // ADICIONADO: Import do tRPC
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

  // 1. BUSCA AS CONFIGURAÇÕES REAIS DO BANCO
  const { data: settings, isLoading: settingsLoading } =
    trpc.settings.get.useQuery();

  // Funções de formatação para data e preço
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
      {/* Efeitos de fundo mantidos */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[4s]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <img
              src={APP_LOGO}
              alt="Furduncinho047"
              className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/10"
            />
            {/* 2. NOME DO EVENTO DINÂMICO */}
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wider uppercase">
              {settings?.eventName?.split(" ")[0] || "Furduncinho"}
              <span className="text-purple-500">
                {settings?.eventName?.split(" ")[1] || "047"}
              </span>
            </h1>
          </div>

          {/* Navegação mantida */}
          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/meus-ingressos">
                  <Button variant="ghost" className="text-gray-300">
                    <Ticket className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Ingressos</span>
                  </Button>
                </Link>
                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
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
                  className="text-gray-400 hover:text-red-400"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="text-white">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black font-bold">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Edição {eventDate.ano} Confirmada
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              {settings?.eventName?.split(" ")[0].toUpperCase() ||
                "FURDUNCINHO"}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 animate-pulse">
              {settings?.eventName?.split(" ")[1] || "047"}
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            O maior encontro automotivo de Santa Catarina.
            <strong className="text-white font-semibold block mt-1">
              Prepare sua nave. A história vai ser reescrita.
            </strong>
          </p>

          <div className="mb-12 scale-90 md:scale-100">
            <Countdown />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href={isAuthenticated ? "/comprar" : "/login"}>
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] border border-purple-400/50 transition-all hover:scale-105"
              >
                <Ticket className="mr-2 h-5 w-5" />
                {isAuthenticated ? "GARANTIR INGRESSO" : "COMPRAR AGORA"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards - AGORA DINÂMICOS */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* DATA DINÂMICA */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-all">
              <Calendar className="absolute top-4 right-4 h-12 w-12 text-purple-500/20 group-hover:text-purple-500 transition-colors" />
              <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">
                Data
              </h3>
              <p className="text-3xl font-bold text-white mb-1">
                {eventDate.dia} {eventDate.mes}
              </p>
              <p className="text-purple-400 font-mono">{eventDate.ano}</p>
            </div>

            {/* LOCAL DINÂMICO */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-all">
              <MapPin className="absolute top-4 right-4 h-12 w-12 text-blue-500/20 group-hover:text-blue-500 transition-colors" />
              <h3 className="text-gray-400 text-sm font-semibold uppercase mb-2">
                Local
              </h3>
              <p className="text-2xl font-bold text-white mb-1">
                {settings?.location || "A definir"}
              </p>
              <p className="text-blue-400 text-sm">Joinville - SC</p>
            </div>

            {/* PREÇO DINÂMICO */}
            <div className="group relative bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 p-8 rounded-2xl hover:border-purple-400 transition-all">
              <Ticket className="absolute top-4 right-4 h-12 w-12 text-white/10 group-hover:text-white/50 transition-colors" />
              <h3 className="text-purple-300 text-sm font-semibold uppercase mb-2">
                Entrada
              </h3>
              <p className="text-4xl font-bold text-white mb-1">
                R$ {settings ? settings.priceNormal / 100 : "0"}
              </p>
              <Link href={isAuthenticated ? "/comprar" : "/login"}>
                <div className="flex items-center text-purple-400 text-sm font-bold mt-4 cursor-pointer hover:text-white">
                  Garantir agora <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>
          &copy; {eventDate.ano} {settings?.eventName || "Furduncinho047"}.
          Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
