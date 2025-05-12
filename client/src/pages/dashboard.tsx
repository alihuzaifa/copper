import { useQuery } from "@tanstack/react-query";
import { Box, Inbox, Package, Users, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import StatsCard from "@/components/ui/stats-card";
import RecentActivity from "@/components/dashboard/recent-activity";
import QuickActions from "@/components/dashboard/quick-actions";
import StockStatus from "@/components/dashboard/stock-status";
import TransactionsTable from "@/components/dashboard/transactions-table";
import ManufacturingOverview from "@/components/dashboard/manufacturing-overview";
import SupplierAnalysis from "@/components/dashboard/supplier-analysis";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  rawMaterials: number;
  finishedProducts: number;
  suppliers: number;
  totalValue: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: [API_ENDPOINTS.dashboard.stats],
  });

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Workflow Stages */}
        <WorkflowStages currentStage={3} />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatsCard
                title="Raw Materials"
                value={`${stats?.rawMaterials.toLocaleString() || 0} kg`}
                icon={Box}
                iconColor="text-blue-500 dark:text-blue-300"
                iconBgColor="bg-blue-100 dark:bg-blue-900"
                change={{
                  value: 3.2,
                  label: "from last month",
                  isPositive: true
                }}
              />
              
              <StatsCard
                title="Finished Products"
                value={`${stats?.finishedProducts.toLocaleString() || 0} units`}
                icon={Package}
                iconColor="text-green-500 dark:text-green-300"
                iconBgColor="bg-green-100 dark:bg-green-900"
                change={{
                  value: 5.8,
                  label: "from last month",
                  isPositive: true
                }}
              />
              
              <StatsCard
                title="Suppliers"
                value={stats?.suppliers.toString() || "0"}
                icon={Users}
                iconColor="text-purple-500 dark:text-purple-300"
                iconBgColor="bg-purple-100 dark:bg-purple-900"
                change={{
                  value: 0,
                  label: "no change"
                }}
              />
              
              <StatsCard
                title="Total Value"
                value={`₹${(stats?.totalValue / 100000 || 0).toFixed(1)}L`}
                icon={DollarSign}
                iconColor="text-yellow-500 dark:text-yellow-300"
                iconBgColor="bg-yellow-100 dark:bg-yellow-900"
                change={{
                  value: 2.1,
                  label: "from last month",
                  isPositive: false
                }}
              />
            </>
          )}
        </div>
        
        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <RecentActivity />
          
          <div className="flex flex-col">
            <QuickActions />
            <StockStatus />
          </div>
        </div>
        
        {/* Recent Transactions */}
        <TransactionsTable />
        
        {/* Manufacturing Process Overview & Supplier Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ManufacturingOverview />
          <SupplierAnalysis />
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 pb-6">
          <p>© {new Date().getFullYear()} Copper Manufacturing Stock Management System. All rights reserved.</p>
          <p className="mt-1">Version 1.0.0</p>
        </footer>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
