import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const otpSchema = z.object({
  otp: z.string().length(6, "Please enter all digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export function OtpVerificationForm() {
  const [, navigate] = useLocation();
  const { verifyOtpMutation, resendOtpMutation } = useAuth();
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: OtpFormValues) => {
    try {
      await verifyOtpMutation.mutateAsync(data);
      navigate("/reset-password");
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await resendOtpMutation.mutateAsync();
      setResendTimer(30);
      setCanResend(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {verifyOtpMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>{verifyOtpMutation.error.message}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    render={({ slots }) => (
                      <InputOTPGroup className="gap-2 flex justify-center">
                        {slots.map((slot, index) => (
                          <InputOTPSlot
                            key={index}
                            {...slot}
                            className="w-10 h-12 text-center text-lg"
                          />
                        ))}
                      </InputOTPGroup>
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="text-center text-sm">
              {canResend ? (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto font-normal"
                  disabled={resendOtpMutation.isPending}
                  onClick={handleResendOtp}
                >
                  Resend code
                </Button>
              ) : (
                <span className="text-muted-foreground">
                  Resend code in {resendTimer}s
                </span>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending}>
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={() => navigate("/login")}
              >
                Back to login
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 