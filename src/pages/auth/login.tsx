import { LoginForm } from "@/components/auth/login-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

export default function LoginPage() {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  return (
    <>
      <Helmet>
        <title>{softwareName} | Login</title>
        <meta name="description" content="Login to your copper wire manufacturing management system." />
      </Helmet>
      <AuthLayout
        title="Welcome back"
        description="Enter your credentials to access your account"
      >
        <LoginForm />
      </AuthLayout>
    </>
  );
} 