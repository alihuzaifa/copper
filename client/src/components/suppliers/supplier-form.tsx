import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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

const supplierFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Please select a category"),
  isActive: z.boolean().default(true),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

const SupplierForm = ({ supplier, categories, onSubmit, onCancel, isUserPage }) => {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      id: supplier?.id,
      name: supplier?.name || "",
      phone: supplier?.phone || "",
      categoryId: supplier?.categoryId || undefined,
      isActive: supplier?.isActive ?? true,
    },
  });

  const handleSubmit = (data) => {
    onSubmit({ ...supplier, ...data });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isUserPage ? "User Name" : "Supplier Name"}</FormLabel>
              <FormControl>
                <Input placeholder={isUserPage ? "Enter user name" : "Enter supplier name"} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {supplier
              ? isUserPage ? "Update User" : "Update Supplier"
              : isUserPage ? "Add User" : "Add Supplier"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierForm;
