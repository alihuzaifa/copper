import { useQuery } from "@tanstack/react-query";
import { Activity, ShoppingCart, Check, UserPlus, AlertTriangle } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Transaction interface (since shared schema is removed)
interface Transaction {
  id: string | number;
  transactionType: string;
  description: string;
  amount?: number;
  transactionDate: string;
}

// Map transaction types to icons
const transactionIcons: Record<string, React.ReactNode> = {
  purchase: <ShoppingCart className="text-blue-500 dark:text-blue-300" />,
  process: <Activity className="text-purple-500 dark:text-purple-300" />,
  verify: <Check className="text-green-500 dark:text-green-300" />,
  create: <UserPlus className="text-yellow-500 dark:text-yellow-300" />,
  update: <Activity className="text-purple-500 dark:text-purple-300" />,
  delete: <AlertTriangle className="text-red-500 dark:text-red-300" />,
  production: <Activity className="text-green-500 dark:text-green-300" />,
};

const RecentActivity = () => {
  const { data: activities, isLoading } = useQuery<Transaction[]>({
    queryKey: [API_ENDPOINTS.dashboard.recentActivities],
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <CardTitle className="font-sans text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          Array(4)
            .fill(0)
            .map((_, idx) => (
              <div key={idx} className="p-5 flex">
                <div className="mr-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
        ) : activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="p-5 flex">
              <div className="mr-4">
                <div className={`h-10 w-10 rounded-full ${
                  activity.transactionType === "purchase" ? "bg-blue-100 dark:bg-blue-900" :
                  activity.transactionType === "process" ? "bg-purple-100 dark:bg-purple-900" :
                  activity.transactionType === "verify" ? "bg-green-100 dark:bg-green-900" :
                  activity.transactionType === "create" ? "bg-yellow-100 dark:bg-yellow-900" :
                  activity.transactionType === "update" ? "bg-purple-100 dark:bg-purple-900" :
                  activity.transactionType === "delete" ? "bg-red-100 dark:bg-red-900" :
                  "bg-gray-100 dark:bg-gray-700"
                } flex items-center justify-center`}>
                  {transactionIcons[activity.transactionType] || <Activity className="text-gray-500 dark:text-gray-300" />}
                </div>
              </div>
              <div>
                <p className="font-medium">{activity.description}</p>
                {activity.amount && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Amount: ₹{Number(activity.amount).toLocaleString('en-IN')}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {formatDistanceToNow(new Date(activity.transactionDate), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-5 text-center text-gray-500 dark:text-gray-400">
            No recent activities found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
