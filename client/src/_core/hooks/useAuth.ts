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
    staleTime: 1000 * 60 * 5, // Cache de 5 minutos
  });

  // Mutação de Login
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setLocation("/"); // Redireciona após login
    },
  });

  // Mutação de Registro
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setLocation("/"); // Redireciona após registro
    },
  });

  // Mutação de Logout
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      setLocation("/login");
    },
  });

  if (options.redirectOnUnauthenticated && !isLoading && !user) {
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
    // Alterado para garantir que o objeto usuário contenha o campo openid
    isAuthenticated: !!user?.openid,
    login: (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    register: (name: string, email: string, password: string) =>
      registerMutation.mutateAsync({ name, email, password }),
    logout: () => logoutMutation.mutateAsync(),
  };
}
