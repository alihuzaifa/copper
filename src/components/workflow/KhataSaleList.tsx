import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// --- Local interfaces ---
interface ProductItem {
  id: number;
  name: string;
  availableQty: number;
  sellingQty: number;
  price: number;
  total: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  saleDate: string;
  paymentTypes: string[];
  cashAmount?: string;
  bankAmount?: string;
  bankName?: string;
  checkAmount?: string;
  checkNumber?: string;
}

interface KhataSaleRecord {
  id: number;
  customer: CustomerDetails;
  products: ProductItem[];
  totalBill: number;
  date: string;
  history: KhataSaleHistory[];
}

interface KhataSaleHistory {
  date: string;
  action: 'add' | 'delete';
  note?: string;
}

interface KhataSaleListProps {
  onDataChange?: () => void;
}

const KhataSaleList = ({ onDataChange }: KhataSaleListProps) => {
  const { toast } = useToast();
  const [khataSales, setKhataSales] = useState<KhataSaleRecord[]>([]);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; sale: KhataSaleRecord | null }>({ open: false, sale: null });
  const [loading, setLoading] = useState(false);

  // Fetch khata sales data
  const fetchKhataSales = async () => {
    try {
      setLoading(true);
      // For now, we'll use empty data
      const dummyData: KhataSaleRecord[] = [];
      setKhataSales(dummyData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch khata sales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKhataSales();
  }, []);

  // Delete Khata Sale
  const handleDeleteSale = async (id: number) => {
    try {
      // Here you would typically make an API call to delete the khata sale
      // For now, we'll just remove it from local state
      setKhataSales((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: "Success",
        description: "Khata sale deleted successfully",
      });
      
      // Trigger refresh in parent component
      onDataChange?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete khata sale",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading khata sales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Previous Khata Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Bill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {khataSales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No sales yet.
                    </td>
                  </tr>
                )}
                {khataSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.customer.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(sale.date), "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <ul className="list-disc list-inside">
                        {sale.products.map((p) => (
                          <li key={p.id}>
                            {p.name} (Qty: {p.sellingQty}, Rs. {p.price})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Rs. {sale.totalBill.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setHistoryModal({ open: true, sale })}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Button 
                        variant="destructive" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleDeleteSale(sale.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* History Modal */}
      <Dialog 
        open={historyModal.open} 
        onOpenChange={(open) => setHistoryModal({ open, sale: open ? historyModal.sale : null })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Khata Sale History</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyModal.sale?.history.map((h, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {h.action}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(h.date), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {h.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KhataSaleList; 