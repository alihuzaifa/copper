import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Eye,
  Loader2,
} from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import WorkflowStages from "@/components/layout/workflow-stages";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/api-client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// API Types
interface Supplier {
  _id: string;
  name: string;
  phoneNumber?: string;
}

interface HistoryEntry {
  action: 'created' | 'added' | 'updated';
  quantity: number;
  date: string;
  by: string;
  notes: string;
}

interface Purchase {
  _id: string;
  supplierId: {
    _id: string;
    name: string;
    phoneNumber?: string;
  };
  materialName: string;
  weight: number;
  pricePerUnit: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  purchaseDate?: string;
  deliveryDate?: string;
  shopId: string;
  createdBy: {
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
  deletedAt?: string;
  history: HistoryEntry[];
}

interface GetPurchasesResponse {
  success: boolean;
  message?: string;
  data: Purchase[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface GetSuppliersDropdownResponse {
  success: boolean;
  data: Supplier[];
}

interface CreatePurchaseResponse {
  success: boolean;
  message: string;
  data: Purchase;
}

interface UpdatePurchaseResponse {
  success: boolean;
  message: string;
  data: Purchase;
}

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  materialName: z.string().min(1, "Material name is required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
});

type PurchaseFormValues = z.infer<typeof purchaseSchema>;

interface PurchaseFormProps {
  purchase?: Purchase;
  suppliers: Supplier[];
  onSubmit: (data: PurchaseFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchase,
  suppliers,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const methods = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: purchase?.supplierId._id || "",
      materialName: purchase?.materialName || "",
      weight: purchase?.weight || 0,
      pricePerUnit: purchase?.pricePerUnit || 0,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={methods.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem
                      key={supplier._id}
                      value={supplier._id}
                    >
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="materialName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Name</FormLabel>
              <FormControl>
                <input
                  {...field}
                  placeholder="Enter material name"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="number"
                  placeholder="Enter weight"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={methods.control}
          name="pricePerUnit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price per Unit</FormLabel>
              <FormControl>
                <input
                  {...field}
                  type="number"
                  placeholder="Enter price per unit"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Amount: {methods.watch("weight") * methods.watch("pricePerUnit")}
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState<Purchase | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Remove from stock dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeMaterialName, setRemoveMaterialName] = useState("");
  const [removeSupplierId, setRemoveSupplierId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // History state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Function to fetch purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      
      // Fetch purchases
      const purchasesResponse = await request<void, GetPurchasesResponse>({
        url: '/purchases',
        method: 'GET',
        params: { page, search: searchTerm }
      });

      if (purchasesResponse.success) {
        setPurchases(purchasesResponse.data);
        setTotalPages(purchasesResponse.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch purchases and suppliers
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch purchases
        await fetchPurchases();

        // Fetch suppliers
        const suppliersResponse = await request<void, GetSuppliersDropdownResponse>({
          url: '/users/suppliers/all',
          method: 'GET'
        });

        if (suppliersResponse.success) {
          setSuppliers(suppliersResponse.data);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, searchTerm]);

  // Add or update purchase
  const handleAdd = async (data: PurchaseFormValues) => {
    try {
      setFormLoading(true);
      
      const response = await request<any, CreatePurchaseResponse>({
        url: '/purchases',
        method: 'POST',
        data: {
          supplierId: data.supplierId,
          materialName: data.materialName.trim(),
          weight: Number(data.weight),
          pricePerUnit: Number(data.pricePerUnit),
          totalAmount: Number(data.weight) * Number(data.pricePerUnit),
          status: 'pending'
        }
      });

      if (response.success) {
        // Refresh purchases list
        await fetchPurchases();
        
        setModalOpen(false);
        setEditPurchase(null);
        toast({
          title: "Success",
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error('Error creating purchase:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create purchase",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Remove from stock logic
  const handleRemoveFromStock = async () => {
    try {
      setFormLoading(true);
      setRemoveError("");
      
      const supplierId = removeSupplierId;
      const materialName = removeMaterialName.trim();
      const quantityToRemove = parseFloat(removeQuantity);

      if (!materialName || !supplierId || !quantityToRemove || quantityToRemove <= 0) {
        setRemoveError("Please select a material, supplier, and enter a valid quantity.");
        return;
      }

      const purchase = purchases.find(
        (p) => p.materialName.toLowerCase() === materialName.toLowerCase() && 
              p.supplierId._id === supplierId
      );

      if (!purchase) {
        setRemoveError("Material and supplier not found.");
        return;
      }

      if (quantityToRemove > purchase.weight) {
        setRemoveError("Cannot remove more than available stock for this supplier.");
        return;
      }

      const response = await request<any, UpdatePurchaseResponse>({
        url: `/purchases/${purchase._id}`,
        method: 'PUT',
        data: {
          weight: purchase.weight - quantityToRemove,
          totalAmount: (purchase.weight - quantityToRemove) * purchase.pricePerUnit
        }
      });

      if (response.success) {
        setPurchases((prev) =>
          prev.map((p) => (p._id === purchase._id ? response.data : p))
        );
        setRemoveDialogOpen(false);
        setRemoveMaterialName("");
        setRemoveSupplierId("");
        setRemoveQuantity("");
        setRemoveError("");
        toast({
          title: "Success",
          description: response.message,
        });
      }
    } catch (error: any) {
      console.error('Error removing from stock:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove from stock",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Function to open history modal
  const openHistoryModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setHistoryModalOpen(true);
  };

  // Function to close history modal
  const closeHistoryModal = () => {
    setSelectedPurchase(null);
    setHistoryModalOpen(false);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const supplierName =
      suppliers.find((s) => s._id === purchase.supplierId._id)?.name || "";
    const matchesSearch =
      searchTerm === "" ||
      purchase.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Workflow Stages */}
        <WorkflowStages currentStage={1} />
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-sans">
              Purchase Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Add, update, and manage your purchases
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setRemoveDialogOpen(true)}
          >
            Remove from Stock
          </Button>
        </div>
        {/* Remove from Stock Dialog */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Remove from Stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Material</label>
                <Select
                  value={removeMaterialName}
                  onValueChange={(v) => {
                    setRemoveMaterialName(v);
                    setRemoveSupplierId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(purchases.map((p) => p.materialName))
                    ).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Supplier</label>
                <Select
                  value={removeSupplierId}
                  onValueChange={setRemoveSupplierId}
                  disabled={!removeMaterialName}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchases
                      .filter((p) => p.materialName === removeMaterialName)
                      .map((p) => (
                        <SelectItem
                          key={p.supplierId._id}
                          value={p.supplierId._id}
                        >
                          {suppliers.find((s) => s._id === p.supplierId._id)?.name ||
                            "N/A"}{" "}
                          (Stock: {p.weight})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Quantity to Remove
                </label>
                <Input
                  type="number"
                  min="0"
                  value={removeQuantity}
                  onChange={(e) => setRemoveQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
              {removeError && (
                <div className="text-red-600 text-xs">{removeError}</div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setRemoveDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRemoveFromStock}>Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Purchases Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">Purchases</CardTitle>
            <Dialog
              open={modalOpen}
              onOpenChange={(open) => {
                setModalOpen(open);
                if (!open) setEditPurchase(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditPurchase(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Purchase</DialogTitle>
                </DialogHeader>
                <PurchaseForm
                  purchase={editPurchase || undefined}
                  suppliers={suppliers}
                  onSubmit={handleAdd}
                  onCancel={() => {
                    setModalOpen(false);
                    setEditPurchase(null);
                  }}
                  isLoading={formLoading}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {/* Search control */}
            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search purchases..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            {/* Purchases table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Supplier
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Material Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Weight
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Price/Unit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      History
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase._id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{purchase.supplierId.name}</td>
                      <td className="px-4 py-2">{purchase.materialName}</td>
                      <td className="px-4 py-2">{purchase.weight}</td>
                      <td className="px-4 py-2">{purchase.pricePerUnit}</td>
                      <td className="px-4 py-2">{purchase.totalAmount}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => openHistoryModal(purchase)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredPurchases.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No purchases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* History Modal */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Purchase History</DialogTitle>
              {selectedPurchase && (
                <DialogDescription>
                  <div className="mb-4">
                    <p className="font-medium">{selectedPurchase.materialName}</p>
                    <p className="text-sm text-gray-500">
                      Supplier: {selectedPurchase.supplierId.name}
                    </p>
                  </div>
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {selectedPurchase?.history.map((entry, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize text-primary">
                      {entry.action}
                    </span>
                    <span className="text-sm text-gray-500">
                      {dayjs(entry.date).format("MMM D, YYYY")}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p>Quantity: {entry.quantity} kg</p>
                    {entry.notes && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeHistoryModal}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Delete confirmation dialog (not used, but kept for completeness) */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the purchase for material "
                {selectedPurchase?.materialName}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {}}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseManagement;
