import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { request } from "@/lib/api-client";
import { setUser, setToken, setAuthLoading, setAuthError, User } from "@/store/slices/authSlice";
import type { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface ApiUser {
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  _id: string;
  categoryId: number;
  email: string;
  role: string;
  shopId: string;
  verified: boolean;
  createdAt: string;
  transactions: any[];
  paymentHistory: any[];
  updatedAt: string;
  __v: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    token: string;
  };
}

export function LoginForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const isLoading = useSelector((state: RootState) => state.auth.authLoading);
  const error = useSelector((state: RootState) => state.auth.authError);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));
      
      // Call login API
      const response = await request<LoginFormValues, LoginResponse>({
        url: '/users/login',
        method: 'POST',
        data: {
          email: data.email,
          password: data.password
        }
      });
      
      if (response.success) {
        const apiUser = response.data.user;
        
        // Map API user to store User type
        const userData: User = {
          id: apiUser._id,
          name: apiUser.email.split('@')[0], // Use email username as name
          email: apiUser.email,
          role: apiUser.role
        };
        
        // Store raw token without Bearer prefix
        const token = response.data.token;
        dispatch(setToken(token.replace('Bearer ', '')));
        dispatch(setUser(userData));
        
        // Show success toast
        toast({
          title: "Success",
          description: response.message,
          duration: 5000,
        });

        // Navigate to dashboard
        navigate("/dashboard");
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      // Show error toast
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || 'Something went wrong during login',
        duration: 5000,
      });

      dispatch(setAuthError(err.message || 'Something went wrong during login'));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>

          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
