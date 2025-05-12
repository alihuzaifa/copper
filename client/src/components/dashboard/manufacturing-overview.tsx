import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  rawMaterials: number;
  finishedProducts: number;
  suppliers: number;
  totalValue: number;
}

const ManufacturingOverview = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: [API_ENDPOINTS.dashboard.stats],
  });

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <CardTitle className="font-sans text-lg">Manufacturing Process Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {/* Manufacturing facility image */}
        <div className="w-full h-64 mb-4 rounded-lg overflow-hidden relative bg-gray-100 dark:bg-gray-700">
          <img 
            src="https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
            alt="Copper wire manufacturing process" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Raw Materials</h4>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Current stock: {stats?.rawMaterials?.toLocaleString() || 0} kg
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Processing</h4>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Active batches: 3
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Capacity utilization: 78%
                </p>
              </>
            )}
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Finished Goods</h4>
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ready for dispatch: {stats?.finishedProducts?.toLocaleString() || 0} units
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Value: ₹{(stats?.totalValue / 100000 || 0).toFixed(1)}L
                </p>
              </>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-10/12" />
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            <p className="mb-3">
              The manufacturing process is currently operating at 78% capacity with 3 active production batches. 
              Draw Process stage is currently experiencing the highest activity with 42% of all manufacturing resources.
            </p>
            <p>
              Efficiency improvements in the Kacha Copper Processing stage have resulted in a 12% reduction in 
              processing time over the last month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManufacturingOverview;
