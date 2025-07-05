import { useState, useMemo, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DrawerUser {
  id: string;
  name: string;
}

interface KachaProcessingItem {
  id: string;
  name: string;
  quantity: number;
}

interface DrawProcessingFormProps {
  onSubmit: (data: {
    drawerUserId: string;
    kachaInventoryId: string;
    quantity: number;
    totalAmount: number;
  }) => void;
  onCancel: () => void;
  users: DrawerUser[];
  products: KachaProcessingItem[];
  isLoading?: boolean;
}

const DrawProcessingForm = ({ onSubmit, onCancel, users, products, isLoading = false }: DrawProcessingFormProps) => {
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Find the selected product and its available quantity
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const availableQuantity = selectedProduct?.quantity ?? 0;

  // Dynamic schema that depends on availableQuantity
  const dynamicSchema: z.ZodType<any> = useMemo(() =>
    z.object({
      drawerUserId: z.string().min(1, "Select a Drawer User"),
      kachaInventoryId: z.string().min(1, "Select a Kacha Processing Item"),
      quantity: z.coerce.number()
        .positive("Enter a valid quantity")
        .max(availableQuantity, `Cannot exceed available quantity (${availableQuantity})`),
      totalAmount: z.coerce.number().positive("Enter a valid total amount"),
    }),
    [availableQuantity]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      drawerUserId: "",
      kachaInventoryId: "",
      quantity: "",
      totalAmount: "",
    },
    mode: "onTouched",
  });

  // Sync selectedProductId with form value
  const watchedProductId: string = useWatch({ control, name: "kachaInventoryId" });
  useEffect(() => {
    setSelectedProductId(watchedProductId);
    // Optionally reset quantity if product changes
    reset((prev) => ({ ...prev, quantity: "" }));
  }, [watchedProductId, reset]);

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
          drawerUserId: data.drawerUserId,
          kachaInventoryId: data.kachaInventoryId,
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
                  <SelectValue placeholder="Select a Drawer User" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: DrawerUser) => (
                    <SelectItem key={user.id} value={user.id}>
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
        <label className="block mb-1 font-medium">Kacha Processing Item</label>
        <Controller
          name="kachaInventoryId"
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
                  <SelectValue placeholder="Select a Kacha Processing Item" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product: KachaProcessingItem) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} (Qty: {product.quantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.kachaInventoryId?.message as string}
                </div>
              )}
              {selectedProduct && (
                <div className="text-xs text-gray-500 mt-1">Available: {selectedProduct.quantity}</div>
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

export default DrawProcessingForm; 