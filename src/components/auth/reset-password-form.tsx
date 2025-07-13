import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface ResetPasswordRequest {
  newPassword: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
}

export function ResetPasswordForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Get token from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "Reset token is missing",
          variant: "destructive",
        });
        return;
      }
      
      // Call the correct API endpoint for password reset
      const response = await request<ResetPasswordRequest, ResetPasswordResponse>({
        url: `/users/reset-password/${token}`,
        method: 'POST',
        data: {
          newPassword: values.password
        }
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        // Navigate to login page after successful reset
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter new password"
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm new password"
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
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/login")}
            >
              Back to Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 