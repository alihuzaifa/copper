import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Supplier, SupplierCategory } from "@shared/schema";
import { API_ENDPOINTS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
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
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Search,
  Filter,
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SupplierForm from "./supplier-form";

const SupplierList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: suppliers, isLoading: isSuppliersLoading } = useQuery<Supplier[]>({
    queryKey: [API_ENDPOINTS.suppliers],
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery<SupplierCategory[]>({
    queryKey: [API_ENDPOINTS.categories.supplierCategories],
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `${API_ENDPOINTS.suppliers}/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete supplier");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.suppliers] });
      toast({
        title: "Supplier deleted",
        description: "The supplier has been deleted successfully.",
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

  const handleDeleteSupplier = () => {
    if (selectedSupplier) {
      deleteSupplierMutation.mutate(selectedSupplier.id);
    }
  };

  const filteredSuppliers = suppliers
    ? suppliers.filter((supplier) => {
        const matchesSearch = searchTerm === "" || 
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (supplier.phone && supplier.phone.includes(searchTerm));
          
        const matchesCategory = categoryFilter === "" || supplier.categoryId?.toString() === categoryFilter;
        
        return matchesSearch && matchesCategory;
      })
    : [];

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row: Supplier) => row.phone || "N/A",
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (row: Supplier) => row.email || "N/A",
    },
    {
      header: "Category",
      accessorKey: (row: Supplier) => {
        const category = categories?.find(c => c.id === row.categoryId);
        return category ? category.name : "N/A";
      },
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: Supplier) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.isActive 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: Supplier) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedSupplier(row);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedSupplier(row);
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
          <CardTitle className="text-lg font-sans">Suppliers</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm 
                onSuccess={() => setIsAddDialogOpen(false)} 
                onCancel={() => setIsAddDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Search suppliers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-[200px] flex items-center">
              <Filter className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Suppliers table */}
          <DataTable
            columns={columns}
            data={filteredSuppliers}
            isLoading={isSuppliersLoading}
          />
        </CardContent>
      </Card>

      {/* Edit supplier dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierForm
              supplier={selectedSupplier}
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
              This will permanently delete the supplier "{selectedSupplier?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSupplier}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteSupplierMutation.isPending}
            >
              {deleteSupplierMutation.isPending ? (
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

export default SupplierList;
