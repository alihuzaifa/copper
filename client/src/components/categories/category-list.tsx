import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import CategoryForm from "./category-form";

interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

const CategoryList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("supplier");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: supplierCategories, isLoading: isSupplierCategoriesLoading } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.categories.supplierCategories],
  });

  const { data: drawerCategories, isLoading: isDrawerCategoriesLoading } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.categories.drawerCategories],
  });

  const { data: kachaUserCategories, isLoading: isKachaUserCategoriesLoading } = useQuery<Category[]>({
    queryKey: [API_ENDPOINTS.categories.kachaUserCategories],
  });

  const getCategoryEndpoint = () => {
    switch (activeTab) {
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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const endpoint = getCategoryEndpoint();
      const res = await apiRequest("DELETE", `${endpoint}/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete category");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [getCategoryEndpoint()] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      deleteCategoryMutation.mutate(selectedCategory.id);
    }
  };

  const getFilteredCategories = () => {
    let categories: Category[] = [];
    let isLoading = false;

    switch (activeTab) {
      case "supplier":
        categories = supplierCategories || [];
        isLoading = isSupplierCategoriesLoading;
        break;
      case "drawer":
        categories = drawerCategories || [];
        isLoading = isDrawerCategoriesLoading;
        break;
      case "kachaUser":
        categories = kachaUserCategories || [];
        isLoading = isKachaUserCategoriesLoading;
        break;
    }

    if (searchTerm) {
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return { categories, isLoading };
  };

  const { categories, isLoading } = getFilteredCategories();

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: (row: Category) => row.description || "N/A",
    },
    {
      header: "Actions",
      accessorKey: (row: Category) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedCategory(row);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedCategory(row);
                setIsDeleteDialogOpen(true);
              }}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-sans">Categories</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {activeTab === "supplier"
                    ? "Add Supplier Category"
                    : activeTab === "drawer"
                    ? "Add Drawer Category"
                    : "Add Kacha User Category"}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                type={activeTab as "supplier" | "drawer" | "kachaUser"}
                onSuccess={() => setIsAddDialogOpen(false)}
                onCancel={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="supplier"
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="supplier">Supplier Categories</TabsTrigger>
              <TabsTrigger value="drawer">Drawer Categories</TabsTrigger>
              <TabsTrigger value="kachaUser">Kacha User Categories</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search control */}
          <div className="mb-4 flex">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search categories..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories table */}
          <DataTable
            columns={columns}
            data={categories}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Edit category dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "supplier"
                ? "Edit Supplier Category"
                : activeTab === "drawer"
                ? "Edit Drawer Category"
                : "Edit Kacha User Category"}
            </DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              type={activeTab as "supplier" | "drawer" | "kachaUser"}
              category={selectedCategory}
              onSuccess={() => setIsEditDialogOpen(false)}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryList;
