import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Loader2, MinusCircle } from "lucide-react";
import dayjs from "dayjs";
import DrawProcessingForm from "./DrawProcessingForm";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// API Types based on backend
interface DrawerUser {
  id: string;
  name: string;
}

interface KachaProcessingItem {
  id: string;
  name: string;
  quantity: number;
}

interface DrawProcessingRecord {
  _id: string;
  drawerUserId: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  kachaInventoryId: {
    _id: string;
    // ...other fields if needed
  };
  kachaName: string;
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
interface GetDrawerUsersResponse {
  success: boolean;
  data: DrawerUser[];
}

interface GetKachaProcessingItemsResponse {
  success: boolean;
  data: KachaProcessingItem[];
}

interface GetDrawProcessingResponse {
  success: boolean;
  data: DrawProcessingRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AddDrawProcessingResponse {
  success: boolean;
  message: string;
  data: DrawProcessingRecord;
}

interface AddDrawProcessingProps {
  onDataChange?: () => void;
}

const AddDrawProcessing = ({ onDataChange }: AddDrawProcessingProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<DrawerUser[]>([]);
  const [items, setItems] = useState<KachaProcessingItem[]>([]);
  const [records, setRecords] = useState<DrawProcessingRecord[]>([]);
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

  // Fetch drawer users - using the correct endpoint from backend
  const fetchDrawerUsers = async () => {
    try {
      const response = await request<void, GetDrawerUsersResponse>({
        url: '/draw-processing/drawer-users',
        method: 'GET'
      });

      if (response.success) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching drawer users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch drawer users",
        variant: "destructive",
      });
    }
  };

  // Fetch kacha processing items - using the correct endpoint from backend
  const fetchKachaProcessingItems = async () => {
    try {
      const response = await request<void, GetKachaProcessingItemsResponse>({
        url: '/draw-processing/products',
        method: 'GET'
      });

      if (response.success) {
        setItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching kacha processing items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch kacha processing items",
        variant: "destructive",
      });
    }
  };

  // Fetch draw processing records
  const fetchDrawProcessingRecords = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetDrawProcessingResponse>({
        url: '/draw-processing',
        method: 'GET'
      });

      if (response.success) {
        setRecords(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching draw processing records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch draw processing records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add draw processing record
  const onAdd = async (data: {
    drawerUserId: string;
    kachaInventoryId: string;
    quantity: number;
    totalAmount: number;
  }) => {
    try {
      setFormLoading(true);
      
      const response = await request<any, AddDrawProcessingResponse>({
        url: '/draw-processing/add',
        method: 'POST',
        data: {
          drawerUserId: data.drawerUserId,
          kachaInventoryId: data.kachaInventoryId,
          quantity: data.quantity,
          totalAmount: data.totalAmount,
          notes: `Added ${data.quantity} kg for draw processing`
        }
      });

      if (response.success) {
        // Refresh records
        await fetchDrawProcessingRecords();
        
        setModalOpen(false);
        toast({
          title: "Success",
          description: response.message,
        });
        
        // Trigger refresh in other components
        onDataChange?.();
      }
    } catch (error: any) {
      console.error('Error adding draw processing record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add draw processing record",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Remove from draw processing
  const onRemove = async () => {
    setRemoveError("");
    if (!removeRecordId || !removeQuantity) {
      setRemoveError("Please select a draw item and enter quantity.");
      return;
    }
    const record = records.find(r => r._id === removeRecordId);
    if (!record) {
      setRemoveError("Invalid draw item selected.");
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
        url: '/draw-processing/remove',
        method: 'POST',
        data: {
          drawerUserId: record.drawerUserId._id,
          kachaInventoryId: record.kachaInventoryId._id,
          quantity: qty,
          notes: `Removed ${qty} kg from draw processing.`
        }
      });
      if (response.success) {
        await fetchDrawProcessingRecords();
        setRemoveModalOpen(false);
        setRemoveRecordId("");
        setRemoveQuantity("");
        toast({ title: "Success", description: response.message });
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        setRemoveError(response.message || "Failed to remove from draw processing.");
      }
    } catch (error: any) {
      setRemoveError(error.message || "Failed to remove from draw processing.");
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
    fetchDrawerUsers();
    fetchKachaProcessingItems();
    fetchDrawProcessingRecords();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-sans">
            Draw Processing
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
                  <DialogTitle>Add Draw Processing</DialogTitle>
                </DialogHeader>
                <DrawProcessingForm
                  onSubmit={onAdd}
                  onCancel={() => setModalOpen(false)}
                  users={users}
                  products={items}
                  isLoading={formLoading}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" onClick={() => setRemoveModalOpen(true)}>
                  <MinusCircle className="mr-2 h-4 w-4" /> Remove from Draw
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Remove from Draw</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Draw Item</label>
                    <Select value={removeRecordId} onValueChange={setRemoveRecordId} disabled={removeLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select draw item" />
                      </SelectTrigger>
                      <SelectContent>
                        {records.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.kachaName} (Qty: {r.quantity})
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Drawer User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kacha Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{record.drawerUserId.name}</td>
                      <td className="px-4 py-2">{record.kachaName}</td>
                      <td className="px-4 py-2">{record.quantity}</td>
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
                      <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">
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
          {(() => {
            const record = records.find((r) => r._id === historyModalRecordId);
            let content;
            if (record && record.history.length > 0) {
              content = (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {record.history.map((h: any) => (
                    <div
                      key={h._id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize text-primary">
                          {h.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {dayjs(h.actionDate).format("MMM D, YYYY")}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p>Quantity: {h.quantity} kg</p>
                        {h.notes && (
                          <p className="text-gray-600 dark:text-gray-400">
                            {h.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            } else {
              content = (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No history found.
                </div>
              );
            }
            return content;
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddDrawProcessing; 