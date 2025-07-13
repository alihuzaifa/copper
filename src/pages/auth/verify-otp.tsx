import { OtpVerificationForm } from "@/components/auth/otp-verification-form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

export default function VerifyOtpPage() {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  return (
    <>
      <Helmet>
        <title>{softwareName} | Verify OTP</title>
        <meta name="description" content="Verify your OTP for your copper wire manufacturing management system." />
      </Helmet>
      <AuthLayout
        title="Verify OTP"
        description="Enter the OTP sent to your email"
      >
        <OtpVerificationForm />
      </AuthLayout>
    </>
  );
} 