import { useState, useEffect } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import { DataTable } from "@/components/ui/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Trash2, Loader2 } from "lucide-react";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

// API Types
interface Supplier {
  _id: string;
  name: string;
  phoneNumber?: string;
}

interface PVCPurchase {
  _id: string;
  supplierId: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  pvcColor: string;
  quantity: number;
  pricePerUnit: number;
  status: string;
  history: PVCPurchaseHistory[];
  createdAt: string;
  updatedAt: string;
}

interface PVCPurchaseHistory {
  _id: string;
  action: string;
  quantity: number;
  pricePerUnit: number;
  date: string;
  actionBy: string;
  notes?: string;
  supplierId?: string; // <-- Add this line to match backend and remove TS error
}

// API Response Types
interface GetSuppliersResponse {
  success: boolean;
  data: Supplier[];
}

interface GetPVCPurchasesResponse {
  success: boolean;
  data: PVCPurchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface CreatePVCPurchaseResponse {
  success: boolean;
  message: string;
  data: PVCPurchase;
}

interface DeletePVCPurchaseResponse {
  success: boolean;
  message: string;
}

const pvcPurchaseFormSchema = z.object({
  supplierId: z.string().min(1, "Please select a supplier"),
  pvcColor: z.string().min(1, "Please enter a PVC name"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
});

type PvcPurchaseFormValues = z.infer<typeof pvcPurchaseFormSchema>;

const PvcPurchasePage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pvcPurchases, setPvcPurchases] = useState<PVCPurchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; purchase: PVCPurchase | null }>({ open: false, purchase: null });

  // Remove from Stock dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removePurchaseId, setRemovePurchaseId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);

  // Create PVC purchase form
  const createForm = useForm<PvcPurchaseFormValues>({
    resolver: zodResolver(pvcPurchaseFormSchema),
    defaultValues: {
      supplierId: "",
      pvcColor: "",
      quantity: undefined,
      pricePerUnit: undefined,
    },
  });

  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await request<void, GetSuppliersResponse>({
        url: '/pvc-purchases/suppliers/list',
        method: 'GET'
      });

      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch suppliers",
        variant: "destructive",
      });
    }
  };

  // Fetch PVC purchases
  const fetchPVCPurchases = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetPVCPurchasesResponse>({
        url: '/pvc-purchases',
        method: 'GET'
      });

      if (response.success) {
        setPvcPurchases(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching PVC purchases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch PVC purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create PVC purchase
  const onCreateSubmit = async (data: PvcPurchaseFormValues) => {
    try {
      setFormLoading(true);
      const response = await request<any, CreatePVCPurchaseResponse>({
        url: '/pvc-purchases',
        method: 'POST',
        data: {
          supplierId: data.supplierId,
          pvcColor: data.pvcColor.trim(),
          quantity: Number(data.quantity),
          pricePerUnit: Number(data.pricePerUnit),
        }
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        setIsAddDialogOpen(false);
        createForm.reset();
        fetchPVCPurchases();
      }
    } catch (error: any) {
      console.error('Error creating PVC purchase:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create PVC purchase",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete PVC purchase
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const response = await request<any, DeletePVCPurchaseResponse>({
        url: `/pvc-purchases/${id}`,
        method: 'DELETE'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        fetchPVCPurchases();
      }
    } catch (error: any) {
      console.error('Error deleting PVC purchase:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete PVC purchase",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Remove from PVC Stock logic
  const handleRemoveFromStock = async () => {
    setRemoveError("");
    const purchaseId = removePurchaseId;
    const quantityToRemove = parseFloat(removeQuantity);
    if (!purchaseId || !quantityToRemove || quantityToRemove <= 0) {
      setRemoveError("Please select a purchase and enter a valid quantity.");
      return;
    }
    const purchase = pvcPurchases.find((p) => p._id === purchaseId);
    if (!purchase) {
      setRemoveError("Purchase not found.");
      return;
    }
    if (quantityToRemove > purchase.quantity) {
      setRemoveError("Cannot remove more than available stock for this purchase.");
      return;
    }
    try {
      setRemoveLoading(true);
      const response = await request<any, { success: boolean; message: string }>({
        url: `/pvc-purchases/${purchase._id}`,
        method: 'PUT',
        data: {
          quantity: purchase.quantity - quantityToRemove,
          notes: `Removed ${quantityToRemove} kg from stock`
        }
      });
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        setRemoveDialogOpen(false);
        setRemovePurchaseId("");
        setRemoveQuantity("");
        setRemoveError("");
        fetchPVCPurchases();
      }
    } catch (error: any) {
      setRemoveError(error.message || "Failed to remove from stock.");
    } finally {
      setRemoveLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchPVCPurchases();
  }, []);

  // Table columns
  const columns = [
    {
      header: "PVC Name",
      accessorKey: "pvcColor" as keyof PVCPurchase,
    },
    {
      header: "Supplier",
      accessorKey: (row: PVCPurchase) => row.supplierId.name,
    },
    {
      header: "Quantity",
      accessorKey: (row: PVCPurchase) => row.quantity,
    },
    {
      header: "History",
      accessorKey: (row: PVCPurchase) => row._id,
      cell: (row: PVCPurchase) => (
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setHistoryModal({ open: true, purchase: row })}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{softwareName} | PVC Purchase</title>
        <meta name="description" content="Manage PVC purchases for your copper wire manufacturing workflow." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Workflow Stages */}
          <WorkflowStages currentStage={5} />

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold font-sans">PVC Purchase</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage PVC material purchases for wire insulation
              </p>
            </div>
            <Button variant="destructive" onClick={() => setRemoveDialogOpen(true)}>
              Remove from PVC Stock
            </Button>
          </div>

          {/* Remove from PVC Stock Dialog */}
          <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Remove from PVC Stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">PVC Purchase</label>
                  <Select
                    value={removePurchaseId}
                    onValueChange={setRemovePurchaseId}
                    disabled={removeLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select PVC purchase" />
                    </SelectTrigger>
                    <SelectContent>
                      {pvcPurchases.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.pvcColor} (Supplier: {p.supplierId.name}, Stock: {p.quantity})
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
                    onChange={(e) => setRemoveQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    disabled={removeLoading}
                  />
                </div>
                {removeError && <div className="text-red-600 text-xs">{removeError}</div>}
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" onClick={() => setRemoveDialogOpen(false)} disabled={removeLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleRemoveFromStock} disabled={removeLoading}>
                    {removeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Remove
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-sans">PVC Purchases</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    <Plus className="mr-2 h-4 w-4" />
                    Add PVC Purchase
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New PVC Purchase</DialogTitle>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="supplierId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={formLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a supplier" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {suppliers.length > 0 ? (
                                  suppliers.map((supplier) => (
                                    <SelectItem key={supplier._id} value={supplier._id}>
                                      {supplier.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="empty" disabled>
                                    No suppliers available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="pvcColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PVC Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PVC name (e.g. Red, Black)" {...field} disabled={formLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="Enter quantity" {...field} disabled={formLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="pricePerUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Per Unit (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="Enter price per unit" {...field} disabled={formLoading} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end">
                        <Button type="button" variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)} disabled={formLoading}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={formLoading}>
                          {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Save
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading PVC purchases...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={pvcPurchases} />
              )}
            </CardContent>
          </Card>

          {/* History Modal */}
          <Dialog open={historyModal.open} onOpenChange={(open) => setHistoryModal({ open, purchase: open ? historyModal.purchase : null })}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>PVC Purchase History</DialogTitle>
              </DialogHeader>
              {(() => {
                const purchase = historyModal.purchase;
                let content;
                if (purchase && purchase.history.length > 0) {
                  content = (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {purchase.history.map((h, idx) => {
                        let supplierName = purchase.supplierId?.name || "Unknown";
                        if (h.supplierId) {
                          if (typeof h.supplierId === 'string' && purchase.supplierId && h.supplierId === purchase.supplierId._id) {
                            supplierName = purchase.supplierId.name;
                          }
                        }
                        return (
                          <div
                            key={h._id || idx}
                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={h.action === "add" ? "text-green-600 font-medium capitalize" : h.action === "remove" ? "text-blue-600 font-medium capitalize" : "text-red-600 font-medium capitalize"}>
                                {h.action.charAt(0).toUpperCase() + h.action.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {format(new Date(h.date), "yyyy-MM-dd HH:mm:ss")}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p>Quantity: {h.quantity}</p>
                              {h.notes && (
                                <p className="text-gray-600 dark:text-gray-400">
                                  {h.notes}
                                </p>
                              )}
                              <p className="text-gray-600 dark:text-gray-400">Supplier: {supplierName}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  content = (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No history yet.
                    </div>
                  );
                }
                return content;
              })()}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </>
  );
};

export default PvcPurchasePage;