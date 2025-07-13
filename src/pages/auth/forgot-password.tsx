import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

export default function ForgotPasswordPage() {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  return (
    <>
      <Helmet>
        <title>{softwareName} | Forgot Password</title>
        <meta name="description" content="Reset your password for your copper wire manufacturing management system." />
      </Helmet>
      <AuthLayout
        title="Forgot password"
        description="Enter your email to reset your password"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
} 