import { OtpVerificationForm } from "@/components/auth/otp-verification-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Verify OTP"
      description="Enter the OTP sent to your email"
    >
      <OtpVerificationForm />
    </AuthLayout>
  );
} 