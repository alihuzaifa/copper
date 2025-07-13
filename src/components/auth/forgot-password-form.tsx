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
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      setIsLoading(true);
      
      // Call the correct API endpoint for forgot password
      const response = await request<FormValues, ForgotPasswordResponse>({
        url: '/users/forgot-password',
        method: 'POST',
        data: values
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        // Navigate to login page after successful submission
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to process request');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process request.",
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
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
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