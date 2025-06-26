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
import { apiService } from "@/lib/api-service";

const formSchema = z.object({
  otp: z.string().min(6, {
    message: "OTP must be at least 6 characters.",
  }),
});

export function OtpVerificationForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      otp: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await apiService.auth.verifyOtp(values);
      toast({
        title: "Success",
        description: "OTP verified successfully.",
      });
      setLocation("/reset-password");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await apiService.auth.resendOtp();
      toast({
        title: "Success",
        description: "OTP has been resent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OTP</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter OTP"
                  type="text"
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
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={handleResendOtp}
          >
            Resend OTP
          </Button>
        </div>
      </form>
    </Form>
  );
} 