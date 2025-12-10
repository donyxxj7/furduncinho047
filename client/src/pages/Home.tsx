import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/Countdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_LOGO } from "@/const";
import {
  Calendar,
  MapPin,
  Ticket,
  LogOut,
  ShieldCheck,
  ChevronRight,
  User,
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 shadow-[0_0_15px_#a855f7]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-purple-500/30">
      {/* --- FUNDO AMBIENTE (LUZES) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[4s]"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 blur rounded-full opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <img
                src={APP_LOGO}
                alt="Furduncinho047"
                className="relative h-10 w-10 md:h-12 md:w-12 rounded-full border border-white/10"
              />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wider uppercase">
              Furduncinho<span className="text-purple-500">047</span>
            </h1>
          </div>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/meus-ingressos">
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-white/5"
                  >
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
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black hover:bg-gray-200 font-bold">
                    Criar Conta
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 z-10">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-purple-300 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Edição 2026 Confirmada
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              FURDUNCINHO
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 animate-pulse">
              047
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            O maior encontro automotivo de Santa Catarina.
            <strong className="text-white font-semibold block mt-1">
              Prepare sua nave. A história vai ser reescrita.
            </strong>
          </p>

          {/* CRONÔMETRO (Importado) */}
          <div className="mb-12 scale-90 md:scale-100">
            <Countdown />
          </div>

          {/* BOTÃO CTA PRINCIPAL - COM GLOW */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/comprar">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 border border-purple-400/50"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  GARANTIR INGRESSO
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.7)] transition-all duration-300 hover:scale-105 border border-purple-400/50"
                >
                  <Ticket className="mr-2 h-5 w-5" />
                  COMPRAR AGORA
                </Button>
              </Link>
            )}

            <Link href="#sobre">
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 rounded-full border-white/10 hover:bg-white/5 text-gray-300 hover:text-white"
              >
                Saiba Mais
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards (Glassmorphism) */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* CARD DATA */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-all hover:bg-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <Calendar className="h-12 w-12 text-purple-500 -rotate-12" />
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Data
              </h3>
              <p className="text-3xl font-bold text-white mb-1">07 MAR</p>
              <p className="text-purple-400 font-mono">2026</p>
            </div>

            {/* CARD LOCAL */}
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-all hover:bg-white/10">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
                <MapPin className="h-12 w-12 text-blue-500 -rotate-12" />
              </div>
              <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-2">
                Local
              </h3>
              <p className="text-2xl font-bold text-white mb-1">A Definir</p>
              <p className="text-blue-400 text-sm">Joinville - SC</p>
            </div>

            {/* CARD INGRESSO */}
            <div className="group relative bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 p-8 rounded-2xl hover:border-purple-400 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]">
              <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <Ticket className="h-12 w-12 text-white -rotate-12" />
              </div>
              <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-widest mb-2">
                Valor Da Entrada
              </h3>
              <p className="text-4xl font-bold text-white mb-1">R$ 25</p>
              <p className="text-gray-400 text-sm mb-4">
                Acesso total ao evento
              </p>

              {isAuthenticated ? (
                <Link href="/comprar">
                  <div className="flex items-center text-purple-400 text-sm font-bold group-hover:text-white transition-colors cursor-pointer">
                    Garantir agora <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              ) : (
                <Link href="/login">
                  <div className="flex items-center text-purple-400 text-sm font-bold group-hover:text-white transition-colors cursor-pointer">
                    Entrar para comprar{" "}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Evento */}
      <section id="sobre" className="py-20 border-t border-white/5 bg-black/50">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <img
            src={APP_LOGO}
            alt="Logo"
            className="h-20 w-20 mx-auto mb-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            A Essência do{" "}
            <span className="text-purple-500">Caos Organizado</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            A <span className="text-white font-bold">Furduncinho047</span> não é
            apenas um evento, é um movimento. Nascido das ruas de Joinville,
            criado por quem vive a cultura automotiva de verdade. Sem regras
            chatas, apenas respeito e paixão por paredões.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>&copy; 2026 Furduncinho047. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
