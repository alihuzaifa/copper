import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialCategories = [
  { id: 1, name: "Supplier" },
  { id: 2, name: "User" },
  { id: 3, name: "Khata User" },
  { id: 4, name: "Vendor" },
  { id: 5, name: "Darwer" },
];

const initialSuppliers = [
  {
    id: 1,
    name: "Copper Inc.",
    phone: "1234567890",
    categoryId: 1,
    isActive: true,
  },
];

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [categories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const handleAdd = (data: any) => {
    setSuppliers((prev) => [
      ...prev,
      { ...data, id: Date.now(), isActive: true },
    ]);
    setModalOpen(false);
  };

  const handleEdit = (data: any) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
    );
    setModalOpen(false);
    setEditSupplier(null);
  };

  const handleDelete = () => {
    setSuppliers((prev) => prev.filter((s) => s.id !== selectedSupplier.id));
    setDeleteDialogOpen(false);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchTerm === "" ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.phone && supplier.phone.includes(searchTerm));
    const matchesCategory =
      categoryFilter === "all" || supplier.categoryId?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Phone",
      accessorKey: "phone",
      cell: (row: any) => row.phone || "N/A",
    },
    {
      header: "Category",
      accessorKey: (row: any) => {
        const category = categories.find((c) => c.id === row.categoryId);
        return category ? category.name : "N/A";
      },
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${row.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditSupplier(row);
                setModalOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedSupplier(row);
                setDeleteDialogOpen(true);
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
          <CardTitle className="text-lg font-sans">Users</CardTitle>
          <Dialog open={modalOpen} onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) setEditSupplier(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditSupplier(null); setModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editSupplier ? "Edit User" : "Add User"}</DialogTitle>
              </DialogHeader>
              <SupplierForm
                supplier={editSupplier}
                categories={categories}
                onSubmit={editSupplier ? handleEdit : handleAdd}
                onCancel={() => { setModalOpen(false); setEditSupplier(null); }}
                isUserPage={true}
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Suppliers table */}
          <DataTable columns={columns as any} data={filteredSuppliers} isLoading={false} />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user "{selectedSupplier?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SupplierList;
