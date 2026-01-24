import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

// List of admin email addresses
const ADMIN_EMAILS = [
  "andrereed0410@gmail.com",
  "Itwts.records@gmail.com",
  "ajaysaini2003@gmail.com",
];

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function logout(): Promise<void> {
  window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  // Check if user email is in the admin list (case-insensitive)
  const isAdmin = user?.email 
    ? ADMIN_EMAILS.some(email => email.toLowerCase() === user.email!.toLowerCase())
    : false;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

