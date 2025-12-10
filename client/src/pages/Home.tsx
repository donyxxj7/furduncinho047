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
import { Calendar, MapPin, Ticket, LogOut, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src={APP_LOGO}
              alt="Furduncinho047"
              className="h-10 w-10 md:h-12 md:w-12 rounded-full"
            />
            <h1 className="text-lg md:text-2xl font-bold text-primary truncate">
              Furduncinho047
            </h1>
          </div>

          {/* Navegação */}
          <nav className="flex items-center gap-2 md:gap-4">
            {isAuthenticated ? (
              <>
                {/* Oculta o nome do usuário em telas pequenas (mobile) */}
                <span className="text-sm text-muted-foreground hidden md:block">
                  Olá, {user?.name?.split(" ")[0]}
                </span>

                <Link href="/meus-ingressos">
                  <Button variant="outline" size="sm" className="px-2 md:px-4">
                    <Ticket className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Meus Ingressos</span>
                  </Button>
                </Link>

                {user?.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 md:px-4 border-purple-500/50 text-purple-500 hover:text-purple-400"
                    >
                      <ShieldCheck className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                  className="px-2 md:px-4"
                >
                  <LogOut className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild size="sm">
                  <Link href="/register">Criar Conta</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <img
              src={APP_LOGO}
              alt="Furduncinho047"
              className="h-24 w-24 md:h-32 md:w-32 mx-auto mb-6 md:mb-8 rounded-full shadow-lg shadow-primary/50"
            />
            <h2 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Furduncinho047
            </h2>

            {/* --- TEXTO HERO ATUALIZADO (NEON) --- */}
            <p className="text-center text-[1.3rem] font-semibold tracking-wide text-purple-300 drop-shadow-[0_0_10px_#a020f0] animate-pulse mb-6 md:mb-8 px-4">
              O maior evento automotivo de 2026 tá chegando. Se prepara, porque
              a experiência vai ser pesada e inesquecível.
            </p>
            {/* ------------------------------------ */}

            <div className="flex flex-wrap gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/comprar">
                  <Button size="lg" className="text-lg px-8 w-full md:w-auto">
                    <Ticket className="mr-2 h-5 w-5" />
                    Comprar Ingresso
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  className="text-lg px-8 w-full md:w-auto"
                  asChild
                >
                  <Link href="/login">
                    <Ticket className="mr-2 h-5 w-5" />
                    Comprar Ingresso
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 md:py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader>
                <Calendar className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                <CardTitle>Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Em breve anunciaremos a data oficial do evento em 2026!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader>
                <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                <CardTitle>Local</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Local a ser definido. Fique atento às nossas redes sociais!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-card/80 backdrop-blur">
              <CardHeader>
                <Ticket className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                <CardTitle>Ingresso</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  <span className="text-2xl font-bold text-primary block mb-1">
                    R$ 25,00
                  </span>
                  Ingresso Access - Entrada garantida
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">
              Sobre o Evento
            </h3>
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                {/* --- TEXTO SOBRE ATUALIZADO (NEON) --- */}
                <p className="leading-relaxed mb-4 text-gray-200 text-center font-semibold tracking-wide text-[1.15rem] drop-shadow-[0_0_10px_#a020f0]">
                  A{" "}
                  <span className="text-purple-400 drop-shadow-[0_0_8px_#b44bff] font-extrabold">
                    Furduncinho
                  </span>{" "}
                  nasceu de baixo, fundada por um bonde de parceiros com um
                  único propósito:
                  <span className="text-purple-300 drop-shadow-[0_0_12px_#d38bff] font-black">
                    {" "}
                    CURTIÇÃO AO EXTREMO.
                  </span>{" "}
                  Em 2026, a Furduncinho vem pra marcar presença e se tornar
                  <span className="text-purple-400 drop-shadow-[0_0_10px_#a020f0] font-extrabold">
                    {" "}
                    um dos maiores eventos automotivos de Santa Catarina.
                  </span>
                </p>
                {/* ----------------------------------- */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Garanta seu ingresso agora!
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Não perca a oportunidade de fazer parte deste evento único. Os
            ingressos são limitados!
          </p>
          {isAuthenticated ? (
            <Link href="/comprar">
              <Button size="lg" className="text-lg px-8 w-full md:w-auto">
                Comprar Agora
              </Button>
            </Link>
          ) : (
            <Button size="lg" className="text-lg px-8 w-full md:w-auto" asChild>
              <Link href="/login">Comprar Agora</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; 2026 Furduncinho047. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
