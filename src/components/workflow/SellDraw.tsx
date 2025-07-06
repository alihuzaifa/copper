import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs from "dayjs";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface DrawInventoryItem {
  _id: string;
  originalDrawProcessingId: string;
  newName: string;
  quantity: number;
  returnDate: string;
  shopId: string;
  returnedBy: string;
}

interface DrawSale {
  _id: string;
  drawInventoryId: string;
  originalDrawProcessingId: string | { _id: string; [key: string]: any };
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  buyerName: string;
  saleDate: string;
  shopId: string;
  soldBy: string;
  notes?: string;
}

interface GetDrawInventoryResponse {
  success: boolean;
  data: DrawInventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GetDrawSalesResponse {
  success: boolean;
  data: DrawSale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface SellFormData {
  inventoryItemId: string;
  quantity: number | string;
  pricePerUnit: number | string;
  buyerName: string;
}

interface SellDrawProps {
  onDataChange?: () => void;
}

const SellDraw = ({ onDataChange }: SellDrawProps) => {
  const { toast } = useToast();
  const [returnedInventory, setReturnedInventory] = useState<DrawInventoryItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<DrawSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);

  // Sell Draw modal state
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<DrawSale | null>(null);

  // react-hook-form for Sell Draw
  const sellSchema: z.ZodSchema<SellFormData> = z.object({
    inventoryItemId: z.string().min(1, "Select an item"),
    quantity: z.coerce.number().positive("Enter a valid quantity"),
    pricePerUnit: z.coerce.number().positive("Enter a valid price"),
    buyerName: z.string().min(1, "Enter buyer name"),
  });

  const {
    register: sellRegister,
    handleSubmit: handleSellSubmit,
    control: sellControl,
    formState: { errors: sellErrors, touchedFields: sellTouched },
    reset: sellReset,
  } = useForm<SellFormData>({
    resolver: zodResolver(sellSchema),
    defaultValues: {
      inventoryItemId: "",
      quantity: "",
      pricePerUnit: "",
      buyerName: "",
    },
    mode: "onTouched",
  });

  // Fetch returned draw inventory
  const fetchReturnedInventory = async () => {
    try {
      const response = await request<void, GetDrawInventoryResponse>({
        url: '/draw-processing/inventory',
        method: 'GET',
      });
      if (response.success) {
        setReturnedInventory(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch returned inventory",
        variant: "destructive",
      });
    }
  };

  // Fetch sales history
  const fetchSalesHistory = async () => {
    try {
      const response = await request<void, GetDrawSalesResponse>({
        url: '/draw-processing/sales',
        method: 'GET',
      });
      if (response.success) {
        setSalesHistory(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch sales history",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchReturnedInventory(), fetchSalesHistory()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Sell Draw handler
  const onSellDraw = async (data: SellFormData) => {
    try {
      setSellLoading(true);
      const response = await request<any, { success: boolean; message: string }>({
        url: '/draw-processing/inventory/sell',
        method: 'POST',
        data: {
          inventoryItemId: data.inventoryItemId,
          quantity: Number(data.quantity),
          pricePerUnit: Number(data.pricePerUnit),
          buyerName: data.buyerName,
        },
      });
      if (response.success) {
        toast({ title: 'Success', description: response.message });
        sellReset();
        setSellModalOpen(false);
        fetchReturnedInventory();
        fetchSalesHistory();
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to sell draw.', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to sell draw.', variant: 'destructive' });
    } finally {
      setSellLoading(false);
    }
  };

  // Delete individual sale
  const handleDeleteSale = async (saleId: string) => {
    const sale = salesHistory.find(s => s._id === saleId);
    if (!sale) return;

    setSaleToDelete(sale);
    setDeleteConfirmModalOpen(true);
  };

  // Confirm and execute delete
  const confirmDeleteSale = async () => {
    if (!saleToDelete) return;

    try {
      setDeletingSaleId(saleToDelete._id);
      const response = await request<any, { success: boolean; message: string }>({
        url: `/draw-processing/sales/${saleToDelete._id}`,
        method: 'DELETE',
      });
      if (response.success) {
        toast({ title: 'Success', description: response.message });
        fetchReturnedInventory();
        fetchSalesHistory();
        setDeleteConfirmModalOpen(false);
        setSaleToDelete(null);
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        toast({ title: 'Error', description: response.message || 'Failed to delete sale.', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete sale.', variant: 'destructive' });
    } finally {
      setDeletingSaleId(null);
    }
  };

  const selectedSellItemId = useWatch({ control: sellControl, name: "inventoryItemId" });
  const selectedSellItem = returnedInventory.find((item) => item._id === selectedSellItemId);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-sans">Sales History</CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Record of all draw sales
        </p>
        <div className="flex w-full justify-end gap-2 mt-4">
          <Dialog open={sellModalOpen} onOpenChange={setSellModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSellModalOpen(true)}>
                Sell Draw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Sell Draw</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSellSubmit(onSellDraw)} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Item to Sell</label>
                  <Controller
                    name="inventoryItemId"
                    control={sellControl}
                    render={({ field, fieldState }) => (
                      <>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={sellLoading}
                        >
                          <SelectTrigger className={
                            fieldState.invalid
                              ? "border-red-500"
                              : fieldState.isTouched && field.value
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-700"
                          }>
                            <SelectValue placeholder="Select Item" />
                          </SelectTrigger>
                          <SelectContent>
                            {returnedInventory.map((inv) => (
                              <SelectItem key={inv._id} value={inv._id}>
                                {inv.newName} (Available: {inv.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{sellErrors.inventoryItemId?.message as string}</div>
                        )}
                      </>
                    )}
                  />
                  {selectedSellItem && (
                    <div className="text-xs text-gray-500 mt-1">Available: {selectedSellItem.quantity}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Quantity to Sell</label>
                  <Input
                    {...sellRegister("quantity")}
                    type="number"
                    min="0"
                    placeholder="Enter quantity"
                    disabled={sellLoading}
                    className={
                      sellErrors.quantity
                        ? "border-red-500"
                        : sellTouched.quantity
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                  {sellErrors.quantity && (
                    <div className="text-red-600 text-xs mt-1">{sellErrors.quantity.message as string}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Price per Unit</label>
                  <Input
                    {...sellRegister("pricePerUnit")}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Enter price per unit"
                    disabled={sellLoading}
                    className={
                      sellErrors.pricePerUnit
                        ? "border-red-500"
                        : sellTouched.pricePerUnit
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                  {sellErrors.pricePerUnit && (
                    <div className="text-red-600 text-xs mt-1">{sellErrors.pricePerUnit.message as string}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Buyer Name</label>
                  <Input
                    {...sellRegister("buyerName")}
                    type="text"
                    placeholder="Enter buyer name"
                    disabled={sellLoading}
                    className={
                      sellErrors.buyerName
                        ? "border-red-500"
                        : sellTouched.buyerName
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                  {sellErrors.buyerName && (
                    <div className="text-red-600 text-xs mt-1">{sellErrors.buyerName.message as string}</div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => { setSellModalOpen(false); sellReset(); }} disabled={sellLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sellLoading}>
                    {sellLoading ? "Selling..." : "Sell"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Loading sales history...
                  </td>
                </tr>
              ) : salesHistory.length > 0 ? (
                salesHistory.map((sale) => (
                  <tr key={sale._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">
                      <div>
                        <span className="font-medium">{sale.itemName}</span>
                        <span className="text-xs text-gray-500 block">
                          (Originally: {typeof sale.originalDrawProcessingId === 'object' ? sale.originalDrawProcessingId._id || 'N/A' : sale.originalDrawProcessingId || "N/A"})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{sale.quantity}</td>
                    <td className="px-4 py-2">{sale.pricePerUnit}</td>
                    <td className="px-4 py-2">{sale.totalAmount}</td>
                    <td className="px-4 py-2">{sale.buyerName}</td>
                    <td className="px-4 py-2">{dayjs(sale.saleDate).format("YYYY-MM-DD HH:mm")}</td>
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSale(sale._id)}
                        disabled={deletingSaleId === sale._id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmModalOpen} onOpenChange={setDeleteConfirmModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete Sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {saleToDelete && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this sale? The quantity will be returned to inventory.
                </p>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Item:</span>
                    <span className="text-sm">{saleToDelete.itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Quantity:</span>
                    <span className="text-sm">{saleToDelete.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Buyer:</span>
                    <span className="text-sm">{saleToDelete.buyerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Amount:</span>
                    <span className="text-sm">{saleToDelete.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteConfirmModalOpen(false);
                  setSaleToDelete(null);
                }}
                disabled={deletingSaleId === saleToDelete?._id}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteSale}
                disabled={deletingSaleId === saleToDelete?._id}
              >
                {deletingSaleId === saleToDelete?._id ? "Deleting..." : "Delete Sale"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SellDraw; 