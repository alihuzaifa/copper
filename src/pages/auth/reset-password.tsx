import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      description="Enter your new password"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
} 