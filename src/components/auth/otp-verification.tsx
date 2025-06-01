import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
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
import { Loader2 } from "lucide-react";

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

const OtpVerification = () => {
  const { user, verifyOtpMutation, resendOtpMutation } = useAuth();
  const [resendCooldown, setResendCooldown] = useState(0);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = (data: OtpFormValues) => {
    verifyOtpMutation.mutate({ otp: data.otp });
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;

    resendOtpMutation.mutate(undefined, {
      onSuccess: () => {
        // Start cooldown for 60 seconds
        setResendCooldown(60);
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Verify Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">
            We've sent a verification code to {user?.email}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the 6-digit code"
                      {...field}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={verifyOtpMutation.isPending}
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={handleResendOtp}
              disabled={resendOtpMutation.isPending || resendCooldown > 0}
            >
              {resendOtpMutation.isPending ? (
                <span className="flex items-center">
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                "Resend Code"
              )}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
