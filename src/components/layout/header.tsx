import { useState, useEffect } from "react";
import { Sun, Moon, Bell, HelpCircle, Menu } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { WORKFLOW_STAGES } from "@/lib/constants";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };
  
  // Set the page title based on the current location
  useEffect(() => {
    if (location === "/dashboard") {
      setPageTitle("Dashboard");
    } else if (location === "/users") {
      setPageTitle("Users");
    } else if (location === "/categories") {
      setPageTitle("Categories");
    } else if (location === "/transactions") {
      setPageTitle("Transaction History");
    } else if (location === "/reports") {
      setPageTitle("Reports");

    } else if (location === "/settings") {
      setPageTitle("Settings");
    } else {
      // Check if it's a workflow stage page
      const workflowStage = WORKFLOW_STAGES.find(stage => stage.path === location);
      if (workflowStage) {
        setPageTitle(workflowStage.description);
      }
    }
  }, [location]);
  
  // Check user's theme preference on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setIsDarkMode(savedTheme === 'dark');
    
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden -ml-1"
              onClick={onMenuToggle}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
            <h1 className="text-xl font-semibold font-sans ml-2 lg:ml-0">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleDarkMode}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="sr-only">Notifications</span>
              </Button>
              
              {/* Help */}
              <Button 
                variant="ghost" 
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="sr-only">Help</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
