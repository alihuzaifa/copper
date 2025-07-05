import { useState, useMemo, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  name: string;
  quantity: number;
}

interface KachaProcessingFormProps {
  onSubmit: (data: {
    kachaUserId: string;
    purchaseItemId: string;
    quantity: number;
    totalAmount: number;
  }) => void;
  onCancel: () => void;
  users: KachaUser[];
  items: PurchaseItem[];
  isLoading?: boolean;
}

const KachaProcessingForm = ({ onSubmit, onCancel, users, items, isLoading = false }: KachaProcessingFormProps) => {
  const [selectedPurchaseItemId, setSelectedPurchaseItemId] = useState<string>("");
  const selectedItem: PurchaseItem | undefined = items.find(item => item.id === selectedPurchaseItemId);
  const availableQuantity: number = selectedItem?.quantity ?? 0;

  const dynamicSchema: z.ZodType<any> = useMemo(() =>
    z.object({
      kachaUserId: z.string().min(1, "Select a Kacha User"),
      purchaseItemId: z.string().min(1, "Select a Purchase Item"),
      quantity: z.coerce.number()
        .positive("Enter a valid quantity")
        .refine((val) => val <= availableQuantity, {
          message: `Quantity exceeds available stock (${availableQuantity})`,
        }),
      totalAmount: z.coerce.number().positive("Enter a valid total amount"),
    }),
    [availableQuantity]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    control,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      kachaUserId: "",
      purchaseItemId: "",
      quantity: "",
      totalAmount: "",
    },
    mode: "onTouched",
  });

  // Sync selectedPurchaseItemId with form value
  const watchedPurchaseItemId: string = useWatch({ control, name: "purchaseItemId" });
  useEffect(() => {
    setSelectedPurchaseItemId(watchedPurchaseItemId);
  }, [watchedPurchaseItemId]);

  const inputStyles = {
    base: "",
    valid: "border-green-500",
    invalid: "border-red-500",
    default: "border-gray-300 dark:border-gray-700",
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          kachaUserId: data.kachaUserId,
          purchaseItemId: data.purchaseItemId,
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
                disabled={isLoading}
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
                    <SelectItem key={user._id} value={user._id}>
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
                disabled={isLoading}
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
                  {items.map((item: PurchaseItem) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} (Quantity: {item.quantity})
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
        <Input
          {...register("quantity")}
          placeholder="Enter quantity"
          type="number"
          disabled={isLoading}
          className={
            inputStyles.base +
            " " +
            (errors.quantity
              ? inputStyles.invalid
              : touchedFields.quantity
              ? inputStyles.valid
              : inputStyles.default)
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
        <Input
          {...register("totalAmount")}
          placeholder="Enter total amount"
          type="number"
          disabled={isLoading}
          className={
            inputStyles.base +
            " " +
            (errors.totalAmount
              ? inputStyles.invalid
              : touchedFields.totalAmount
              ? inputStyles.valid
              : inputStyles.default)
          }
        />
        {errors.totalAmount && (
          <div className="text-red-600 text-xs mt-1">
            {errors.totalAmount.message as string}
          </div>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add"
          )}
        </Button>
      </div>
    </form>
  );
};

export default KachaProcessingForm; 