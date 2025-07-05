import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Loader2, MinusCircle } from "lucide-react";
import dayjs from "dayjs";
import KachaProcessingForm from "./KachaProcessingForm";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// API Types
interface KachaUser {
  _id: string;
  name: string;
  phoneNumber?: string;
  totalAmount?: number;
  paidAmount?: number;
  remainingAmount?: number;
}

interface PurchaseItem {
  id: string;
  _id?: string;
  name: string;
  materialName?: string;
  quantity: number;
  pricePerUnit?: number;
}

interface KachaProcessingRecord {
  _id: string;
  kachaUserId: KachaUser;
  purchaseItemId: PurchaseItem;
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
interface GetKachaUsersResponse {
  success: boolean;
  data: KachaUser[];
}

interface GetProductsResponse {
  success: boolean;
  data: PurchaseItem[];
}

interface GetKachaProcessingResponse {
  success: boolean;
  data: KachaProcessingRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface AddKachaProcessingResponse {
  success: boolean;
  message: string;
  data: KachaProcessingRecord;
}

const getPurchaseItemName = (purchaseItem: PurchaseItem) => purchaseItem?.name || '';
const getPurchaseItemId = (purchaseItem: PurchaseItem) => purchaseItem?.id || '';
const getPurchaseItemQuantity = (purchaseItem: PurchaseItem) => purchaseItem?.quantity || 0;

const AddKachaProcessing = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<KachaUser[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [records, setRecords] = useState<KachaProcessingRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeRecordId, setRemoveRecordId] = useState<string>("");
  const [removeQuantity, setRemoveQuantity] = useState<string>("");
  const [removeError, setRemoveError] = useState<string>("");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalKachaUserId, setHistoryModalKachaUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch kacha users
  const fetchKachaUsers = async () => {
    try {
      const response = await request<void, GetKachaUsersResponse>({
        url: '/users/kacha-users/all',
        method: 'GET'
      });

      if (response.success) {
        setUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching kacha users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch kacha users",
        variant: "destructive",
      });
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await request<void, GetProductsResponse>({
        url: '/kacha-processing/products',
        method: 'GET'
      });

      if (response.success) {
        setItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      });
    }
  };

  // Fetch kacha processing records
  const fetchKachaProcessingRecords = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetKachaProcessingResponse>({
        url: '/kacha-processing',
        method: 'GET'
      });

      if (response.success) {
        setRecords(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching kacha processing records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch kacha processing records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add kacha processing record
  const onAdd = async (data: {
    kachaUserId: string;
    purchaseItemId: string;
    quantity: number;
    totalAmount: number;
  }) => {
    try {
      setFormLoading(true);
      
      const response = await request<any, AddKachaProcessingResponse>({
        url: '/kacha-processing/add',
        method: 'POST',
        data: {
          kachaUserId: data.kachaUserId,
          purchaseItemId: data.purchaseItemId,
          quantity: data.quantity,
          totalAmount: data.totalAmount,
          notes: `Added ${data.quantity} kg for processing`
        }
      });

      if (response.success) {
        // Refresh records
        await fetchKachaProcessingRecords();
        
        setModalOpen(false);
        toast({
          title: "Success",
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error('Error adding kacha processing record:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add kacha processing record",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Remove from kacha processing
  const onRemove = async () => {
    setRemoveError("");
    if (!removeRecordId || !removeQuantity) {
      setRemoveError("Please select a kacha item and enter quantity.");
      return;
    }
    const record = records.find(r => r._id === removeRecordId);
    if (!record) {
      setRemoveError("Invalid kacha item selected.");
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
        url: '/kacha-processing/remove',
        method: 'POST',
        data: {
          kachaUserId: record.kachaUserId._id,
          purchaseItemId: record.purchaseItemId._id,
          quantity: qty,
          notes: `Removed ${qty} kg from kacha processing.`
        }
      });
      if (response.success) {
        await fetchKachaProcessingRecords();
        setRemoveModalOpen(false);
        setRemoveRecordId("");
        setRemoveQuantity("");
        toast({ title: "Success", description: response.message });
      } else {
        setRemoveError(response.message || "Failed to remove from kacha processing.");
      }
    } catch (error: any) {
      setRemoveError(error.message || "Failed to remove from kacha processing.");
    } finally {
      setRemoveLoading(false);
    }
  };

  const openHistoryModal = (kachaUserId: string, purchaseItemId: string | number) => {
    setHistoryModalKachaUserId(kachaUserId);
    setHistoryModalOpen(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchKachaUsers();
    fetchProducts();
    fetchKachaProcessingRecords();
  }, []);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-sans">
            Kacha Processing
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
                  <DialogTitle>Add Kacha Processing</DialogTitle>
                </DialogHeader>
                <KachaProcessingForm
                  onSubmit={onAdd}
                  onCancel={() => setModalOpen(false)}
                  users={users}
                  items={items}
                  isLoading={formLoading}
                />
              </DialogContent>
            </Dialog>
            <Dialog open={removeModalOpen} onOpenChange={setRemoveModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" onClick={() => setRemoveModalOpen(true)}>
                  <MinusCircle className="mr-2 h-4 w-4" /> Remove from Kacha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Remove from Kacha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Kacha Item</label>
                    <Select value={removeRecordId} onValueChange={setRemoveRecordId} disabled={removeLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select kacha item" />
                      </SelectTrigger>
                      <SelectContent>
                        {records.map((r) => (
                          <SelectItem key={r._id} value={r._id}>
                            {(r.purchaseItemId.name || r.purchaseItemId.materialName) ?? ""} (Qty: {r.quantity})
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kacha User</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{record.kachaUserId.name}</td>
                      <td className="px-4 py-2">{record.totalAmount}</td>
                      <td className="px-4 py-2">{record.quantity}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openHistoryModal(record._id, getPurchaseItemId(record.purchaseItemId))}
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
                  .filter((r) => r._id === historyModalKachaUserId)
                  .map((record) =>
                    record.history.map((h: any) => (
                      <tr key={h._id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">
                          <span
                            className={
                              h.action === "created"
                                ? "text-green-600"
                                : h.action === "return"
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
                {!records.some((r) => r._id === historyModalKachaUserId) && (
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

export default AddKachaProcessing; 