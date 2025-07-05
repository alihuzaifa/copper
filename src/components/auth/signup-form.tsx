import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { request } from "@/lib/api-client";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "@/store/slices/authSlice";
import type { User } from "@/store/slices/authSlice";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface ApiUser {
  _id: string;
  email: string;
  role: string;
  status: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  categoryId: number;
  shopId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  transactions: any[];
  paymentHistory: any[];
  __v: number;
}

interface SignupResponse {
  success: boolean;
  message: string;
  data: ApiUser;
  token?: string;
}

export function SignupForm() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await request<SignupFormValues, SignupResponse>({
        url: '/users/super-admin',
        method: 'POST',
        data
      });
      
      if (response.success) {
        const apiUser = response.data;
        
        // Map API user to store User type
        const userData: User = {
          id: apiUser._id,
          name: apiUser.email.split('@')[0], // Use email username as name since name is not in response
          email: apiUser.email,
          role: apiUser.role
        };
        
        // Update auth state using Redux
        if (response.token) {
          dispatch(setToken(response.token));
        }
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
        throw new Error(response.message || 'Signup failed');
      }
    } catch (err: any) {
      // Show error toast
      toast({
        variant: "destructive",
        title: "Error creating account",
        description: err.message || 'Something went wrong during signup',
        duration: 5000,
      });

      setError(err.message || 'Something went wrong during signup');
    } finally {
      setIsLoading(false);
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    type="text"
                    autoComplete="name"
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
                    autoComplete="new-password"
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
                Creating super admin account...
              </>
            ) : (
              "Create super admin account"
            )}
          </Button>

          <div className="text-center">
            <span className="text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
            </span>
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 