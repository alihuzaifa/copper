import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface StockLevel {
  name: string;
  percentage: number;
}

interface StockLevels {
  rawCopper: StockLevel;
  pvcMaterial: StockLevel;
  packaging: StockLevel;
}

const StockStatus = () => {
  const { data: stockLevels, isLoading } = useQuery<StockLevels>({
    queryKey: [API_ENDPOINTS.dashboard.stockLevels],
  });

  return (
    <Card className="mt-5 border-t border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Critical Stock Levels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          </>
        ) : stockLevels ? (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stockLevels.rawCopper.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stockLevels.rawCopper.percentage}%
                </span>
              </div>
              <Progress
                value={stockLevels.rawCopper.percentage}
                className="h-2 bg-gray-200 dark:bg-gray-700"
                indicatorClassName={
                  stockLevels.rawCopper.percentage > 50
                    ? "bg-green-500 dark:bg-green-600"
                    : stockLevels.rawCopper.percentage > 25
                    ? "bg-yellow-500 dark:bg-yellow-600"
                    : "bg-red-500 dark:bg-red-600"
                }
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stockLevels.pvcMaterial.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stockLevels.pvcMaterial.percentage}%
                </span>
              </div>
              <Progress
                value={stockLevels.pvcMaterial.percentage}
                className="h-2 bg-gray-200 dark:bg-gray-700"
                indicatorClassName={
                  stockLevels.pvcMaterial.percentage > 50
                    ? "bg-green-500 dark:bg-green-600"
                    : stockLevels.pvcMaterial.percentage > 25
                    ? "bg-yellow-500 dark:bg-yellow-600"
                    : "bg-red-500 dark:bg-red-600"
                }
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stockLevels.packaging.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {stockLevels.packaging.percentage}%
                </span>
              </div>
              <Progress
                value={stockLevels.packaging.percentage}
                className="h-2 bg-gray-200 dark:bg-gray-700"
                indicatorClassName={
                  stockLevels.packaging.percentage > 50
                    ? "bg-green-500 dark:bg-green-600"
                    : stockLevels.packaging.percentage > 25
                    ? "bg-yellow-500 dark:bg-yellow-600"
                    : "bg-red-500 dark:bg-red-600"
                }
              />
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No stock level data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockStatus;
