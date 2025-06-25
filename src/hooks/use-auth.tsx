import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";

// Mock user type
interface MockUser {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: Date;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  signupMutation: ReturnType<typeof useSignupMutation>;
  forgotPasswordMutation: ReturnType<typeof useForgotPasswordMutation>;
  verifyOtpMutation: ReturnType<typeof useVerifyOtpMutation>;
  resendOtpMutation: ReturnType<typeof useResendOtpMutation>;
  resetPasswordMutation: ReturnType<typeof useResetPasswordMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
}

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  name: string;
  username: string;
  email: string;
  password: string;
};

type RegisterResponse = { 
  user: MockUser;
  requiresVerification: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Custom hooks for each auth operation
function useLoginMutation() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiService.auth.login(data),
  });
}

function useSignupMutation() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      apiService.auth.signup(data),
  });
}

function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      apiService.auth.forgotPassword(data),
  });
}

function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (data: { otp: string }) =>
      apiService.auth.verifyOtp(data),
  });
}

function useResendOtpMutation() {
  return useMutation({
    mutationFn: () =>
      apiService.auth.resendOtp(),
  });
}

function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (data: { password: string }) =>
      apiService.auth.resetPassword(data),
  });
}

function useLogoutMutation() {
  return useMutation({
    mutationFn: () =>
      apiService.auth.logout(),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // Use useState for mock data
  const [user] = useState<MockUser>({
    id: 1,
    name: "Mock User",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
    isVerified: true,
    createdAt: new Date(),
  });
  
  const isLoading = false;
  const error = null;

  // Initialize all mutations
  const loginMutation = useLoginMutation();
  const signupMutation = useSignupMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const logoutMutation = useLogoutMutation();

  const value = {
    user,
    isLoading,
    error,
    loginMutation,
    signupMutation,
    forgotPasswordMutation,
    verifyOtpMutation,
    resendOtpMutation,
    resetPasswordMutation,
    logoutMutation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}