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

interface KachaProduct {
  id: string;
  name: string;
  quantity: number;
}

interface DrawerUser {
  _id: string;
  name: string;
}

interface DrawInventoryItem {
  _id: string;
  originalDrawProcessingId: string;
  newName: string;
  quantity: number;
  returnDate: string;
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

interface GetKachaProductsResponse {
  success: boolean;
  data: KachaProduct[];
}

interface GetDrawerUsersResponse {
  success: boolean;
  data: DrawerUser[];
}

interface AssignmentProduct {
  drawerUserId: number;
  productId: {
    _id: string;
    materialName: string;
  };
  givenQuantity: number;
  productName: string;
}

interface DrawReturnedProps {
  onDataChange?: () => void;
}

const getKachaProductName = (kachaProduct: any) => kachaProduct?.name || kachaProduct?.materialName || '';
const getKachaProductId = (kachaProduct: any) => kachaProduct?.id || kachaProduct?._id || '';

const DrawReturned = ({ onDataChange }: DrawReturnedProps) => {
  const { toast } = useToast();
  const [returnedInventory, setReturnedInventory] = useState<DrawInventoryItem[]>([]);
  const [kachaProducts, setKachaProducts] = useState<KachaProduct[]>([]);
  const [drawerUsers, setDrawerUsers] = useState<DrawerUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Return Draw modal state
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);

  // react-hook-form for Return Draw
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [availableQuantity, setAvailableQuantity] = useState(0);

  const [assignedProducts, setAssignedProducts] = useState<AssignmentProduct[]>([]);

  // Delete Returned Draw modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteInventoryId, setDeleteInventoryId] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteQuantity, setDeleteQuantity] = useState("");
  const selectedDeleteItem = returnedInventory.find((item) => item._id === deleteInventoryId);

  // react-hook-form for Return Draw
  const returnSchema = z.object({
    drawerUserId: z.string().min(1, "Select a Drawer User"),
    kachaProductId: z.string().min(1, "Select an Item"),
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
    drawerUserId: string;
    kachaProductId: string;
    quantity: number | string;
    newName: string;
  }>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      drawerUserId: "",
      kachaProductId: "",
      quantity: "",
      newName: "",
    },
    mode: "onTouched",
  });

  // Sync selectedUserId and selectedProductId with form values
  const watchedUserId = useWatch({ control, name: "drawerUserId" });
  const watchedProductId = useWatch({ control, name: "kachaProductId" });
  useEffect(() => {
    setSelectedUserId(watchedUserId || "");
  }, [watchedUserId]);
  useEffect(() => {
    setSelectedProductId(watchedProductId || "");
  }, [watchedProductId]);

  // Fetch assignments when drawer user changes
  useEffect(() => {
    if (selectedUserId) {
      (async () => {
        try {
          const response = await request<void, { success: boolean; data: AssignmentProduct[] }>({
            url: `/draw-processing/assignments?drawerUserId=${selectedUserId}`,
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
    setValue("kachaProductId", "");
  }, [selectedUserId, setValue]);

  const selectedProduct = assignedProducts.find((item) => item.productId._id === selectedProductId);
  useEffect(() => {
    setAvailableQuantity(selectedProduct?.givenQuantity ?? 0);
  }, [selectedProduct]);

  // Fetch returned draw inventory
  const fetchReturnedInventory = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch kacha products
  const fetchKachaProducts = async () => {
    try {
      const response = await request<void, GetKachaProductsResponse>({
        url: '/draw-processing/products',
        method: 'GET',
      });
      if (response.success) {
        setKachaProducts(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch kacha products",
        variant: "destructive",
      });
    }
  };

  // Fetch drawer users
  const fetchDrawerUsers = async () => {
    try {
      const response = await request<void, GetDrawerUsersResponse>({
        url: '/draw-processing/drawer-users',
        method: 'GET',
      });
      if (response.success) {
        setDrawerUsers(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch drawer users",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReturnedInventory();
    fetchKachaProducts();
    fetchDrawerUsers();
  }, []);

  // Handle return draw
  const handleReturnDraw = async (data: {
    drawerUserId: string;
    kachaProductId: string;
    quantity: number | string;
    newName: string;
  }) => {
    try {
      setReturnLoading(true);
      const product = assignedProducts.find((item) => item.productId._id === data.kachaProductId);
      const response = await request<any, { success: boolean; message: string }>({
        url: '/draw-processing/return',
        method: 'POST',
        data: {
          drawerUserId: data.drawerUserId,
          kachaProductId: product?.productId._id,
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
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        toast({ title: "Error", description: response.message || "Failed to return draw.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to return draw.", variant: "destructive" });
    } finally {
      setReturnLoading(false);
    }
  };

  // Handle delete returned draw (API call, partial quantity allowed)
  const handleDeleteReturnedDraw = async () => {
    setDeleteError("");
    if (!deleteInventoryId || !deleteQuantity) {
      setDeleteError("Please select a returned draw item and enter quantity.");
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
        url: `/draw-processing/inventory/${deleteInventoryId}`,
        method: 'DELETE',
        data: { quantity: qty },
      });
      if (response.success) {
        setDeleteModalOpen(false);
        setDeleteInventoryId("");
        setDeleteQuantity("");
        fetchReturnedInventory();
        toast({ title: "Success", description: response.message });
        
        // Trigger refresh in other components
        onDataChange?.();
      } else {
        setDeleteError(response.message || "Failed to delete returned draw.");
      }
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete returned draw.");
    } finally {
      setDeleteLoading(false);
    }
  };

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
              <Button onClick={() => setReturnModalOpen(true)}>
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
                            <SelectValue placeholder="Select drawer user" />
                          </SelectTrigger>
                          <SelectContent>
                            {drawerUsers.map((u) => (
                              <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <div className="text-red-600 text-xs mt-1">{errors.drawerUserId?.message as string}</div>
                        )}
                      </>
                    )}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Item</label>
                  <Controller
                    name="kachaProductId"
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
                          <div className="text-red-600 text-xs mt-1">{errors.kachaProductId?.message as string}</div>
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
                Delete Returned Draw
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Returned Draw</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Returned Draw Item</label>
                  <Select value={deleteInventoryId} onValueChange={setDeleteInventoryId} disabled={deleteLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select returned draw item" />
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
                  <Button onClick={handleDeleteReturnedDraw} disabled={deleteLoading}>
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
                          (Originally: {typeof inv.originalDrawProcessingId === 'object' ? getKachaProductName(inv.originalDrawProcessingId) :
                            kachaProducts.find((i) => getKachaProductId(i) === (typeof inv.originalDrawProcessingId === 'string' ? inv.originalDrawProcessingId : getKachaProductId(inv.originalDrawProcessingId)))?.name || "N/A"})
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

export default DrawReturned; 