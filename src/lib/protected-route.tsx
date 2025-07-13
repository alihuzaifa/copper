import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}
