import { SignupForm } from "@/components/auth/signup-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

export default function SignupPage() {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  return (
    <>
      <Helmet>
        <title>{softwareName} | Sign Up</title>
        <meta name="description" content="Create an account for your copper wire manufacturing management system." />
      </Helmet>
      <AuthLayout
        title="Create an account"
        description="Enter your details to create your account"
      >
        <SignupForm />
      </AuthLayout>
    </>
  );
} 