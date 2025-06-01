import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Eye,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";

const initialSuppliers = [
  { id: 1, name: "ABC Traders" },
  { id: 2, name: "XYZ Suppliers" },
  { id: 3, name: "Global Materials" },
];

const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  materialName: z.string().min(1, "Material Name is required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
});

function PurchaseForm({ purchase, suppliers, onSubmit, onCancel }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(purchaseSchema),
    defaultValues: {
      supplierId: purchase?.supplierId ? purchase.supplierId.toString() : "",
      materialName: purchase?.materialName || "",
      weight: purchase?.weight || "",
      pricePerUnit: purchase?.pricePerUnit || "",
    },
    mode: "onTouched",
  });

  const weight = watch("weight");
  const pricePerUnit = watch("pricePerUnit");
  const totalAmount =
    weight && pricePerUnit ? Number(weight) * Number(pricePerUnit) : 0;

  const inputStyles = {
    base: "border px-3 py-2 rounded-md outline-none transition-colors w-full",
    valid: "border-green-500",
    invalid: "border-red-500",
    default: "border-gray-300 dark:border-gray-700",
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          id: purchase?.id,
          supplierId: parseInt(data.supplierId),
          materialName: data.materialName,
          weight: Number(data.weight),
          pricePerUnit: Number(data.pricePerUnit),
          totalAmount: Number(data.weight) * Number(data.pricePerUnit),
          status: "pending",
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1 font-medium">Supplier</label>
        <Controller
          name="supplierId"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  field.onBlur();
                }}
              >
                <SelectTrigger
                  className={
                    inputStyles.base +
                    " " +
                    (fieldState.invalid
                      ? inputStyles.invalid
                      : fieldState.isTouched && field.value
                      ? inputStyles.valid
                      : inputStyles.default) +
                    " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
                  }
                >
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem
                      key={supplier.id}
                      value={supplier.id.toString()}
                    >
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.supplierId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Material Name</label>
        <input
          {...register("materialName")}
          placeholder="Enter material name"
          className={
            inputStyles.base +
            " " +
            (touchedFields.materialName
              ? errors.materialName
                ? inputStyles.invalid
                : inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {touchedFields.materialName && errors.materialName && (
          <div className="text-red-600 text-xs mt-1">
            {errors.materialName.message as string}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Weight</label>
        <input
          {...register("weight")}
          placeholder="Enter weight"
          type="number"
          className={
            inputStyles.base +
            " " +
            (touchedFields.weight
              ? errors.weight
                ? inputStyles.invalid
                : inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {touchedFields.weight && errors.weight && (
          <div className="text-red-600 text-xs mt-1">
            {errors.weight.message as string}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Price per Unit</label>
        <input
          {...register("pricePerUnit")}
          placeholder="Enter price per unit"
          type="number"
          className={
            inputStyles.base +
            " " +
            (touchedFields.pricePerUnit
              ? errors.pricePerUnit
                ? inputStyles.invalid
                : inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {touchedFields.pricePerUnit && errors.pricePerUnit && (
          <div className="text-red-600 text-xs mt-1">
            {errors.pricePerUnit.message as string}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Total Amount</label>
        <input
          value={totalAmount}
          readOnly
          className={
            inputStyles.base +
            " " +
            inputStyles.default +
            " bg-gray-100 dark:bg-gray-800"
          }
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {purchase ? "Update Purchase" : "Add Purchase"}
        </Button>
      </div>
    </form>
  );
}

const PurchaseManagement = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers] = useState(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editPurchase, setEditPurchase] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  // Remove from stock dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeMaterialName, setRemoveMaterialName] = useState("");
  const [removeSupplierId, setRemoveSupplierId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // History state (array of {materialName, supplierId, action, ...})
  const [history, setHistory] = useState<any[]>([]);
  // For per-row history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalMaterial, setHistoryModalMaterial] = useState("");
  const [historyModalSupplierId, setHistoryModalSupplierId] = useState("");

  // Add or update purchase
  const handleAdd = (data: any) => {
    const supplierId = parseInt(data.supplierId);
    const materialName = data.materialName.trim();
    const pricePerUnit = Number(data.pricePerUnit);
    const weight = Number(data.weight);
    // Find if exists
    const idx = purchases.findIndex(
      (p) =>
        p.materialName.toLowerCase() === materialName.toLowerCase() &&
        p.supplierId === supplierId
    );
    let newPurchases;
    let actionQuantity = weight;
    if (idx !== -1) {
      // Update existing
      const updated = { ...purchases[idx] };
      updated.weight += weight;
      updated.pricePerUnit = pricePerUnit; // or keep old price if you want
      updated.totalAmount = updated.weight * updated.pricePerUnit;
      newPurchases = [...purchases];
      newPurchases[idx] = updated;
    } else {
      // Add new
      const newPurchase = {
        id: Date.now(),
        supplierId,
        materialName,
        weight,
        pricePerUnit,
        totalAmount: weight * pricePerUnit,
        status: "pending",
        date: new Date(),
      };
      newPurchases = [...purchases, newPurchase];
    }
    setPurchases(newPurchases);
    setHistory((prev) => [
      ...prev,
      {
        materialName,
        supplierId,
        action: "add",
        actionDate: new Date(),
        actionQuantity,
        pricePerUnit,
      },
    ]);
    setModalOpen(false);
  };

  // Remove from stock logic
  const handleRemoveFromStock = () => {
    setRemoveError("");
    const supplierId = parseInt(removeSupplierId);
    const materialName = removeMaterialName.trim();
    const quantityToRemove = parseFloat(removeQuantity);
    if (
      !materialName ||
      !supplierId ||
      !quantityToRemove ||
      quantityToRemove <= 0
    ) {
      setRemoveError(
        "Please select a material, supplier, and enter a valid quantity."
      );
      return;
    }
    const idx = purchases.findIndex(
      (p) =>
        p.materialName.toLowerCase() === materialName.toLowerCase() &&
        p.supplierId === supplierId
    );
    if (idx === -1) {
      setRemoveError("Material and supplier not found.");
      return;
    }
    const purchase = purchases[idx];
    if (quantityToRemove > purchase.weight) {
      setRemoveError(
        "Cannot remove more than available stock for this supplier."
      );
      return;
    }
    // Subtract quantity
    const updatedPurchase = {
      ...purchase,
      weight: purchase.weight - quantityToRemove,
      totalAmount: (purchase.weight - quantityToRemove) * purchase.pricePerUnit,
    };
    const updatedPurchases = [...purchases];
    updatedPurchases[idx] = updatedPurchase;
    setPurchases(updatedPurchases);
    // Add to history
    setHistory((prev) => [
      ...prev,
      {
        materialName,
        supplierId,
        action: "remove",
        actionDate: new Date(),
        actionQuantity: quantityToRemove,
        pricePerUnit: purchase.pricePerUnit,
      },
    ]);
    setRemoveDialogOpen(false);
    setRemoveMaterialName("");
    setRemoveSupplierId("");
    setRemoveQuantity("");
    setRemoveError("");
  };

  // Per-row history modal logic
  const openHistoryModal = (materialName: string, supplierId: number) => {
    setHistoryModalMaterial(materialName);
    setHistoryModalSupplierId(supplierId.toString());
    setHistoryModalOpen(true);
  };

  const filteredPurchases = purchases.filter((purchase) => {
    const supplierName =
      suppliers.find((s) => s.id === purchase.supplierId)?.name || "";
    const matchesSearch =
      searchTerm === "" ||
      purchase.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
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
                          key={p.supplierId}
                          value={p.supplierId.toString()}
                        >
                          {suppliers.find((s) => s.id === p.supplierId)?.name ||
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
                  purchase={null}
                  suppliers={suppliers}
                  onSubmit={handleAdd}
                  onCancel={() => {
                    setModalOpen(false);
                    setEditPurchase(null);
                  }}
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
                      key={purchase.materialName + "-" + purchase.supplierId}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">
                        {suppliers.find((s) => s.id === purchase.supplierId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">{purchase.materialName}</td>
                      <td className="px-4 py-2">{purchase.weight}</td>
                      <td className="px-4 py-2">{purchase.pricePerUnit}</td>
                      <td className="px-4 py-2">{purchase.totalAmount}</td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openHistoryModal(
                              purchase.materialName,
                              purchase.supplierId
                            )
                          }
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
        {/* Per-row History Modal */}
        <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>History</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Price/Unit
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Date/Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.filter(
                    (h) =>
                      h.materialName === historyModalMaterial &&
                      h.supplierId.toString() === historyModalSupplierId
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No history yet.
                      </td>
                    </tr>
                  )}
                  {history
                    .filter(
                      (h) =>
                        h.materialName === historyModalMaterial &&
                        h.supplierId.toString() === historyModalSupplierId
                    )
                    .map((h, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-4 py-2">
                          <span
                            className={
                              h.action === "add"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {h.action === "add" ? "Add" : "Remove"}
                          </span>
                        </td>
                        <td className="px-4 py-2">{h.actionQuantity}</td>
                        <td className="px-4 py-2">{h.pricePerUnit}</td>
                        <td className="px-4 py-2">
                          {dayjs(h.actionDate).format("YYYY-MM-DD HH:mm:ss")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
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
