import { Link, useLocation } from "wouter";
import { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { WORKFLOW_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { 
  ShoppingCart, 
  Bolt, 
  MoveHorizontal, 
  CheckSquare, 
  Droplet, 
  Building, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  History, 
  BarChart2, 
  UserCog, 
  Settings, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "dashboard": LayoutDashboard,
  "shopping-cart": ShoppingCart,
  "tools": Bolt,
  "dragging": MoveHorizontal,
  "check-double": CheckSquare,
  "drop": Droplet,
  "building-3": Building,
  "group": Users,
  "folder": FolderKanban,
  "history": History,
  "bar-chart": BarChart2,
  "user-settings": UserCog,
  "settings": Settings,
  "logout": LogOut,
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-30 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
              CM
            </div>
            <span className="text-lg font-bold font-sans">CopperMgmt</span>
          </div>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <UserCog className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <p className="font-medium">{user?.name || "User"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role || "User"}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4 px-3">
        <div className="space-y-1">
          <Link href="/dashboard">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/dashboard" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </a>
          </Link>
          
          <div className="mt-4 mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Workflow Stages
            </p>
          </div>
          
          {WORKFLOW_STAGES.map((stage) => {
            const Icon = iconMap[stage.icon] || iconMap["settings"];
            return (
              <Link key={stage.id} href={stage.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === stage.path 
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <Icon className="mr-3 h-5 w-5" />
                  {stage.name}
                </a>
              </Link>
            );
          })}
          
          <div className="mt-4 mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Management
            </p>
          </div>
          
          <Link href="/suppliers">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/suppliers" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <Users className="mr-3 h-5 w-5" />
              Suppliers
            </a>
          </Link>
          
          <Link href="/categories">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/categories" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <FolderKanban className="mr-3 h-5 w-5" />
              Categories
            </a>
          </Link>
          
          <Link href="/transactions">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/transactions" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <History className="mr-3 h-5 w-5" />
              Transaction History
            </a>
          </Link>
          
          <Link href="/reports">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/reports" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <BarChart2 className="mr-3 h-5 w-5" />
              Reports
            </a>
          </Link>
          
          <div className="mt-4 mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Settings
            </p>
          </div>
          
          <Link href="/profile">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/profile" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <UserCog className="mr-3 h-5 w-5" />
              Profile
            </a>
          </Link>
          
          <Link href="/settings">
            <a className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md",
              location === "/settings" 
                ? "bg-primary text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            )}>
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
