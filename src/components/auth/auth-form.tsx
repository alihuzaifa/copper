import { useStore } from "@/store/store";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { ForgotPasswordForm } from "./forgot-password-form";
import { OtpVerificationForm } from "./otp-verification-form";
import { ResetPasswordForm } from "./reset-password-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthForm() {
  const { authStep } = useStore();

  return (
    <Card className="w-full border-none bg-white/50 backdrop-blur-xl dark:bg-gray-800/50">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {authStep === 'login' && "Welcome back"}
          {authStep === 'signup' && "Create an account"}
          {authStep === 'forgot-password' && "Forgot password"}
          {authStep === 'verify-otp' && "Verify OTP"}
          {authStep === 'reset-password' && "Reset password"}
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          {authStep === 'login' && "Enter your credentials to access your account"}
          {authStep === 'signup' && "Enter your details to create your account"}
          {authStep === 'forgot-password' && "Enter your email to reset your password"}
          {authStep === 'verify-otp' && "Enter the OTP sent to your email"}
          {authStep === 'reset-password' && "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authStep === 'login' && <LoginForm />}
        {authStep === 'signup' && <SignupForm />}
        {authStep === 'forgot-password' && <ForgotPasswordForm />}
        {authStep === 'verify-otp' && <OtpVerificationForm />}
        {authStep === 'reset-password' && <ResetPasswordForm />}
      </CardContent>
    </Card>
  );
}
