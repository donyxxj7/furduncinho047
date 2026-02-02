import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BuyTicket from "./pages/BuyTicket";
import SubmitProof from "./pages/SubmitProof";
import MyTickets from "./pages/MyTickets";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPayments from "./pages/AdminPayments";
// Certifique-se de que o arquivo criado anteriormente se chama Scanner.tsx ou AdminScanner.tsx
import AdminScanner from "./pages/AdminScanner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminSettings from "./pages/AdminSettings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/comprar" component={BuyTicket} />
      <Route path="/enviar-comprovante/:ticketId" component={SubmitProof} />
      <Route path="/meus-ingressos" component={MyTickets} />

      {/* ROTAS ADMINISTRATIVAS */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/pagamentos" component={AdminPayments} />
      <Route path="/admin/scanner" component={AdminScanner} />
      <Route path="/admin/configuracoes" component={AdminSettings} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
