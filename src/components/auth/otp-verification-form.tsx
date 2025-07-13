import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { setUser, setToken } from "@/store/slices/authSlice";
import type { User } from "@/store/slices/authSlice";

const formSchema = z.object({
  otp: z.string().min(6, {
    message: "OTP must be at least 6 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      _id: string;
      name?: string;
      email?: string;
      role: string;
    };
    token: string;
  };
}

interface ResendOtpRequest {
  email: string;
}

interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export function OtpVerificationForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(true);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = useSelector((state: RootState) => state.auth.authEmail);

  // Redirect if no email is available
  useEffect(() => {
    if (!email) {
      setLocation("/signup");
    } else {
      setIsCheckingEmail(false);
    }
  }, [email, setLocation]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtpValues = [...otpValues];
      pastedData.split('').forEach((char, index) => {
        if (index < 6) {
          newOtpValues[index] = char;
        }
      });
      setOtpValues(newOtpValues);
      // Focus the last input after paste
      if (otpInputRefs.current[5]) {
        otpInputRefs.current[5].focus();
      }
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);
      // Auto-focus next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle OTP keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Call the correct API endpoint for OTP verification
      const response = await request<VerifyOtpRequest, VerifyOtpResponse>({
        url: '/users/verify-otp',
        method: 'POST',
        data: {
          email: email,
          otp: otp
        }
      });
      
      if (response.success) {
        // If the API returns user data and token, store them in Redux
        if (response.data?.user && response.data?.token) {
          const apiUser = response.data.user;
          
          // Map API user to store User type
          const userData: User = {
            id: apiUser._id,
            name: apiUser.name || apiUser.email?.split('@')[0] || 'User',
            email: apiUser.email || '',
            role: apiUser.role
          };
          
          // Store token and user data in Redux
          dispatch(setToken(response.data.token));
          dispatch(setUser(userData));
          
          toast({
            title: "Success",
            description: response.message,
          });
          
          // Redirect to dashboard since user is now authenticated
          setLocation("/dashboard");
        } else {
          // If no token returned, redirect to login
          toast({
            title: "Success",
            description: response.message,
          });
          setLocation("/login");
        }
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "OTP verification failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;
    
    try {
      setCanResend(false);
      setCountdown(60); // Reset countdown
      
      // Call the correct API endpoint for resending OTP
      const response = await request<ResendOtpRequest, ResendOtpResponse>({
        url: '/users/resend-otp',
        method: 'POST',
        data: {
          email: email
        }
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
      } else {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
      setCanResend(true); // Allow retry on error
      setCountdown(0);
    }
  };

  if (isCheckingEmail) {
    return (
      <div className="space-y-6 w-full max-w-md mx-auto">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Enter the OTP sent to {email}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-center gap-2">
          {otpValues.map((value, index) => (
            <input
              key={index}
              ref={(el) => (otpInputRefs.current[index] = el)}
              type="text"
              maxLength={1}
              className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={value}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
            />
          ))}
        </div>

        <div className="text-center space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={verifyOtp}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Didn't receive the code?{' '}
            {canResend ? (
              <button 
                type="button" 
                className="text-blue-600 hover:underline dark:text-blue-400" 
                onClick={resendOtp}
              >
                Resend OTP
              </button>
            ) : (
              <span className="text-gray-500">
                Resend OTP in {formatTime(countdown)}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/signup')}
        >
          Back to Sign up
        </Button>
      </div>
    </div>
  );
} 