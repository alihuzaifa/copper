import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Loader2, MinusCircle } from "lucide-react";
import dayjs from "dayjs";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// API Types based on backend
interface VendorUser {
  id: string;
  name: string;
}

interface DrawInventoryItem {
  id: string;
  name: string;
  quantity: number;
}

interface ReadyCopperRecord {
  _id: string;
  vendorId: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  drawInventoryId: {
    _id: string;
    newName: string;
    quantity: number;
  };
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  history: Array<{
    _id: string;
    action: string;
    quantity: number;
    totalAmount: number;
    actionDate: string;
    actionBy: string;
    notes: string;
    previousQuantity: number;
    newQuantity: number;
  }>;
}

// API Response Types
interface GetVendorUsersResponse {
  success: boolean;
  data: VendorUser[];
}

interface GetDrawInventoryItemsResponse {
  success: boolean;
  data: DrawInventoryItem[];
}

interface GetReadyCopperResponse {
  success: boolean;
  data: ReadyCopperRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AddReadyCopperResponse {
  success: boolean;
  message: string;
  data: ReadyCopperRecord;
}

interface AddReadyCopperProps {
  onDataChange?: () => void;
}

// Validation schema
const readyCopperSchema = z.object({
  vendorId: z.string().min(1, "Select a Vendor User"),
  drawInventoryId: z.string().min(1, "Select a Draw Inventory Item"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
});

const AddReadyCopper = ({ onDataChange }: AddReadyCopperProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<VendorUser[]>([]);
  const [items, setItems] = useState<DrawInventoryItem[]>([]);
  const [records, setRecords] = useState<ReadyCopperRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeRecordId, setRemoveRecordId] = useState<string>("");
  const [removeQuantity, setRemoveQuantity] = useState<string>("");
  const [removeError, setRemoveError] = useState<string>("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalRecordId, setHistoryModalRecordId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(readyCopperSchema),
    defaultValues: {
      vendorId: "",
      drawInventoryId: "",
      quantity: "",
    },
    mode: "onTouched",
  });

  const watchedVendorId = watch("vendorId");
  const watchedDrawInventoryId = watch("drawInventoryId");
  
  // Get available quantity for selected item
  const getAvailableQuantity = () => {
    if (!watchedDrawInventoryId) return 0;
    const selectedItem = items.find(item => item.id === watchedDrawInventoryId);
    return selectedItem ? selectedItem.quantity : 0;
  };

  // Fetch vendor users - using the correct endpoint from backend
  const fetchVendorUsers = async () => {
    try {
      const response = await request<void, GetVendorUsersResponse>({
        url: '/ready-copper/vendor-users',
        method: 'GET'
      });

      if (response.success) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching vendor users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vendor users",
        variant: "destructive",
      });
    }
  };

  // Fetch draw inventory items - using the correct endpoint from backend
  const fetchDrawInventoryItems = async () => {
    try {
      const response = await request<void, GetDrawInventoryItemsResponse>({
        url: '/ready-copper/draw-inventory-items',
        method: 'GET'
      });

      if (response.success) {
        setItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching draw inventory items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch draw inventory items",
        variant: "destructive",
      });
    }
  };

  // Fetch ready copper records
  const fetchReadyCopperRecords = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetReadyCopperResponse>({
        url: '/ready-copper',
        method: 'GET'
      });

      if (response.success) {
        setRecords(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching ready copper records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ready copper records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add ready copper record
  const onAdd = async (data: {
    vendorId: string;
    drawInventoryId: string;
    quantity: string;
  }) => {
    try {
      setFormLoading(true);
      
      // Convert quantity to number
      const quantity = Number(data.quantity);
      
      // Validate quantity against available inventory
      const selectedItem = items.find(item => item.id === data.drawInventoryId);
      if (!selectedItem) {
        toast({
          title: "Error",
          description: "Selected item not found",
          variant: "destructive",
        });
        return;
      }
      
      if (quantity > selectedItem.quantity) {
        toast({
          title: "Error",
          description: `Cannot add more than available quantity. Available: ${selectedItem.quantity}, Requested: ${quantity}`,
          variant: "destructive",
        });
        return;
      }
      
      // Calculate total amount (you might want to get this from the selected item)
      const totalAmount = quantity * 100; // Mock calculation - adjust as needed
      
      const response = await request<any, AddReadyCopperResponse>({
        url: '/ready-copper/add',
        method: 'POST',
        data: {
          vendorId: data.vendorId,
          drawInventoryId: data.drawInventoryId,
          quantity: quantity,
          totalAmount: totalAmount,
          notes: `Added ${quantity} kg for ready copper processing`
        }
      });

      if (response.success) {
        // Refresh records
        await fetchReadyCopperRecords();
        
        setModalOpen(false);
        reset();
        toast({
          title: "Success",
          description: response.message,
        });
        
        // Trigger refresh in other components
        onDataChange?.();
      }
    } catch (error: any) {
      console.error('Error adding ready copper record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add ready copper record",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Remove from ready copper
  const onRemove = async () => {
    setRemoveError("");
    if (!removeRecordId || !removeQuantity) {
      setRemoveError("Please select a ready copper item and enter quantity.");
      return;
    }
    const record = records.find(r => r._id === removeRecordId);
    if (!record) {
      setRemoveError("Invalid ready copper item selected.");
      return;
    }
    const qty = parseFloat(removeQuantity);
    if (isNaN(qty) || qty <= 0) {
      setRemoveError("Enter a valid quantity.");
      return;
    }
    if (qty > record.quantity) {
      setRemoveError(`Cannot remove more than available quantity (${record.quantity}).`);
      return;
    }
    try {
      setRemoveLoading(true);
      const response = await request<any, { success: boolean; message: string }>({
        url: '/ready-copper/remove',
        method: 'POST',
        data: {
          vendorId: record.vendorId._id,
          drawInventoryId: record.drawInventoryId._id,
          quantity: qty,
          notes: `Removed ${qty} kg from ready copper processing.`
        }
      });
      if (response.success) {
        await fetchReadyCopperRecords();
        setRemoveModalOpen(false);
        setRemoveRecordId("");
        setRemoveQuantity("");
        toast({ title: "Success", description: response.message });
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        setRemoveError(response.message || "Failed to remove from ready copper processing.");
      }
    } catch (error: any) {
      setRemoveError(error.message || "Failed to remove from ready copper processing.");
    } finally {
      setRemoveLoading(false);
    }
  };

  const openHistoryModal = (recordId: string) => {
    setHistoryModalRecordId(recordId);
    setHistoryModalOpen(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchVendorUsers();
    fetchDrawInventoryItems();
    fetchReadyCopperRecords();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-sans">
            Ready Copper
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Ready Copper</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Vendor User</label>
                    <Controller
                      name="vendorId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={formLoading}
                          >
                            <SelectTrigger className={
                              fieldState.invalid
                                ? "border-red-500"
                                : fieldState.isTouched && field.value
                                ? "border-green-500"
                                : "border-gray-300 dark:border-gray-700"
                            }>
                              <SelectValue placeholder="Select a Vendor User" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <div className="text-red-600 text-xs mt-1">{errors.vendorId?.message as string}</div>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Draw Inventory Item</label>
                    <Controller
                      name="drawInventoryId"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={!watchedVendorId || formLoading}
                          >
                            <SelectTrigger className={
                              fieldState.invalid
                                ? "border-red-500"
                                : fieldState.isTouched && field.value
                                ? "border-green-500"
                                : "border-gray-300 dark:border-gray-700"
                            }>
                              <SelectValue placeholder={
                                !watchedVendorId 
                                  ? "Select a vendor user first" 
                                  : "Select a draw inventory item"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} (Available: {item.quantity})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.invalid && (
                            <div className="text-red-600 text-xs mt-1">{errors.drawInventoryId?.message as string}</div>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Quantity (Available: {getAvailableQuantity()})</label>
                    <Controller
                      name="quantity"
                      control={control}
                      render={({ field, fieldState }) => (
                        <>
                          <Input
                            type="number"
                            min="1"
                            max={getAvailableQuantity()}
                            placeholder="Enter quantity"
                            {...field}
                            disabled={formLoading || !watchedDrawInventoryId}
                          />
                          {fieldState.invalid && (
                            <div className="text-red-600 text-xs mt-1">{errors.quantity?.message as string}</div>
                          )}
                          {watchedDrawInventoryId && getAvailableQuantity() === 0 && (
                            <div className="text-orange-600 text-xs mt-1">No quantity available for this item</div>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setModalOpen(false)}
                      disabled={formLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" onClick={() => setRemoveModalOpen(true)}>
                  <MinusCircle className="mr-2 h-4 w-4" /> Remove from Ready Copper
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Remove from Ready Copper</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Ready Copper Item</label>
                    <Select value={removeRecordId} onValueChange={setRemoveRecordId} disabled={removeLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ready copper item" />
                      </SelectTrigger>
                      <SelectContent>
                        {records.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.productName} (Qty: {r.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Quantity to Remove</label>
                    <Input
                      type="number"
                      min="0"
                      value={removeQuantity}
                      onChange={e => setRemoveQuantity(e.target.value)}
                      placeholder="Enter quantity"
                      disabled={removeLoading}
                    />
                  </div>
                  {removeError && <div className="text-red-600 text-xs">{removeError}</div>}
                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" onClick={() => setRemoveModalOpen(false)} disabled={removeLoading}>
                      Cancel
                    </Button>
                    <Button onClick={onRemove} disabled={removeLoading}>
                      {removeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Remove
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading records...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vendor User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{record.vendorId.name}</td>
                      <td className="px-4 py-2">{record.productName}</td>
                      <td className="px-4 py-2">{record.quantity}</td>
                      <td className="px-4 py-2">{record.totalAmount}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openHistoryModal(record._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Per-row History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-none">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((r) => r._id === historyModalRecordId)
                  .map((record) =>
                    record.history.map((h: any) => (
                      <tr key={h._id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">
                          <span
                            className={
                              h.action === "created" || h.action === "added"
                                ? "text-green-600"
                                : h.action === "return" || h.action === "returned"
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {h.action.charAt(0).toUpperCase() + h.action.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
                        <td className="px-4 py-2">{dayjs(h.actionDate).format("YYYY-MM-DD HH:mm:ss")}</td>
                        <td className="px-4 py-2">{h.quantity}</td>
                        <td className="px-4 py-2">{h.notes}</td>
                      </tr>
                    ))
                  )}
                {!records.some((r) => r._id === historyModalRecordId) && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReadyCopper; 