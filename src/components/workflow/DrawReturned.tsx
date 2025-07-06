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

interface DrawProcessingRecord {
  _id: string;
  drawerUserId: {
    _id: string;
    name: string;
    phoneNumber: string;
  };
  kachaInventoryId: {
    _id: string;
    newName: string;
    quantity: number;
  };
  kachaName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DrawInventoryItem {
  _id: string;
  newName: string;
  quantity: number;
  returnDate: string;
  originalDrawProcessingId: string;
}

// API Response Types
interface GetDrawerUsersResponse {
  success: boolean;
  data: DrawerUser[];
}

interface GetDrawProcessingByDrawerIdResponse {
  success: boolean;
  data: {
    records: DrawProcessingRecord[];
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

interface ReturnFromDrawProcessingResponse {
  success: boolean;
  message: string;
  data: {
    drawProcessing: DrawProcessingRecord;
    inventoryItem: DrawInventoryItem;
  };
}

interface DeleteDrawInventoryResponse {
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

interface DrawReturnedProps {
  onDataChange?: () => void;
}

const DrawReturned = ({ onDataChange }: DrawReturnedProps) => {
  const { toast } = useToast();
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [drawerUsers, setDrawerUsers] = useState<DrawerUser[]>([]);
  const [drawProcessingRecords, setDrawProcessingRecords] = useState<DrawProcessingRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<DrawInventoryItem[]>([]);
  const [selectedDrawerUserId, setSelectedDrawerUserId] = useState<string>("");
  const [removeInventoryItemId, setRemoveInventoryItemId] = useState<string>("");
  const [removeQuantity, setRemoveQuantity] = useState<string>("");
  const [removeError, setRemoveError] = useState<string>("");

  // Validation schema
  const returnSchema = z.object({
    drawerUserId: z.string().min(1, "Select a Drawer User"),
    kachaInventoryId: z.string().min(1, "Select an Item").refine((val) => val !== "undefined", {
      message: "Please select a valid item",
    }),
    quantity: z.coerce.number().positive("Enter a valid quantity"),
    newName: z.string().min(1, "Enter a new name"),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      drawerUserId: "",
      kachaInventoryId: "",
      quantity: "",
      newName: "",
    },
    mode: "onTouched",
  });

  const watchedDrawerUserId = watch("drawerUserId");
  const watchedKachaInventoryId = watch("kachaInventoryId");

  // Fetch drawer users
  const fetchDrawerUsers = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetDrawerUsersResponse>({
        url: '/draw-processing/drawer-users',
        method: 'GET'
      });

      if (response.success) {
        setDrawerUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching drawer users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch drawer users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch draw processing records by drawer ID
  const fetchDrawProcessingByDrawerId = async (drawerId: string) => {
    try {
      const response = await request<void, GetDrawProcessingByDrawerIdResponse>({
        url: `/draw-processing/drawer/${drawerId}`,
        method: 'GET'
      });

      if (response.success) {
        setDrawProcessingRecords(response.data.records);
      }
    } catch (error: any) {
      console.error('Error fetching draw processing records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch draw processing records",
        variant: "destructive",
      });
    }
  };

  // Fetch draw inventory
  const fetchDrawInventory = async () => {
    try {
      const response = await request<void, GetDrawInventoryResponse>({
        url: '/draw-processing/inventory',
        method: 'GET'
      });

      if (response.success) {
        setInventoryItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching draw inventory:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch draw inventory",
        variant: "destructive",
      });
    }
  };

  // Handle drawer user selection change
  const handleDrawerUserChange = (drawerId: string) => {
    setSelectedDrawerUserId(drawerId);
    if (drawerId) {
      fetchDrawProcessingByDrawerId(drawerId);
    } else {
      setDrawProcessingRecords([]);
    }
  };

  // Handle form submit
  const handleReturnDraw = async (data: any) => {
    try {
      setFormLoading(true);
      
      const response = await request<any, ReturnFromDrawProcessingResponse>({
        url: '/draw-processing/return',
        method: 'POST',
        data: {
          drawerUserId: data.drawerUserId,
          kachaInventoryId: data.kachaInventoryId,
          quantity: Number(data.quantity),
          newName: data.newName.trim(),
          notes: `Returned ${data.quantity} kg as "${data.newName.trim()}" from draw processing`
        }
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Draw returned successfully",
        });
        
        setReturnModalOpen(false);
        reset();
        
        // Refresh data
        if (selectedDrawerUserId) {
          fetchDrawProcessingByDrawerId(selectedDrawerUserId);
        }
        fetchDrawInventory();
        
        // Trigger refresh in parent components
        onDataChange?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to return draw",
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
      const response = await request<any, DeleteDrawInventoryResponse>({
        url: `/draw-processing/inventory/${removeInventoryItemId}`,
        method: 'DELETE',
        data: {
          quantity: qty
        }
      });
      
      if (response.success) {
        await fetchDrawInventory();
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
    if (!watchedKachaInventoryId) return 0;
    const record = drawProcessingRecords.find(r => r.kachaInventoryId._id === watchedKachaInventoryId);
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
    fetchDrawerUsers();
    fetchDrawInventory();
  }, []);

  // Update drawer user selection when form value changes
  useEffect(() => {
    if (watchedDrawerUserId && watchedDrawerUserId !== selectedDrawerUserId) {
      handleDrawerUserChange(watchedDrawerUserId);
    }
  }, [watchedDrawerUserId]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-sans">
          Returned Draw Inventory
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Draw items returned from processing, available for sale
        </p>
        <div className="flex w-full justify-end gap-2 mt-4">
          <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setReturnModalOpen(true)} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Return Draw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Return Draw</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleReturnDraw)} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Drawer User</label>
                  <Controller
                    name="drawerUserId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleDrawerUserChange(value);
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
                            <SelectValue placeholder={loading ? "Loading users..." : "Select a Drawer User"} />
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
                          <div className="text-red-600 text-xs mt-1">{errors.drawerUserId && errors.drawerUserId.message}</div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Item</label>
                  <Controller
                    name="kachaInventoryId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={!watchedDrawerUserId || drawProcessingRecords.length === 0}
                        >
                          <SelectTrigger className={
                            fieldState.invalid
                              ? "border-red-500"
                              : fieldState.isTouched && field.value
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-700"
                          }>
                            <SelectValue placeholder={
                              !watchedDrawerUserId 
                                ? "Select a drawer user first" 
                                : drawProcessingRecords.length === 0 
                                ? "No items available for this user" 
                                : "Select an item"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {drawProcessingRecords.map((record) => (
                              <SelectItem key={record.kachaInventoryId._id} value={record.kachaInventoryId._id}>
                                {record.kachaName} (Qty: {record.quantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.kachaInventoryId && errors.kachaInventoryId.message}</div>
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
                        />
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.quantity && errors.quantity.message}</div>
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
                          {...field}
                        />
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.newName && errors.newName.message}</div>
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
                          {item.newName} (Qty: {item.quantity})
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
                <th className="px-4 py-2 text-left">Return Date</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <tr key={item._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{item.newName}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">
                      {dayjs(item.returnDate).format('DD/MM/YYYY HH:mm')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
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

export default DrawReturned; 