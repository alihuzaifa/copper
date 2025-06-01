import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import SuppliersPage from "@/pages/suppliers-page";
import TransactionHistory from "@/pages/transaction-history";
import ProfilePage from "@/pages/profile";
import SettingsPage from "@/pages/settings";
import UserCreationPage from "@/pages/user-creation";
import UsersPage from "@/pages/users-page";
import ExpensePage from "@/pages/expense-page";

// Workflow pages
import PurchaseManagement from "@/pages/workflow/purchase-management";
import KachaProcessing from "@/pages/workflow/kacha-processing";
import DrawProcess from "@/pages/workflow/draw-process";
import ReadyCopper from "@/pages/workflow/ready-copper";
import PvcPurchase from "@/pages/workflow/pvc-purchase";
import Production from "@/pages/workflow/production";
import KhataSalePage from "@/pages/workflow/khata-sale";

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected Routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/users" component={UsersPage} />
      <ProtectedRoute path="/expense" component={ExpensePage} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/transactions" component={TransactionHistory} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/users/create" component={UserCreationPage} />
      
      {/* Workflow Routes */}
      <ProtectedRoute path="/workflow/purchase-management" component={PurchaseManagement} />
      <ProtectedRoute path="/workflow/kacha-processing" component={KachaProcessing} />
      <ProtectedRoute path="/workflow/draw-process" component={DrawProcess} />
      <ProtectedRoute path="/workflow/ready-copper" component={ReadyCopper} />
      <ProtectedRoute path="/workflow/pvc-purchase" component={PvcPurchase} />
      <ProtectedRoute path="/workflow/production" component={Production} />
      <ProtectedRoute path="/workflow/khata-sale" component={KhataSalePage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
