import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useLocation } from "wouter";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  // Close sidebar when location changes (for mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Overlay for mobile sidebar */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isOpen} />
      
      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen">
        <Header onMenuToggle={() => setIsOpen(prev => !prev)} />
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
