import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export function useAuth(options: { redirectOnUnauthenticated?: boolean } = {}) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Busca o usuário atual
  const {
    data: user,
    isLoading,
    error,
  } = trpc.auth.me.useQuery(undefined, {
    retry: false,
  });

  // Mutação de Login
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate(); // Recarrega os dados do usuário
    },
  });

  // Mutação de Registro
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  // Mutação de Logout
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setLocation("/login");
    },
  });

  // Redirecionamento automático se não estiver logado
  if (options.redirectOnUnauthenticated && !isLoading && !user) {
    // Evita loop infinito se já estiver no login
    if (
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      setLocation("/login");
    }
  }

  return {
    user,
    loading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!user,
    // Expõe as funções para as páginas usarem
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    register: (name: string, email: string, password: string) =>
      registerMutation.mutateAsync({ name, email, password }),
    logout: () => logoutMutation.mutateAsync(),
  };
}
