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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const initialCategories = [
  { id: 1, name: "Supplier" },
  { id: 2, name: "User" },
  { id: 3, name: "Khata User" },
  { id: 4, name: "Vendor" },
  { id: 5, name: "Darwer" },
];

const userSchema = z
  .object({
    name: z.string().optional(),
    phone: z.string().optional(),
    categoryId: z.string().min(1, "Category is required"),
    email: z.string().optional(),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.categoryId === "2") {
      // 'User' category
      if (!data.email || data.email.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required",
        });
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Invalid email address",
        });
      }
      if (!data.password || data.password.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password is required",
        });
      }
    } else {
      if (!data.name || data.name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "User name is required",
        });
      }
      if (!data.phone || data.phone.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Phone number is required",
        });
      }
    }
  });

function UserForm({ user, categories, onSubmit, onCancel }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      categoryId: user?.categoryId ? user.categoryId.toString() : "",
      email: user?.email || "",
      password: "",
    },
    mode: "onTouched",
  });

  const categoryId = watch("categoryId");

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
          id: user?.id,
          name: data.name,
          phone: data.phone,
          categoryId: parseInt(data.categoryId),
          email: data.email,
          password: data.password,
          isActive: user?.isActive ?? true,
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1 font-medium">Category</label>
        <Controller
          name="categoryId"
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
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.categoryId?.message as string}
                </div>
              )}
            </>
          )}
        />
      </div>
      {categoryId &&
        (categoryId === "2" ? (
          <>
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                {...register("email")}
                placeholder="Enter email"
                className={
                  inputStyles.base +
                  " " +
                  (touchedFields.email
                    ? errors.email
                      ? inputStyles.invalid
                      : inputStyles.valid
                    : inputStyles.default) +
                  " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
                }
                type="email"
              />
              {touchedFields.email && errors.email && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.email.message as string}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                {...register("password")}
                placeholder="Enter password"
                className={
                  inputStyles.base +
                  " " +
                  (touchedFields.password
                    ? errors.password
                      ? inputStyles.invalid
                      : inputStyles.valid
                    : inputStyles.default) +
                  " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
                }
                type="password"
              />
              {touchedFields.password && errors.password && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.password.message as string}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block mb-1 font-medium">User Name</label>
              <input
                {...register("name")}
                placeholder="Enter user name"
                className={
                  inputStyles.base +
                  " " +
                  (touchedFields.name
                    ? errors.name
                      ? inputStyles.invalid
                      : inputStyles.valid
                    : inputStyles.default) +
                  " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
                }
              />
              {touchedFields.name && errors.name && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.name.message as string}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1 font-medium">Phone Number</label>
              <input
                {...register("phone")}
                placeholder="Enter phone number"
                className={
                  inputStyles.base +
                  " " +
                  (touchedFields.phone
                    ? errors.phone
                      ? inputStyles.invalid
                      : inputStyles.valid
                    : inputStyles.default) +
                  " focus:border-gray-300 dark:focus:border-gray-700 focus:ring-0 focus:shadow-none bg-background dark:bg-gray-900 text-foreground dark:text-white"
                }
              />
              {touchedFields.phone && errors.phone && (
                <div className="text-red-600 text-xs mt-1">
                  {errors.phone.message as string}
                </div>
              )}
            </div>
          </>
        ))}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{user ? "Update User" : "Add User"}</Button>
      </div>
    </form>
  );
}

const UsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [categories] = useState(initialCategories);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleAdd = (data: any) => {
    setUsers((prev) => [...prev, { ...data, id: Date.now(), isActive: true }]);
    setModalOpen(false);
  };

  const handleEdit = (data: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === data.id ? { ...u, ...data } : u))
    );
    setModalOpen(false);
    setEditUser(null);
  };

  const handleDelete = () => {
    setUsers((prev) => prev.filter((u: any) => u.id !== selectedUser?.id));
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    const matchesCategory =
      categoryFilter === "all" ||
      user.categoryId?.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, and manage your users
          </p>
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">Users</CardTitle>
            <Dialog
              open={modalOpen}
              onOpenChange={(open) => {
                setModalOpen(open);
                if (!open) setEditUser(null);
              }}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditUser(null);
                    setModalOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editUser ? "Edit User" : "Add User"}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  user={editUser}
                  categories={categories}
                  onSubmit={editUser ? handleEdit : handleAdd}
                  onCancel={() => {
                    setModalOpen(false);
                    setEditUser(null);
                  }}
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
                  placeholder="Search users..."
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
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Users table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Phone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-gray-700"
                    >
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.phone || "N/A"}</td>
                      <td className="px-4 py-2">
                        {categories.find((c) => c.id === user.categoryId)
                          ?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditUser(user);
                                setModalOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-4 text-gray-500 dark:text-gray-400"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Delete confirmation dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user "{selectedUser?.name}".
                This action cannot be undone.
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
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;