import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useStore } from "@/store/store";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useStore((state) => state.token);
  const user = useStore((state) => state.user);

  if (!token || !user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
