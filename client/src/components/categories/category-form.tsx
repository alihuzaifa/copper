import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { API_ENDPOINTS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface CategoryFormProps {
  type: "supplier" | "drawer" | "kachaUser";
  category?: { id: number; name: string; description?: string };
  onSuccess: () => void;
  onCancel: () => void;
}

const categoryFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const CategoryForm = ({ type, category, onSuccess, onCancel }: CategoryFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getEndpoint = () => {
    switch (type) {
      case "supplier":
        return API_ENDPOINTS.categories.supplierCategories;
      case "drawer":
        return API_ENDPOINTS.categories.drawerCategories;
      case "kachaUser":
        return API_ENDPOINTS.categories.kachaUserCategories;
      default:
        return "";
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      const endpoint = getEndpoint();
      if (category) {
        const res = await apiRequest("PATCH", `${endpoint}/${category.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", endpoint, data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getEndpoint()] });
      toast({
        title: category ? "Category updated" : "Category added",
        description: category
          ? "The category has been updated successfully."
          : "The category has been added successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      description: category?.description || "",
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter category description" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {category ? "Updating..." : "Adding..."}
              </>
            ) : (
              category ? "Update Category" : "Add Category"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CategoryForm;
