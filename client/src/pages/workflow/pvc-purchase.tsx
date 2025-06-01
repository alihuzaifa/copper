// --- Local interfaces ---
interface Supplier {
  id: number;
  name: string;
}
interface PvcPurchase {
  id: number;
  supplierId: number;
  pvcColor: string;
  quantity: number;
  pricePerUnit: number;
  history: PvcPurchaseHistory[];
}
interface PvcPurchaseHistory {
  date: string;
  quantity: number;
  pricePerUnit: number;
  action: 'add' | 'delete' | 'remove';
}

import { useState } from "react";
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
import { Plus, Eye, Trash2 } from "lucide-react";

const dummySuppliers: Supplier[] = [
  { id: 1, name: "Supplier A" },
  { id: 2, name: "Supplier B" },
  { id: 3, name: "Supplier C" },
];

const pvcPurchaseFormSchema = z.object({
  supplierId: z.coerce.number().min(1, "Please select a supplier"),
  pvcColor: z.string().min(1, "Please enter a PVC name"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
});

type PvcPurchaseFormValues = z.infer<typeof pvcPurchaseFormSchema>;

const PvcPurchasePage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pvcPurchases, setPvcPurchases] = useState<PvcPurchase[]>([]);
  const [suppliers] = useState<Supplier[]>(dummySuppliers);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; purchase: PvcPurchase | null }>({ open: false, purchase: null });

  // Remove from Stock dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removePvcColor, setRemovePvcColor] = useState("");
  const [removeSupplierId, setRemoveSupplierId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // Create PVC purchase form
  const createForm = useForm<PvcPurchaseFormValues>({
    resolver: zodResolver(pvcPurchaseFormSchema),
    defaultValues: {
      supplierId: undefined,
      pvcColor: "",
      quantity: undefined,
      pricePerUnit: undefined,
    },
  });

  // Add or update PVC purchase
  const onCreateSubmit = (data: PvcPurchaseFormValues) => {
    setPvcPurchases((prev) => {
      const existingIdx = prev.findIndex(
        (p) =>
          p.pvcColor.trim().toLowerCase() === data.pvcColor.trim().toLowerCase() &&
          p.supplierId === data.supplierId
      );
      const now = new Date().toISOString();
      if (existingIdx !== -1) {
        // Update existing
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + data.quantity,
          pricePerUnit: data.pricePerUnit, // update to latest price
          history: [
            ...updated[existingIdx].history,
            {
              date: now,
              quantity: data.quantity,
              pricePerUnit: data.pricePerUnit,
              action: 'add' as const,
            },
          ],
        };
        return updated;
      } else {
        // New record
        return [
          {
            id: Date.now(),
            supplierId: data.supplierId,
            pvcColor: data.pvcColor,
            quantity: data.quantity,
            pricePerUnit: data.pricePerUnit,
            history: [
              {
                date: now,
                quantity: data.quantity,
                pricePerUnit: data.pricePerUnit,
                action: 'add' as const,
              },
            ],
          },
          ...prev,
        ];
      }
    });
    setIsAddDialogOpen(false);
    createForm.reset();
  };

  // Delete PVC purchase
  const handleDelete = (id: number) => {
    setPvcPurchases((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const now = new Date().toISOString();
      const updated = [...prev];
      // Add delete action to history before removal
      updated[idx] = {
        ...updated[idx],
        history: [
          ...updated[idx].history,
          {
            date: now,
            quantity: updated[idx].quantity,
            pricePerUnit: updated[idx].pricePerUnit,
            action: 'delete' as const,
          },
        ],
      };
      // Optionally, you could keep a global history here if needed
      // Remove the record
      updated.splice(idx, 1);
      return updated;
    });
  };

  // Remove from PVC Stock logic
  const handleRemoveFromStock = () => {
    setRemoveError("");
    const supplierId = parseInt(removeSupplierId);
    const pvcColor = removePvcColor.trim();
    const quantityToRemove = parseFloat(removeQuantity);
    if (!pvcColor || !supplierId || !quantityToRemove || quantityToRemove <= 0) {
      setRemoveError("Please select a PVC, supplier, and enter a valid quantity.");
      return;
    }
    const idx = pvcPurchases.findIndex(
      (p) =>
        p.pvcColor.toLowerCase() === pvcColor.toLowerCase() &&
        p.supplierId === supplierId
    );
    if (idx === -1) {
      setRemoveError("PVC and supplier not found.");
      return;
    }
    const purchase = pvcPurchases[idx];
    if (quantityToRemove > purchase.quantity) {
      setRemoveError("Cannot remove more than available stock for this supplier.");
      return;
    }
    // Add remove action to history before removal
    const updatedPurchase = {
      ...purchase,
      quantity: purchase.quantity - quantityToRemove,
      history: [
        ...purchase.history,
        {
          date: new Date().toISOString(),
          quantity: quantityToRemove,
          pricePerUnit: purchase.pricePerUnit,
          action: 'remove' as const,
        },
      ],
    };
    let updatedPurchases = [...pvcPurchases];
    // Always remove the record from the table, regardless of remaining quantity
    updatedPurchases.splice(idx, 1);
    setPvcPurchases(updatedPurchases);
    setRemoveDialogOpen(false);
    setRemovePvcColor("");
    setRemoveSupplierId("");
    setRemoveQuantity("");
    setRemoveError("");
  };

  // Table columns
  const columns = [
    {
      header: "PVC Name",
      accessorKey: "pvcColor" as keyof PvcPurchase,
    },
    {
      header: "Supplier",
      accessorKey: (row: PvcPurchase) => suppliers.find((s) => s.id === row.supplierId)?.name || "N/A",
    },
    {
      header: "Quantity",
      accessorKey: (row: PvcPurchase) => row.quantity,
    },
    {
      header: "Price/Unit (₹)",
      accessorKey: (row: PvcPurchase) => `₹${row.pricePerUnit}`,
    },
    {
      header: "History",
      accessorKey: (row: PvcPurchase) => row.id,
      cell: (row: PvcPurchase) => (
        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setHistoryModal({ open: true, purchase: row })}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
    {
      header: "Delete",
      accessorKey: (row: PvcPurchase) => row.id,
      cell: (row: PvcPurchase) => (
        <Button variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDelete(row.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
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
                <label className="block mb-1 font-medium">PVC Name</label>
                <Select
                  value={removePvcColor}
                  onValueChange={(v) => {
                    setRemovePvcColor(v);
                    setRemoveSupplierId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select PVC" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(new Set(pvcPurchases.map((p) => p.pvcColor))).map((name) => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Supplier</label>
                <Select
                  value={removeSupplierId}
                  onValueChange={setRemoveSupplierId}
                  disabled={!removePvcColor}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {pvcPurchases
                      .filter((p) => p.pvcColor === removePvcColor)
                      .map((p) => (
                        <SelectItem key={p.supplierId} value={p.supplierId.toString()}>
                          {suppliers.find((s) => s.id === p.supplierId)?.name || "N/A"} (Stock: {p.quantity})
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
                />
              </div>
              {removeError && <div className="text-red-600 text-xs">{removeError}</div>}
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRemoveFromStock}>Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-sans">PVC Purchases</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
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
                            <Input placeholder="Enter PVC name (e.g. Red, Black)" {...field} />
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
                            <Input type="number" step="0.01" placeholder="Enter quantity" {...field} />
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
                            <Input type="number" step="0.01" placeholder="Enter price per unit" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="button" variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={pvcPurchases} />
          </CardContent>
        </Card>

        {/* History Modal */}
        <Dialog open={historyModal.open} onOpenChange={(open) => setHistoryModal({ open, purchase: open ? historyModal.purchase : null })}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>PVC Purchase History</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModal.purchase?.history.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500 dark:text-gray-400">No history yet.</td>
                    </tr>
                  )}
                  {historyModal.purchase?.history.map((h, idx) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">
                        <span className={h.action === "add" ? "text-green-600" : h.action === "remove" ? "text-blue-600" : "text-red-600"}>
                          {h.action === "add" ? "Add" : h.action === "remove" ? "Remove" : "Delete"}
                        </span>
                      </td>
                      <td className="px-4 py-2">{h.quantity}</td>
                      <td className="px-4 py-2">₹{h.pricePerUnit}</td>
                      <td className="px-4 py-2">{format(new Date(h.date), "yyyy-MM-dd HH:mm:ss")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PvcPurchasePage;