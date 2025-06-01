import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

// Supplier interface (since shared schema is removed)
interface Supplier {
  id: string | number;
  name: string;
}

const SupplierAnalysis = () => {
  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: [API_ENDPOINTS.suppliers],
  });

  // Mock data for supplier ratings - in a real app, this would come from the backend
  const supplierRatings = {
    quality: 4,
    delivery: 3.5,
    price: 4
  };

  // Prepare supplier distribution data
  const topSuppliers = suppliers?.slice(0, 5).map((supplier, index) => {
    // Calculate a percentage based on the supplier's position
    // This is a mock calculation for demonstration - in a real app, you'd use actual transaction data
    const percentage = 35 - (index * 5);
    return {
      id: supplier.id,
      name: supplier.name,
      percentage
    };
  }) || [];

  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <CardTitle className="font-sans text-lg">Supplier Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))
          ) : topSuppliers.length > 0 ? (
            topSuppliers.map(supplier => (
              <div key={supplier.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{supplier.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{supplier.percentage}%</span>
                </div>
                <Progress 
                  value={supplier.percentage} 
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No suppliers available
            </div>
          )}
        </div>
        
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="font-medium text-sm mb-3">Supplier Ratings</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Overall Quality</span>
              <div className="flex text-yellow-400">
                {Array(5).fill(0).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className="h-4 w-4" 
                    fill={idx < supplierRatings.quality ? "currentColor" : "none"} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Delivery Timeliness</span>
              <div className="flex text-yellow-400">
                {Array(5).fill(0).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className="h-4 w-4" 
                    fill={
                      idx < Math.floor(supplierRatings.delivery) 
                        ? "currentColor" 
                        : idx < supplierRatings.delivery 
                          ? "currentColor" 
                          : "none"
                    }
                    strokeWidth={idx < Math.floor(supplierRatings.delivery) ? 0 : 2}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Price Competitiveness</span>
              <div className="flex text-yellow-400">
                {Array(5).fill(0).map((_, idx) => (
                  <Star 
                    key={idx} 
                    className="h-4 w-4" 
                    fill={idx < supplierRatings.price ? "currentColor" : "none"} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierAnalysis;
