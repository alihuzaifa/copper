import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

type AuthContextType = {
  user: MockUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<MockUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResponse, Error, RegisterData>;
};

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

  // Mock login mutation that simulates API call
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData): Promise<MockUser> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Always return success for mock data
      return user;
    },
    onSuccess: (user: MockUser) => {
      // Set the user in the query cache
      queryClient.setQueryData(["/api/user"], user);
      
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

  // Mock registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData): Promise<RegisterResponse> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a new mock user
      const newUser: MockUser = {
        id: Math.floor(Math.random() * 1000),
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: "user",
        isVerified: true,
        createdAt: new Date(),
      };
      
      return {
        user: newUser,
        requiresVerification: false
      };
    },
    onSuccess: (data: RegisterResponse) => {
      queryClient.setQueryData(["/api/user"], data.user);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return;
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
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
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
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