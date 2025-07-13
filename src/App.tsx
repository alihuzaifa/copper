import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

// Auth Pages
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import VerifyOtpPage from "@/pages/auth/verify-otp";
import ResetPasswordPage from "@/pages/auth/reset-password";

// Main Pages
import Dashboard from "@/pages/dashboard";
import SuppliersPage from "@/pages/suppliers-page";
import TransactionHistory from "@/pages/transaction-history";

import SettingsPage from "@/pages/settings";
import UserCreationPage from "@/pages/user-creation";
import UsersPage from "@/pages/users-page";
import ExpensePage from "@/pages/expense-page";
import CheckPage from "@/pages/check-page";

// Workflow pages
import PurchaseManagement from "@/pages/workflow/purchase-management";
import KachaProcessing from "@/pages/workflow/kacha-processing";
import DrawProcess from "@/pages/workflow/draw-process";
import ReadyCopper from "@/pages/workflow/ready-copper";
import PvcPurchase from "@/pages/workflow/pvc-purchase";
import Production from "@/pages/workflow/production";
import KhataSalePage from "@/pages/workflow/khata-sale";

// AuthGuard component to handle root route logic
function AuthGuard() {
  const token = useSelector((state: RootState) => state.auth.token);
  
  if (token) {
    return <Redirect to="/dashboard" />;
  }
  
  return <LoginPage />;
}

// AuthPageGuard component to prevent authenticated users from accessing auth pages
function AuthPageGuard({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token);
  
  if (token) {
    return <Redirect to="/dashboard" />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <Switch>
          {/* Root route - redirects based on auth status */}
          <Route path="/" component={AuthGuard} />
          
          {/* Public Auth Routes - redirect to dashboard if already authenticated */}
          <Route path="/login">
            <AuthPageGuard>
              <LoginPage />
            </AuthPageGuard>
          </Route>
          <Route path="/signup">
            <AuthPageGuard>
              <SignupPage />
            </AuthPageGuard>
          </Route>
          <Route path="/forgot-password">
            <AuthPageGuard>
              <ForgotPasswordPage />
            </AuthPageGuard>
          </Route>
          <Route path="/verify-otp">
            <AuthPageGuard>
              <VerifyOtpPage />
            </AuthPageGuard>
          </Route>
          <Route path="/reset-password">
            <AuthPageGuard>
              <ResetPasswordPage />
            </AuthPageGuard>
          </Route>

          {/* Protected Main Routes */}
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/suppliers">
            <ProtectedRoute>
              <SuppliersPage />
            </ProtectedRoute>
          </Route>
          <Route path="/transactions">
            <ProtectedRoute>
              <TransactionHistory />
            </ProtectedRoute>
          </Route>

          <Route path="/settings">
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          </Route>
          <Route path="/users/create">
            <ProtectedRoute>
              <UserCreationPage />
            </ProtectedRoute>
          </Route>
          <Route path="/users">
            <ProtectedRoute>
              <UsersPage />
            </ProtectedRoute>
          </Route>
          <Route path="/expense">
            <ProtectedRoute>
              <ExpensePage />
            </ProtectedRoute>
          </Route>
          <Route path="/checks">
            <ProtectedRoute>
              <CheckPage />
            </ProtectedRoute>
          </Route>

          {/* Protected Workflow Routes */}
          <Route path="/workflow/purchase-management">
            <ProtectedRoute>
              <PurchaseManagement />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/kacha-processing">
            <ProtectedRoute>
              <KachaProcessing />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/draw-process">
            <ProtectedRoute>
              <DrawProcess />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/ready-copper">
            <ProtectedRoute>
              <ReadyCopper />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/pvc-purchase">
            <ProtectedRoute>
              <PvcPurchase />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/production">
            <ProtectedRoute>
              <Production />
            </ProtectedRoute>
          </Route>
          <Route path="/workflow/khata-sale">
            <ProtectedRoute>
              <KhataSalePage />
            </ProtectedRoute>
          </Route>

          {/* 404 Route */}
          <Route component={NotFound} />
        </Switch>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
