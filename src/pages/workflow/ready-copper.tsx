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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import WorkflowStages from "@/components/layout/workflow-stages";

// Dummy data
const dummyDrawerUsers = [
  { id: 1, name: "Drawer User 1" },
  { id: 2, name: "Drawer User 2" },
  { id: 3, name: "Drawer User 3" },
];
const dummyProducts = [
  { id: 1, name: "Copper Wire" },
  { id: 2, name: "Copper Rod" },
  { id: 3, name: "Copper Sheet" },
];
// Dummy assignments: which Drawer User got which Product and how much
const dummyAssignments = [
  { drawerUserId: 1, productId: 1, givenQuantity: 100 },
  { drawerUserId: 1, productId: 2, givenQuantity: 50 },
  { drawerUserId: 2, productId: 1, givenQuantity: 80 },
  { drawerUserId: 3, productId: 3, givenQuantity: 120 },
];

const readyCopperSchema = z.object({
  drawerUserId: z.string().min(1, "Select a Drawer User"),
  productId: z.string().min(1, "Select a Product"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
});

function ReadyCopperForm({
  onSubmit,
  onCancel,
  users,
  products,
  assignments,
  records,
}: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    control,
    watch,
  } = useForm({
    resolver: zodResolver(readyCopperSchema),
    defaultValues: {
      drawerUserId: "",
      productId: "",
      quantity: "",
    },
    mode: "onTouched",
  });

  const selectedDrawerUserId = watch("drawerUserId");
  const selectedProductId = watch("productId");
  const enteredQuantity = watch("quantity");

  // Find the assignment for this user+product
  const assignment = assignments.find(
    (a: any) =>
      a.drawerUserId.toString() === selectedDrawerUserId &&
      a.productId.toString() === selectedProductId
  );
  // Find how much has already been returned for this user+product
  const alreadyReturned =
    records.find(
      (r: any) =>
        r.drawerUserId.toString() === selectedDrawerUserId &&
        r.productId.toString() === selectedProductId
    )?.quantity || 0;
  const maxReturnable = assignment
    ? assignment.givenQuantity - alreadyReturned
    : 0;

  const inputStyles = {
    base: "border px-3 py-2 rounded-md outline-none transition-colors w-full",
    valid: "border-green-500",
    invalid: "border-red-500",
    default: "border-gray-300 dark:border-gray-700",
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        if (assignment && Number(data.quantity) > maxReturnable) {
          return;
        }
        onSubmit({
          drawerUserId: parseInt(data.drawerUserId),
          productId: parseInt(data.productId),
          quantity: Number(data.quantity),
        });
      })}
      className="space-y-4"
    >
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
                  <SelectValue placeholder="Select a Drawer User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.drawerUserId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Product</label>
        <Controller
          name="productId"
          control={control}
          render={({ field, fieldState }) => (
            <>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  field.onBlur();
                }}
                disabled={!selectedDrawerUserId}
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
                  <SelectValue placeholder="Select a Product" />
                </SelectTrigger>
                <SelectContent>
                  {assignments
                    .filter(
                      (a: any) =>
                        a.drawerUserId.toString() === selectedDrawerUserId
                    )
                    .map((a: any) => (
                      <SelectItem
                        key={a.productId}
                        value={a.productId.toString()}
                      >
                        {products.find((p: any) => p.id === a.productId)
                          ?.name || "N/A"}{" "}
                        (Given: {a.givenQuantity})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.productId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Return Quantity</label>
        <input
          {...register("quantity")}
          placeholder="Enter return quantity"
          type="number"
          min={0}
          max={maxReturnable}
          className={
            inputStyles.base +
            " " +
            (errors.quantity ||
            (assignment && Number(enteredQuantity) > maxReturnable)
              ? inputStyles.invalid
              : touchedFields.quantity
              ? inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {(errors.quantity ||
          (assignment && Number(enteredQuantity) > maxReturnable)) && (
          <div className="text-red-600 text-xs mt-1">
            {errors.quantity?.message ||
              (assignment && Number(enteredQuantity) > maxReturnable
                ? `Cannot return more than given (${maxReturnable})`
                : "")}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
}

const ReadyCopperPage = () => {
  const [drawerUsers] = useState(dummyDrawerUsers);
  const [products] = useState(dummyProducts);
  const [assignments] = useState(dummyAssignments);
  const [records, setRecords] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Remove from Ready Copper dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeDrawerUserId, setRemoveDrawerUserId] = useState("");
  const [removeProductId, setRemoveProductId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // History state
  const [history, setHistory] = useState<any[]>([]);
  // For per-row history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalDrawerUserId, setHistoryModalDrawerUserId] = useState("");
  const [historyModalProductId, setHistoryModalProductId] = useState("");

  const handleAdd = (data: any) => {
    const drawerUserId = parseInt(data.drawerUserId);
    const productId = parseInt(data.productId);
    const quantity = Number(data.quantity);
    // Find assignment
    const assignment = assignments.find(
      (a: any) => a.drawerUserId === drawerUserId && a.productId === productId
    );
    if (!assignment) return;
    // Find already returned
    const alreadyReturned =
      records.find(
        (r: any) => r.drawerUserId === drawerUserId && r.productId === productId
      )?.quantity || 0;
    if (quantity > assignment.givenQuantity - alreadyReturned) return;
    // Add or update record
    const idx = records.findIndex(
      (r: any) => r.drawerUserId === drawerUserId && r.productId === productId
    );
    let newRecords;
    if (idx !== -1) {
      // Update existing
      const updated = { ...records[idx] };
      updated.quantity += quantity;
      newRecords = [...records];
      newRecords[idx] = updated;
    } else {
      // Add new
      const newRecord = {
        id: Date.now(),
        drawerUserId,
        productId,
        quantity,
      };
      newRecords = [...records, newRecord];
    }
    setRecords(newRecords);
    setHistory((prev) => [
      ...prev,
      {
        drawerUserId,
        productId,
        action: "add",
        actionDate: new Date(),
        actionQuantity: quantity,
      },
    ]);
    setModalOpen(false);
  };

  // Remove from ready copper logic
  const handleRemoveFromReadyCopper = () => {
    setRemoveError("");
    const drawerUserId = parseInt(removeDrawerUserId);
    const productId = parseInt(removeProductId);
    const quantityToRemove = parseFloat(removeQuantity);
    if (
      !drawerUserId ||
      !productId ||
      !quantityToRemove ||
      quantityToRemove <= 0
    ) {
      setRemoveError(
        "Please select a Drawer User, Product, and enter a valid quantity."
      );
      return;
    }
    const idx = records.findIndex(
      (r: any) => r.drawerUserId === drawerUserId && r.productId === productId
    );
    if (idx === -1) {
      setRemoveError("Drawer User and Product not found.");
      return;
    }
    const record = records[idx];
    if (quantityToRemove > record.quantity) {
      setRemoveError(
        "Cannot remove more than available returned quantity for this user/product."
      );
      return;
    }
    // Subtract quantity
    const updatedRecord = {
      ...record,
      quantity: record.quantity - quantityToRemove,
    };
    const updatedRecords = [...records];
    updatedRecords[idx] = updatedRecord;
    setRecords(updatedRecords);
    setHistory((prev) => [
      ...prev,
      {
        drawerUserId,
        productId,
        action: "remove",
        actionDate: new Date(),
        actionQuantity: quantityToRemove,
      },
    ]);
    setRemoveDialogOpen(false);
    setRemoveDrawerUserId("");
    setRemoveProductId("");
    setRemoveQuantity("");
    setRemoveError("");
  };

  // Per-row history modal logic
  const openHistoryModal = (drawerUserId: number, productId: number) => {
    setHistoryModalDrawerUserId(drawerUserId.toString());
    setHistoryModalProductId(productId.toString());
    setHistoryModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Workflow Stages */}
        <WorkflowStages currentStage={4} />

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-sans">Ready Copper</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Record returned copper from Drawer Users
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setRemoveDialogOpen(true)}
          >
            Remove from Ready Copper
          </Button>
        </div>
        {/* Remove from Ready Copper Dialog */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Remove from Ready Copper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Drawer User</label>
                <Select
                  value={removeDrawerUserId}
                  onValueChange={(v) => {
                    setRemoveDrawerUserId(v);
                    setRemoveProductId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Drawer User" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Set(records.map((r) => r.drawerUserId))
                    ).map((id) => (
                      <SelectItem key={id} value={id.toString()}>
                        {drawerUsers.find((u) => u.id === id)?.name || "N/A"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Product</label>
                <Select
                  value={removeProductId}
                  onValueChange={setRemoveProductId}
                  disabled={!removeDrawerUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {records
                      .filter(
                        (r) => r.drawerUserId.toString() === removeDrawerUserId
                      )
                      .map((r) => (
                        <SelectItem
                          key={r.productId}
                          value={r.productId.toString()}
                        >
                          {products.find((i) => i.id === r.productId)?.name ||
                            "N/A"}{" "}
                          (Returned: {r.quantity})
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
                <Button onClick={handleRemoveFromReadyCopper}>Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">Ready Copper</CardTitle>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Ready Copper</DialogTitle>
                </DialogHeader>
                <ReadyCopperForm
                  onSubmit={handleAdd}
                  onCancel={() => setModalOpen(false)}
                  users={drawerUsers}
                  products={products}
                  assignments={assignments}
                  records={records}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Drawer User
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Returned Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      History
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.drawerUserId + "-" + record.productId}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">
                        {drawerUsers.find((u) => u.id === record.drawerUserId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {products.find((i) => i.id === record.productId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">{record.quantity}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openHistoryModal(
                              record.drawerUserId,
                              record.productId
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No records found.
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
                      Date/Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.filter(
                    (h) =>
                      h.drawerUserId.toString() === historyModalDrawerUserId &&
                      h.productId.toString() === historyModalProductId
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No history yet.
                      </td>
                    </tr>
                  )}
                  {history
                    .filter(
                      (h) =>
                        h.drawerUserId.toString() ===
                          historyModalDrawerUserId &&
                        h.productId.toString() === historyModalProductId
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
      </div>
    </DashboardLayout>
  );
};

export default ReadyCopperPage;
