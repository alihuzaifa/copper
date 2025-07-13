import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

export default function ResetPasswordPage() {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  return (
    <>
      <Helmet>
        <title>{softwareName} | Reset Password</title>
        <meta name="description" content="Set a new password for your copper wire manufacturing management system." />
      </Helmet>
      <AuthLayout
        title="Reset password"
        description="Enter your new password"
      >
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
} 