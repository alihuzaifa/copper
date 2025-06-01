import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import ResetPassword from "./reset-password";

const AuthForm = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showResetPassword, setShowResetPassword] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        {showResetPassword ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 text-center">
                Enter your email to receive a password reset OTP
              </p>
            </div>
            <ResetPassword onCancel={() => setShowResetPassword(false)} />
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Welcome to CopperMgmt</h1>
              <p className="text-sm text-gray-500 mt-1">
                Copper Manufacturing Stock Management System
              </p>
            </div>

            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm onForgotPassword={() => setShowResetPassword(true)} />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm onSuccess={() => setActiveTab("login")} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthForm;
