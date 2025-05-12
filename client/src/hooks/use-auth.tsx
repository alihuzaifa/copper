import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/lib/constants";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, InsertUser>;
  verifyOtpMutation: UseMutationResult<VerifyOtpResponse, Error, { otp: string }>;
  resendOtpMutation: UseMutationResult<{ message: string }, Error, void>;
  resetPasswordRequestMutation: UseMutationResult<{ message: string }, Error, { email: string }>;
  resetPasswordMutation: UseMutationResult<{ message: string }, Error, ResetPasswordData>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type RegisterResponse = { 
  user: SelectUser;
  requiresVerification: boolean;
};
type VerifyOtpResponse = {
  message: string;
  user: SelectUser;
};
type ResetPasswordData = {
  email: string;
  otp: string;
  newPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: [API_ENDPOINTS.auth.user],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.login, credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData([API_ENDPOINTS.auth.user], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.register, userData);
      return await res.json();
    },
    onSuccess: (data: RegisterResponse) => {
      queryClient.setQueryData([API_ENDPOINTS.auth.user], data.user);
      if (data.requiresVerification) {
        toast({
          title: "Registration successful",
          description: "Please verify your account with the OTP sent to your email.",
        });
      } else {
        toast({
          title: "Registration successful",
          description: "Your account has been created successfully.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { otp: string }) => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.verifyOtp, data);
      return await res.json();
    },
    onSuccess: (data: VerifyOtpResponse) => {
      queryClient.setQueryData([API_ENDPOINTS.auth.user], data.user);
      toast({
        title: "Verification successful",
        description: "Your account has been verified successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.resendOtp);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "OTP sent",
        description: "A new OTP has been sent to your email.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send OTP",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordRequestMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.resetPasswordRequest, data);
      return await res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Reset password request sent",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to request password reset",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const res = await apiRequest("POST", API_ENDPOINTS.auth.resetPassword, data);
      return await res.json();
    },
    onSuccess: (data: { message: string }) => {
      toast({
        title: "Password reset successful",
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", API_ENDPOINTS.auth.logout);
    },
    onSuccess: () => {
      queryClient.setQueryData([API_ENDPOINTS.auth.user], null);
      toast({
        title: "Logout successful",
        description: "You have been logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        verifyOtpMutation,
        resendOtpMutation,
        resetPasswordRequestMutation,
        resetPasswordMutation,
      }}
    >
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
