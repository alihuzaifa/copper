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
const dummyKachaProducts = [
  { id: 1, name: "Kacha Product 1" },
  { id: 2, name: "Kacha Product 2" },
  { id: 3, name: "Kacha Product 3" },
];

const drawProcessingSchema = z.object({
  drawerUserId: z.string().min(1, "Select a Drawer User"),
  kachaProductId: z.string().min(1, "Select a Kacha Product"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  totalAmount: z.coerce.number().positive("Enter a valid total amount"),
});

function DrawProcessingForm({ onSubmit, onCancel, users, products }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    control,
  } = useForm({
    resolver: zodResolver(drawProcessingSchema),
    defaultValues: {
      drawerUserId: "",
      kachaProductId: "",
      quantity: "",
      totalAmount: "",
    },
    mode: "onTouched",
  });

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
          drawerUserId: parseInt(data.drawerUserId),
          kachaProductId: parseInt(data.kachaProductId),
          quantity: Number(data.quantity),
          totalAmount: Number(data.totalAmount),
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
        <label className="block mb-1 font-medium">Kacha Product</label>
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
                  <SelectValue placeholder="Select a Kacha Product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.kachaProductId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Quantity</label>
        <input
          {...register("quantity")}
          placeholder="Enter quantity"
          type="number"
          className={
            inputStyles.base +
            " " +
            (errors.quantity
              ? inputStyles.invalid
              : touchedFields.quantity
              ? inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {errors.quantity && (
          <div className="text-red-600 text-xs mt-1">
            {errors.quantity.message as string}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Total Amount</label>
        <input
          {...register("totalAmount")}
          placeholder="Enter total amount"
          type="number"
          className={
            inputStyles.base +
            " " +
            (errors.totalAmount
              ? inputStyles.invalid
              : touchedFields.totalAmount
              ? inputStyles.valid
              : inputStyles.default) +
            " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
          }
        />
        {errors.totalAmount && (
          <div className="text-red-600 text-xs mt-1">
            {errors.totalAmount.message as string}
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

const DrawProcessPage = () => {
  const [drawerUsers] = useState(dummyDrawerUsers);
  const [kachaProducts] = useState(dummyKachaProducts);
  const [records, setRecords] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Remove from Draw dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeDrawerUserId, setRemoveDrawerUserId] = useState("");
  const [removeKachaProductId, setRemoveKachaProductId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // History state
  const [history, setHistory] = useState<any[]>([]);
  // For per-row history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalDrawerUserId, setHistoryModalDrawerUserId] = useState("");
  const [historyModalKachaProductId, setHistoryModalKachaProductId] = useState("");

  const handleAdd = (data: any) => {
    // Check if record exists for this user+product
    const drawerUserId = parseInt(data.drawerUserId);
    const kachaProductId = parseInt(data.kachaProductId);
    const quantity = Number(data.quantity);
    const totalAmount = Number(data.totalAmount);
    const idx = records.findIndex(
      (r) =>
        r.drawerUserId === drawerUserId && r.kachaProductId === kachaProductId
    );
    let newRecords;
    if (idx !== -1) {
      // Update existing
      const updated = { ...records[idx] };
      updated.quantity += quantity;
      updated.totalAmount += totalAmount;
      newRecords = [...records];
      newRecords[idx] = updated;
    } else {
      // Add new
      const newRecord = {
        id: Date.now(),
        drawerUserId,
        kachaProductId,
        quantity,
        totalAmount,
      };
      newRecords = [...records, newRecord];
    }
    setRecords(newRecords);
    setHistory((prev) => [
      ...prev,
      {
        drawerUserId,
        kachaProductId,
        action: "add",
        actionDate: new Date(),
        actionQuantity: quantity,
      },
    ]);
    setModalOpen(false);
  };

  // Remove from draw logic
  const handleRemoveFromDraw = () => {
    setRemoveError("");
    const drawerUserId = parseInt(removeDrawerUserId);
    const kachaProductId = parseInt(removeKachaProductId);
    const quantityToRemove = parseFloat(removeQuantity);
    if (
      !drawerUserId ||
      !kachaProductId ||
      !quantityToRemove ||
      quantityToRemove <= 0
    ) {
      setRemoveError(
        "Please select a Drawer User, Kacha Product, and enter a valid quantity."
      );
      return;
    }
    const idx = records.findIndex(
      (r) =>
        r.drawerUserId === drawerUserId && r.kachaProductId === kachaProductId
    );
    if (idx === -1) {
      setRemoveError("Drawer User and Kacha Product not found.");
      return;
    }
    const record = records[idx];
    if (quantityToRemove > record.quantity) {
      setRemoveError(
        "Cannot remove more than available quantity for this user/product."
      );
      return;
    }
    // Subtract quantity
    const updatedRecord = {
      ...record,
      quantity: record.quantity - quantityToRemove,
      totalAmount:
        record.totalAmount *
        ((record.quantity - quantityToRemove) / record.quantity),
    };
    const updatedRecords = [...records];
    updatedRecords[idx] = updatedRecord;
    setRecords(updatedRecords);
    setHistory((prev) => [
      ...prev,
      {
        drawerUserId,
        kachaProductId,
        action: "remove",
        actionDate: new Date(),
        actionQuantity: quantityToRemove,
      },
    ]);
    setRemoveDialogOpen(false);
    setRemoveDrawerUserId("");
    setRemoveKachaProductId("");
    setRemoveQuantity("");
    setRemoveError("");
  };

  // Per-row history modal logic
  const openHistoryModal = (drawerUserId: number, kachaProductId: number) => {
    setHistoryModalDrawerUserId(drawerUserId.toString());
    setHistoryModalKachaProductId(kachaProductId.toString());
    setHistoryModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Workflow Stages */}
        <WorkflowStages currentStage={3} />

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-sans">
              Draw Processing
            </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
              Assign Drawer Users to process kacha products
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setRemoveDialogOpen(true)}
          >
            Remove from Draw
          </Button>
        </div>
        {/* Remove from Draw Dialog */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
              <DialogTitle>Remove from Draw</DialogTitle>
                </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Drawer User</label>
                          <Select
                  value={removeDrawerUserId}
                  onValueChange={(v) => {
                    setRemoveDrawerUserId(v);
                    setRemoveKachaProductId("");
                  }}
                >
                              <SelectTrigger>
                    <SelectValue placeholder="Select Drawer User" />
                              </SelectTrigger>
                            <SelectContent>
                    {Array.from(new Set(records.map((r) => r.drawerUserId))).map(
                      (id) => (
                        <SelectItem key={id} value={id.toString()}>
                          {drawerUsers.find((u) => u.id === id)?.name || "N/A"}
                                </SelectItem>
                      )
                              )}
                            </SelectContent>
                          </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Kacha Product</label>
                          <Select
                  value={removeKachaProductId}
                  onValueChange={setRemoveKachaProductId}
                  disabled={!removeDrawerUserId}
                >
                              <SelectTrigger>
                    <SelectValue placeholder="Select Kacha Product" />
                              </SelectTrigger>
                            <SelectContent>
                    {records
                      .filter(
                        (r) => r.drawerUserId.toString() === removeDrawerUserId
                      )
                      .map((r) => (
                                  <SelectItem
                          key={r.kachaProductId}
                          value={r.kachaProductId.toString()}
                        >
                          {kachaProducts.find((i) => i.id === r.kachaProductId)
                            ?.name || "N/A"} (Qty: {r.quantity})
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
                <Button onClick={handleRemoveFromDraw}>Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">
              Draw Processing
            </CardTitle>
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
                  onSubmit={handleAdd}
                  onCancel={() => setModalOpen(false)}
                  users={drawerUsers}
                  products={kachaProducts}
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
                      Kacha Product
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Amount
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      History
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr
                      key={record.drawerUserId + "-" + record.kachaProductId}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">
                        {drawerUsers.find((u) => u.id === record.drawerUserId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {kachaProducts.find(
                          (i) => i.id === record.kachaProductId
                        )?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">{record.quantity}</td>
                      <td className="px-4 py-2">{record.totalAmount}</td>
                      <td className="px-4 py-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openHistoryModal(
                              record.drawerUserId,
                              record.kachaProductId
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
                        colSpan={5}
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
                      h.kachaProductId.toString() === historyModalKachaProductId
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
                        h.drawerUserId.toString() === historyModalDrawerUserId &&
                        h.kachaProductId.toString() === historyModalKachaProductId
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

export default DrawProcessPage;
