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
import {
  ArrowLeft,
  Ticket,
  Clock,
  CheckCircle2,
  Users,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: stats, isLoading: statsLoading } =
    trpc.admin.dashboard.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} className="h-10 w-10 rounded-full" />
            <h1 className="text-xl font-bold text-primary">
              Painel Administrativo
            </h1>
          </div>
          <div className="w-20"></div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Dashboard</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Ingressos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">
                    {stats?.totalTickets || 0}
                  </span>
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pagamentos Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-yellow-500">
                    {stats?.pendingPayments || 0}
                  </span>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ingressos Aprovados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-green-500">
                    {stats?.paidTickets || 0}
                  </span>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-blue-500/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-blue-500">
                    {stats?.totalCheckins || 0}
                  </span>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" /> Pagamentos Pendentes
                </CardTitle>
                <CardDescription>Aprovar ou rejeitar</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/pagamentos">
                  <Button className="w-full">
                    <AlertCircle className="mr-2 h-4 w-4" /> Ver Pagamentos
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" /> Scanner
                </CardTitle>
                <CardDescription>Validar na portaria</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/scanner">
                  <Button className="w-full" variant="outline">
                    Abrir Scanner
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
