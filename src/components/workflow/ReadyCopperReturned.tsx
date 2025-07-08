import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MinusCircle } from "lucide-react";

// API Types
interface DrawerUser {
  id: string;
  name: string;
}

interface ReadyCopperRecord {
  _id: string;
  vendorId: {
    _id: string;
    name: string;
    phoneNumber: string;
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
  createdAt: string;
  updatedAt: string;
}

interface ReadyCopperInventoryItem {
  _id: string;
  newName: string;
  productName?: string;
  quantity: number;
  returnDate: string;
  originalReadyCopperId: {
    _id: string;
    vendorId: {
      _id: string;
      name: string;
      phoneNumber: string;
    };
    productName: string;
    quantity: number;
    totalAmount: number;
    status: string;
  };
  returnedBy: {
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response Types
interface GetVendorUsersResponse {
  success: boolean;
  data: DrawerUser[];
}

interface GetReadyCopperByVendorIdResponse {
  success: boolean;
  data: {
    records: ReadyCopperRecord[];
    summary: {
      totalRecords: number;
      totalQuantity: number;
      totalAmount: number;
      activeRecords: number;
      completedRecords: number;
      cancelledRecords: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GetReadyCopperInventoryResponse {
  success: boolean;
  data: ReadyCopperInventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ReturnFromReadyCopperResponse {
  success: boolean;
  message: string;
  data: {
    readyCopperProcessing: ReadyCopperRecord;
    inventoryItem: ReadyCopperInventoryItem;
  };
}

interface DeleteReadyCopperInventoryResponse {
  success: boolean;
  message: string;
  data: {
    deletedQuantity: number;
    remainingQuantity: number;
    itemName: string;
    returnedToProcessing: boolean;
    itemDeleted: boolean;
  };
}

interface ReadyCopperReturnedProps {
  onDataChange?: () => void;
}

// Validation schema
const returnSchema = z.object({
  vendorId: z.string().min(1, "Select a Vendor User"),
  readyCopperId: z.string().min(1, "Select a Ready Copper Item").refine((val) => val !== "undefined", {
    message: "Please select a valid item",
  }),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  newName: z.string().min(1, "Enter a new name"),
});

const ReadyCopperReturned = ({ onDataChange }: ReadyCopperReturnedProps) => {
  const { toast } = useToast();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [drawerUsers, setDrawerUsers] = useState<DrawerUser[]>([]);
  const [readyCopperRecords, setReadyCopperRecords] = useState<ReadyCopperRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<ReadyCopperInventoryItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [removeInventoryItemId, setRemoveInventoryItemId] = useState<string>("");
  const [removeQuantity, setRemoveQuantity] = useState<string>("");
  const [removeError, setRemoveError] = useState<string>("");

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      vendorId: "",
      readyCopperId: "",
      quantity: "",
      newName: "",
    },
    mode: "onTouched",
  });

  const watchedVendorId = watch("vendorId");
  const watchedReadyCopperId = watch("readyCopperId");

  // Fetch vendor users
  const fetchVendorUsers = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetVendorUsersResponse>({
        url: '/ready-copper/vendor-users',
        method: 'GET'
      });

      if (response.success) {
        setDrawerUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching vendor users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch vendor users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ready copper records by vendor ID
  const fetchReadyCopperByVendorId = async (vendorId: string) => {
    try {
      const response = await request<void, GetReadyCopperByVendorIdResponse>({
        url: `/ready-copper/vendor/${vendorId}`,
        method: 'GET'
      });

      if (response.success) {
        // Filter only active records with available quantity
        const activeRecords = response.data.records.filter(record => 
          record.status === 'active' && record.quantity > 0
        );
        setReadyCopperRecords(activeRecords);
      }
    } catch (error: any) {
      console.error('Error fetching ready copper records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ready copper records",
        variant: "destructive",
      });
    }
  };

  // Fetch ready copper inventory
  const fetchReadyCopperInventory = async () => {
    try {
      const response = await request<void, GetReadyCopperInventoryResponse>({
        url: '/ready-copper/inventory',
        method: 'GET'
      });

      if (response.success) {
        setInventoryItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching ready copper inventory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ready copper inventory",
        variant: "destructive",
      });
    }
  };

  // Handle Vendor User selection change
  const handleVendorUserChange = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    // Reset form when user changes
    setValue("readyCopperId", "");
    setValue("quantity", "");
    setValue("newName", "");
    
    if (vendorId) {
      fetchReadyCopperByVendorId(vendorId);
    } else {
      setReadyCopperRecords([]);
    }
  };

  // Handle ready copper record selection change
  const handleReadyCopperRecordChange = (recordId: string) => {
    // Reset quantity and new name when record changes
    setValue("quantity", "");
    setValue("newName", "");
    
    // Auto-fill new name with product name if available
    const selectedRecord = readyCopperRecords.find(r => r._id === recordId);
    if (selectedRecord) {
      setValue("newName", selectedRecord.productName);
    }
  };

  // Handle form submit
  const handleReturnReadyCopper = async (data: any) => {
    try {
      setFormLoading(true);
      
      // Find the selected ready copper record to get drawInventoryId
      const selectedRecord = readyCopperRecords.find(r => r._id === data.readyCopperId);
      if (!selectedRecord) {
        toast({
          title: "Error",
          description: "Selected ready copper record not found",
          variant: "destructive",
        });
        return;
      }

      // Validate quantity
      if (data.quantity > selectedRecord.quantity) {
        toast({
          title: "Error",
          description: `Cannot return more than available quantity. Available: ${selectedRecord.quantity}, Requested: ${data.quantity}`,
          variant: "destructive",
        });
        return;
      }
      
      const response = await request<any, ReturnFromReadyCopperResponse>({
        url: '/ready-copper/return',
        method: 'POST',
        data: {
          vendorId: data.vendorId,
          drawInventoryId: selectedRecord.drawInventoryId._id, // Use the drawInventoryId from the record
          quantity: Number(data.quantity),
          newName: data.newName.trim(),
          notes: `Returned ${data.quantity} kg as "${data.newName.trim()}" from ready copper processing`
        }
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Ready copper returned successfully",
        });
        
        setReturnModalOpen(false);
        reset();
        
        // Refresh data
        if (selectedVendorId) {
          fetchReadyCopperByVendorId(selectedVendorId);
        }
        fetchReadyCopperInventory();
        
        // Trigger refresh in parent components
        onDataChange?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to return ready copper",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Remove from returned inventory
  const handleRemoveFromReturned = async () => {
    setRemoveError("");
    if (!removeInventoryItemId || !removeQuantity) {
      setRemoveError("Please select an inventory item and enter quantity.");
      return;
    }
    
    const inventoryItem = inventoryItems.find(item => item._id === removeInventoryItemId);
    if (!inventoryItem) {
      setRemoveError("Invalid inventory item selected.");
      return;
    }
    
    const qty = parseFloat(removeQuantity);
    if (isNaN(qty) || qty <= 0) {
      setRemoveError("Enter a valid quantity.");
      return;
    }
    if (qty > inventoryItem.quantity) {
      setRemoveError(`Cannot remove more than available quantity (${inventoryItem.quantity}).`);
      return;
    }
    
    try {
      setRemoveLoading(true);
      const response = await request<any, DeleteReadyCopperInventoryResponse>({
        url: `/ready-copper/inventory/${removeInventoryItemId}`,
        method: 'DELETE',
        data: {
          quantity: qty
        }
      });
      
      if (response.success) {
        await fetchReadyCopperInventory();
        setRemoveModalOpen(false);
        setRemoveInventoryItemId("");
        setRemoveQuantity("");
        toast({ 
          title: "Success", 
          description: response.message || "Item removed from returned inventory successfully" 
        });
        
        // Trigger refresh in parent components
        onDataChange?.();
      } else {
        setRemoveError(response.message || "Failed to remove from returned inventory.");
      }
    } catch (error: any) {
      setRemoveError(error.message || "Failed to remove from returned inventory.");
    } finally {
      setRemoveLoading(false);
    }
  };

  // Get available quantity for selected item
  const getAvailableQuantity = () => {
    if (!watchedReadyCopperId) return 0;
    const record = readyCopperRecords.find(r => r._id === watchedReadyCopperId);
    return record ? record.quantity : 0;
  };

  // Get available quantity for selected inventory item
  const getInventoryItemQuantity = () => {
    if (!removeInventoryItemId) return 0;
    const item = inventoryItems.find(item => item._id === removeInventoryItemId);
    return item ? item.quantity : 0;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchVendorUsers();
    fetchReadyCopperInventory();
  }, []);

  // Update Vendor User selection when form value changes
  useEffect(() => {
    if (watchedVendorId && watchedVendorId !== selectedVendorId) {
      handleVendorUserChange(watchedVendorId);
    }
  }, [watchedVendorId]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-sans">
          Returned Ready Copper Inventory
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Ready copper items returned from processing, available for sale
        </p>
        <div className="flex w-full justify-end gap-2 mt-4">
          <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setReturnModalOpen(true)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Return Ready Copper
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Return Ready Copper</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleReturnReadyCopper)} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Vendor User</label>
                  <Controller
                    name="vendorId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleVendorUserChange(value);
                          }}
                          disabled={loading}
                        >
                          <SelectTrigger className={
                            fieldState.invalid
                              ? "border-red-500"
                              : fieldState.isTouched && field.value
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-700"
                          }>
                            <SelectValue placeholder={loading ? "Loading users..." : "Select a Vendor User"} />
                          </SelectTrigger>
                          <SelectContent>
                            {drawerUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.vendorId && errors.vendorId.message}</div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Ready Copper Item</label>
                  <Controller
                    name="readyCopperId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleReadyCopperRecordChange(value);
                          }}
                          disabled={!watchedVendorId || readyCopperRecords.length === 0}
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
                                ? "Select a Vendor User first" 
                                : readyCopperRecords.length === 0 
                                ? "No items available for this user" 
                                : "Select an item"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {readyCopperRecords.map((record) => (
                              <SelectItem key={record._id} value={record._id}>
                                {record.productName} (Qty: {record.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.readyCopperId && errors.readyCopperId.message}</div>
                        )}
                        {watchedVendorId && readyCopperRecords.length === 0 && (
                          <div className="text-yellow-600 text-xs mt-1">
                            No active ready copper items available for this user
                          </div>
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
                          disabled={!watchedReadyCopperId || getAvailableQuantity() === 0}
                          {...field}
                        />
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.quantity && errors.quantity.message}</div>
                        )}
                        {watchedReadyCopperId && getAvailableQuantity() === 0 && (
                          <div className="text-red-600 text-xs mt-1">
                            No quantity available for this item
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Name</label>
                  <Controller
                    name="newName"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Input
                          placeholder="Enter new name for returned item"
                          disabled={!watchedReadyCopperId}
                          {...field}
                        />
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.newName && errors.newName.message}</div>
                        )}
                        {watchedReadyCopperId && field.value && (
                          <div className="text-green-600 text-xs mt-1">
                            Auto-filled with product name. You can edit if needed.
                          </div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setReturnModalOpen(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Return
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" onClick={() => setRemoveModalOpen(true)} disabled={loading}>
                <MinusCircle className="mr-2 h-4 w-4" />
                Remove From Returned
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Remove From Returned</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Inventory Item</label>
                  <Select 
                    value={removeInventoryItemId} 
                    onValueChange={setRemoveInventoryItemId} 
                    disabled={removeLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryItems.map((item) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.newName || item.productName} (Qty: {item.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block mb-1 font-medium">Quantity to Remove (Available: {getInventoryItemQuantity()})</label>
                  <Input
                    type="number"
                    min="1"
                    max={getInventoryItemQuantity()}
                    value={removeQuantity}
                    onChange={e => setRemoveQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    disabled={removeLoading}
                  />
                </div>
                {removeError && <div className="text-red-600 text-xs">{removeError}</div>}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setRemoveModalOpen(false)} 
                    disabled={removeLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRemoveFromReturned} 
                    disabled={removeLoading}
                    variant="destructive"
                  >
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Vendor User</th>
                <th className="px-4 py-2 text-left">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{item.newName || item.originalReadyCopperId.productName}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{item.originalReadyCopperId.vendorId.name}</td>
                    <td className="px-4 py-2">
                      {dayjs(item.returnDate).format('DD/MM/YYYY HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No inventory available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadyCopperReturned; 