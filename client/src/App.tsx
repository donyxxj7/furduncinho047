import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { Loader2 } from "lucide-react";

import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// 1. CARREGAMENTO IMEDIATO (Páginas Críticas)
// Mantemos a Home e Auth como import comum para o primeiro acesso ser rápido
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

// 2. CODE SPLITTING (Páginas Secundárias e Pesadas)
// O navegador só baixa essas páginas se o usuário clicar no link
const BuyTicket = lazy(() => import("./pages/BuyTicket"));
const SubmitProof = lazy(() => import("./pages/SubmitProof"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminScanner = lazy(() => import("./pages/AdminScanner"));
const AdminSettings = lazy(() => import("./pages/AdminSettings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Componente de carregamento leve para o Suspense
const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="animate-spin text-purple-500 h-10 w-10" />
  </div>
);

function Router() {
  return (
    // O Suspense gerencia o estado de carregamento das páginas lazy
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        <Route path="/comprar" component={BuyTicket} />
        <Route path="/enviar-comprovante/:ticketId" component={SubmitProof} />
        <Route path="/meus-ingressos" component={MyTickets} />

        {/* ROTAS ADMINISTRATIVAS - Agora carregam sob demanda */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/pagamentos" component={AdminPayments} />
        <Route path="/admin/scanner" component={AdminScanner} />
        <Route path="/admin/configuracoes" component={AdminSettings} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
