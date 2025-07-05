import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
}

interface KachaUser {
  _id: string;
  name: string;
}

interface KachaInventoryItem {
  _id: string;
  originalPurchaseItemId: PurchaseItem | string;
  newName: string;
  quantity: number;
  returnDate: string;
  shopId: string;
  returnedBy: string;
}

interface GetKachaInventoryResponse {
  success: boolean;
  data: KachaInventoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface GetProductsResponse {
  success: boolean;
  data: PurchaseItem[];
}

interface GetKachaUsersResponse {
  success: boolean;
  data: KachaUser[];
}

interface AssignmentProduct {
  khataUserId: number;
  productId: {
    _id: string;
    materialName: string;
  };
  givenQuantity: number;
  productName: string;
}

const getPurchaseItemName = (purchaseItem: any) => purchaseItem?.name || purchaseItem?.materialName || '';
const getPurchaseItemId = (purchaseItem: any) => purchaseItem?.id || purchaseItem?._id || '';

const KachaReturned = () => {
  const { toast } = useToast();
  const [returnedInventory, setReturnedInventory] = useState<KachaInventoryItem[]>([]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [kachaUsers, setKachaUsers] = useState<KachaUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Kacha modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  // react-hook-form for Return Kacha
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [availableQuantity, setAvailableQuantity] = useState(0);

  const [assignedProducts, setAssignedProducts] = useState<AssignmentProduct[]>([]);

  // Delete Returned Kacha modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInventoryId, setDeleteInventoryId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteQuantity, setDeleteQuantity] = useState("");
  const selectedDeleteItem = returnedInventory.find((item) => item._id === deleteInventoryId);

  // react-hook-form for Return Kacha
  const returnSchema = z.object({
    kachaUserId: z.string().min(1, "Select a Kacha User"),
    purchaseItemId: z.string().min(1, "Select an Item"),
    quantity: z.coerce.number()
      .positive("Enter a valid quantity")
      .refine((val) => val <= availableQuantity, {
        message: `Quantity exceeds available stock (${availableQuantity})`,
      }),
    newName: z.string().min(1, "Enter a new name"),
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, touchedFields },
    reset,
  } = useForm<{
    kachaUserId: string;
    purchaseItemId: string;
    quantity: number | string;
    newName: string;
  }>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      kachaUserId: "",
      purchaseItemId: "",
      quantity: "",
      newName: "",
    },
    mode: "onTouched",
  });

  // Sync selectedUserId and selectedProductId with form values
  const watchedUserId = useWatch({ control, name: "kachaUserId" });
  const watchedProductId = useWatch({ control, name: "purchaseItemId" });
  useEffect(() => {
    setSelectedUserId(watchedUserId || "");
  }, [watchedUserId]);
  useEffect(() => {
    setSelectedProductId(watchedProductId || "");
  }, [watchedProductId]);

  // Fetch assignments when kacha user changes
  useEffect(() => {
    if (selectedUserId) {
      (async () => {
        try {
          const response = await request<void, { success: boolean; data: AssignmentProduct[] }>({
            url: `/kacha-processing/assignments?khataUserId=${selectedUserId}`,
            method: 'GET',
          });
          if (response.success) {
            // Ensure productId is string for all
            setAssignedProducts(response.data.map(p => ({ ...p, productId: { ...p.productId, _id: String(p.productId._id) } })));
          } else {
            setAssignedProducts([]);
          }
        } catch (error) {
          setAssignedProducts([]);
        }
      })();
    } else {
      setAssignedProducts([]);
    }
    setSelectedProductId("");
    setValue("purchaseItemId", "");
  }, [selectedUserId, setValue]);

  const selectedProduct = assignedProducts.find((item) => item.productId._id === selectedProductId);
  useEffect(() => {
    setAvailableQuantity(selectedProduct?.givenQuantity ?? 0);
  }, [selectedProduct]);

  // Fetch returned kacha inventory
  const fetchReturnedInventory = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetKachaInventoryResponse>({
        url: '/kacha-processing/inventory',
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchase items
  const fetchPurchaseItems = async () => {
    try {
      const response = await request<void, GetProductsResponse>({
        url: '/kacha-processing/products',
        method: 'GET',
      });
      if (response.success) {
        setPurchaseItems(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch purchase items",
        variant: "destructive",
      });
    }
  };

  // Fetch kacha users
  const fetchKachaUsers = async () => {
    try {
      const response = await request<void, GetKachaUsersResponse>({
        url: '/users/kacha-users/all',
        method: 'GET',
      });
      if (response.success) {
        setKachaUsers(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch kacha users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReturnedInventory();
    fetchPurchaseItems();
    fetchKachaUsers();
  }, []);

  // Handle return kacha
  const handleReturnKacha = async (data: {
    kachaUserId: string;
    purchaseItemId: string;
    quantity: number | string;
    newName: string;
  }) => {
    try {
      setReturnLoading(true);
      const product = assignedProducts.find((item) => item.productId._id === data.purchaseItemId);
      const response = await request<any, { success: boolean; message: string }>({
        url: '/kacha-processing/return',
        method: 'POST',
        data: {
          kachaUserId: data.kachaUserId,
          purchaseItemId: product?.productId._id,
          quantity: Number(data.quantity),
          newName: data.newName,
          notes: `Returned ${data.quantity} kg as ${data.newName}`
        }
      });
      if (response.success) {
        setReturnModalOpen(false);
        reset();
        fetchReturnedInventory();
        toast({ title: "Success", description: response.message });
      } else {
        toast({ title: "Error", description: response.message || "Failed to return kacha.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to return kacha.", variant: "destructive" });
    } finally {
      setReturnLoading(false);
    }
  };

  // Handle delete returned kacha (API call, partial quantity allowed)
  const handleDeleteReturnedKacha = async () => {
    setDeleteError("");
    if (!deleteInventoryId || !deleteQuantity) {
      setDeleteError("Please select a returned kacha item and enter quantity.");
      return;
    }
    const qty = parseFloat(deleteQuantity);
    const selectedDeleteItem = returnedInventory.find((item) => item._id === deleteInventoryId);
    const available = selectedDeleteItem?.quantity ?? 0;
    if (isNaN(qty) || qty <= 0) {
      setDeleteError("Enter a valid quantity.");
      return;
    }
    if (qty > available) {
      setDeleteError(`Cannot delete more than available quantity (${available}).`);
      return;
    }
    try {
      setDeleteLoading(true);
      const response = await request<any, { success: boolean; message: string }>({
        url: `/kacha-processing/inventory/${deleteInventoryId}/delete`,
        method: 'POST',
        data: { quantity: qty },
      });
      if (response.success) {
        setDeleteModalOpen(false);
        setDeleteInventoryId("");
        setDeleteQuantity("");
        fetchReturnedInventory();
        toast({ title: "Success", description: response.message });
      } else {
        setDeleteError(response.message || "Failed to delete returned kacha.");
      }
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete returned kacha.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-sans">
          Returned Kacha Inventory
        </CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Kacha returned from processing, available for sale
        </p>
        <div className="flex w-full justify-end gap-2 mt-4">
          <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setReturnModalOpen(true)}>
                Return Kacha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Return Kacha</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleReturnKacha)} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Kacha User</label>
                  <Controller
                    name="kachaUserId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            field.onBlur();
                          }}
                          disabled={returnLoading}
                        >
                          <SelectTrigger className={
                            fieldState.invalid
                              ? "border-red-500"
                              : fieldState.isTouched && field.value
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-700"
                          }>
                            <SelectValue placeholder="Select kacha user" />
                          </SelectTrigger>
                          <SelectContent>
                            {kachaUsers.map((u) => (
                              <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.kachaUserId?.message as string}</div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Item</label>
                  <Controller
                    name="purchaseItemId"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Select
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            field.onBlur();
                          }}
                          disabled={returnLoading || !selectedUserId}
                        >
                          <SelectTrigger className={
                            fieldState.invalid
                              ? "border-red-500"
                              : fieldState.isTouched && field.value
                              ? "border-green-500"
                              : "border-gray-300 dark:border-gray-700"
                          }>
                            <SelectValue placeholder={selectedUserId ? "Select item" : "Select user first"} />
                          </SelectTrigger>
                          <SelectContent>
                            {assignedProducts.map((item) => (
                              <SelectItem key={item.productId._id} value={item.productId._id}>{item.productName} (Quantity: {item.givenQuantity})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.purchaseItemId?.message as string}</div>
                        )}
                        {selectedProduct && (
                          <div className="text-xs text-gray-500 mt-1">Available: {selectedProduct.givenQuantity}</div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Quantity</label>
                  <Input
                    {...register("quantity")}
                    placeholder="Enter quantity"
                    type="number"
                    disabled={returnLoading}
                    className={
                      errors.quantity
                        ? "border-red-500"
                        : touchedFields.quantity
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                  {errors.quantity && (
                    <div className="text-red-600 text-xs mt-1">{errors.quantity.message as string}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">New Name</label>
                  <Input
                    {...register("newName")}
                    placeholder="Enter new name"
                    disabled={returnLoading}
                    className={
                      errors.newName
                        ? "border-red-500"
                        : touchedFields.newName
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                  {errors.newName && (
                    <div className="text-red-600 text-xs mt-1">{errors.newName.message as string}</div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => { setReturnModalOpen(false); reset(); }} disabled={returnLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={returnLoading}>
                    {returnLoading ? "Returning..." : "Return"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
                Delete Returned Kacha
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Returned Kacha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Returned Kacha Item</label>
                  <Select value={deleteInventoryId} onValueChange={setDeleteInventoryId} disabled={deleteLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select returned kacha item" />
                    </SelectTrigger>
                    <SelectContent>
                      {returnedInventory.map((item) => (
                        <SelectItem key={item._id} value={item._id}>{item.newName} (Qty: {item.quantity})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedDeleteItem && (
                    <div className="text-xs text-gray-500 mt-1">Available: {selectedDeleteItem.quantity}</div>
                  )}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Quantity to Delete</label>
                  <Input
                    type="number"
                    min="0"
                    value={deleteQuantity}
                    onChange={e => setDeleteQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    disabled={deleteLoading}
                    className={
                      deleteError
                        ? "border-red-500"
                        : deleteQuantity
                        ? "border-green-500"
                        : "border-gray-300 dark:border-gray-700"
                    }
                  />
                </div>
                {deleteError && <div className="text-red-600 text-xs">{deleteError}</div>}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteReturnedKacha} disabled={deleteLoading}>
                    {deleteLoading ? "Deleting..." : "Delete"}
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Return Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : returnedInventory.length > 0 ? (
                returnedInventory.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">
                      <div>
                        <span className="font-medium">{inv.newName}</span>
                        <span className="text-xs text-gray-500 block">
                          (Originally: {typeof inv.originalPurchaseItemId === 'object' ? getPurchaseItemName(inv.originalPurchaseItemId) :
                            purchaseItems.find((i) => getPurchaseItemId(i) === (typeof inv.originalPurchaseItemId === 'string' ? inv.originalPurchaseItemId : getPurchaseItemId(inv.originalPurchaseItemId)))?.name || "N/A"})
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">{inv.quantity}</td>
                    <td className="px-4 py-2">{dayjs(inv.returnDate).format("YYYY-MM-DD HH:mm")}</td>
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

export default KachaReturned; 