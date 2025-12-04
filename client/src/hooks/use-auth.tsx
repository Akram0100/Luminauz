import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      apiLogin(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      apiRegister(username, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const login = useCallback(async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  }, [loginMutation]);

  const register = useCallback(async (username: string, password: string) => {
    await registerMutation.mutateAsync({ username, password });
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const user = data?.user ?? null;
  const isAdmin = user?.isAdmin ?? false;

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
