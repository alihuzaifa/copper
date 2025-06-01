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

// Dummy data
const dummyKachaUsers = [
  { id: 1, name: "Kacha User 1" },
  { id: 2, name: "Kacha User 2" },
  { id: 3, name: "Kacha User 3" },
];
const dummyPurchaseItems = [
  { id: 1, name: "Copper Scrap" },
  { id: 2, name: "Copper Wire" },
  { id: 3, name: "Copper Sheet" },
];

const kachaProcessingSchema = z.object({
  kachaUserId: z.string().min(1, "Select a Kacha User"),
  purchaseItemId: z.string().min(1, "Select a Purchase Item"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  totalAmount: z.coerce.number().positive("Enter a valid total amount"),
});

function KachaProcessingForm({ onSubmit, onCancel, users, items }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(kachaProcessingSchema),
    defaultValues: {
      kachaUserId: "",
      purchaseItemId: "",
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
          kachaUserId: parseInt(data.kachaUserId),
          purchaseItemId: parseInt(data.purchaseItemId),
          quantity: Number(data.quantity),
          totalAmount: Number(data.totalAmount),
        });
      })}
      className="space-y-4"
    >
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
                  <SelectValue placeholder="Select a Kacha User" />
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
                  {errors.kachaUserId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Purchase Item</label>
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
                  <SelectValue placeholder="Select a Purchase Item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item: any) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.purchaseItemId?.message as string}
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

const KachaProcessingPage = () => {
  const [kachaUsers] = useState(dummyKachaUsers);
  const [purchaseItems] = useState(dummyPurchaseItems);
  const [records, setRecords] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Remove from Processing dialog state
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeKachaUserId, setRemoveKachaUserId] = useState("");
  const [removePurchaseItemId, setRemovePurchaseItemId] = useState("");
  const [removeQuantity, setRemoveQuantity] = useState("");
  const [removeError, setRemoveError] = useState("");

  // History state
  const [history, setHistory] = useState<any[]>([]);
  // For per-row history modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalKachaUserId, setHistoryModalKachaUserId] = useState("");
  const [historyModalPurchaseItemId, setHistoryModalPurchaseItemId] =
    useState("");

  const handleAdd = (data: any) => {
    // Check if record exists for this user+item
    const kachaUserId = parseInt(data.kachaUserId);
    const purchaseItemId = parseInt(data.purchaseItemId);
    const quantity = Number(data.quantity);
    const totalAmount = Number(data.totalAmount);
    const idx = records.findIndex(
      (r) =>
        r.kachaUserId === kachaUserId && r.purchaseItemId === purchaseItemId
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
        kachaUserId,
        purchaseItemId,
        quantity,
        totalAmount,
      };
      newRecords = [...records, newRecord];
    }
    setRecords(newRecords);
    setHistory((prev) => [
      ...prev,
      {
        kachaUserId,
        purchaseItemId,
        action: "add",
        actionDate: new Date(),
        actionQuantity: quantity,
      },
    ]);
    setModalOpen(false);
  };

  // Remove from processing logic
  const handleRemoveFromProcessing = () => {
    setRemoveError("");
    const kachaUserId = parseInt(removeKachaUserId);
    const purchaseItemId = parseInt(removePurchaseItemId);
    const quantityToRemove = parseFloat(removeQuantity);
    if (
      !kachaUserId ||
      !purchaseItemId ||
      !quantityToRemove ||
      quantityToRemove <= 0
    ) {
      setRemoveError(
        "Please select a Kacha User, Purchase Item, and enter a valid quantity."
      );
      return;
    }
    const idx = records.findIndex(
      (r) =>
        r.kachaUserId === kachaUserId && r.purchaseItemId === purchaseItemId
    );
    if (idx === -1) {
      setRemoveError("Kacha User and Purchase Item not found.");
      return;
    }
    const record = records[idx];
    if (quantityToRemove > record.quantity) {
      setRemoveError(
        "Cannot remove more than available quantity for this user/item."
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
        kachaUserId,
        purchaseItemId,
        action: "remove",
        actionDate: new Date(),
        actionQuantity: quantityToRemove,
      },
    ]);
    setRemoveDialogOpen(false);
    setRemoveKachaUserId("");
    setRemovePurchaseItemId("");
    setRemoveQuantity("");
    setRemoveError("");
  };

  // Per-row history modal logic
  const openHistoryModal = (kachaUserId: number, purchaseItemId: number) => {
    setHistoryModalKachaUserId(kachaUserId.toString());
    setHistoryModalPurchaseItemId(purchaseItemId.toString());
    setHistoryModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
          <h1 className="text-2xl font-semibold font-sans">
              Kacha Processing
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
              Assign Kacha Users to process purchase items
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setRemoveDialogOpen(true)}
          >
            Remove from Processing
          </Button>
        </div>
        {/* Remove from Processing Dialog */}
        <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
              <DialogTitle>Remove from Processing</DialogTitle>
                </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Kacha User</label>
                          <Select
                  value={removeKachaUserId}
                  onValueChange={(v) => {
                    setRemoveKachaUserId(v);
                    setRemovePurchaseItemId("");
                  }}
                >
                              <SelectTrigger>
                    <SelectValue placeholder="Select Kacha User" />
                              </SelectTrigger>
                            <SelectContent>
                    {Array.from(new Set(records.map((r) => r.kachaUserId))).map(
                      (id) => (
                        <SelectItem key={id} value={id.toString()}>
                          {kachaUsers.find((u) => u.id === id)?.name || "N/A"}
                                </SelectItem>
                      )
                              )}
                            </SelectContent>
                          </Select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Purchase Item</label>
                          <Select
                  value={removePurchaseItemId}
                  onValueChange={setRemovePurchaseItemId}
                  disabled={!removeKachaUserId}
                >
                              <SelectTrigger>
                    <SelectValue placeholder="Select Purchase Item" />
                              </SelectTrigger>
                            <SelectContent>
                    {records
                      .filter(
                        (r) => r.kachaUserId.toString() === removeKachaUserId
                      )
                      .map((r) => (
                                  <SelectItem
                          key={r.purchaseItemId}
                          value={r.purchaseItemId.toString()}
                        >
                          {purchaseItems.find((i) => i.id === r.purchaseItemId)
                            ?.name || "N/A"}{" "}
                          (Qty: {r.quantity})
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
                <Button onClick={handleRemoveFromProcessing}>Remove</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">
              Kacha Processing
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
                  <DialogTitle>Add Kacha Processing</DialogTitle>
                </DialogHeader>
                <KachaProcessingForm
                  onSubmit={handleAdd}
                  onCancel={() => setModalOpen(false)}
                  users={kachaUsers}
                  items={purchaseItems}
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
                      Kacha User
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Purchase Item
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
                      key={record.kachaUserId + "-" + record.purchaseItemId}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">
                        {kachaUsers.find((u) => u.id === record.kachaUserId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {purchaseItems.find(
                          (i) => i.id === record.purchaseItemId
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
                              record.kachaUserId,
                              record.purchaseItemId
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
                      h.kachaUserId.toString() === historyModalKachaUserId &&
                      h.purchaseItemId.toString() === historyModalPurchaseItemId
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
                        h.kachaUserId.toString() === historyModalKachaUserId &&
                        h.purchaseItemId.toString() ===
                          historyModalPurchaseItemId
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

export default KachaProcessingPage;
