import { useState, useEffect } from "react";
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
  Trash2,
  Search,
  Filter,
  Loader2,
  Power,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/api-client";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Helmet } from 'react-helmet-async';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

interface Category {
  id: number;
  name: string;
}

interface User {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  categoryId: number;
  status: string;
  role: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface UsersResponse extends ApiResponse<User[]> {
  pagination: PaginationInfo;
}

interface CategoriesResponse extends ApiResponse<Category[]> {}

interface CreateUserResponse extends ApiResponse<User> {}

interface DeleteUserResponse extends ApiResponse<null> {
  message: string;
}

interface ToggleStatusResponse extends ApiResponse<{
  id: string;
  status: string;
}> {
  message: string;
}

interface CreateUserData {
  name?: string;
  phoneNumber?: string;
  categoryId: number;
  email?: string;
  password?: string;
  status: string;
}

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
    } else if (data.categoryId === "6") {
      // 'Kacha User' category
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
    } else {
      // Other categories
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

function UserForm({ categories, onSubmit, onCancel }: any) {
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      phone: "",
      categoryId: "",
      email: "",
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
          name: data.name,
          phoneNumber: data.phone,
          categoryId: parseInt(data.categoryId),
          email: data.email,
          password: data.password,
          status: "active",
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
                  {categories.map((category: Category) => (
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
        <Button type="submit">Add User</Button>
      </div>
    </form>
  );
}

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Get auth state from Redux
  const token = useSelector((state: RootState) => state.auth.token);
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await request<null, CategoriesResponse>({
          url: '/users/categories',
          method: 'GET'
        });

        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch categories",
        });
      }
    };

    fetchCategories();
  }, [toast]);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
      });

      const response = await request<null, UsersResponse>({
        url: `/users?${queryParams}`,
        method: 'GET'
      });

      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, searchTerm, categoryFilter, toast]);

  const handleAdd = async (data: CreateUserData) => {
    try {
      const response = await request<CreateUserData, CreateUserResponse>({
        url: '/users',
        method: 'POST',
        data
      });

      if (response.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setModalOpen(false);
        fetchUsers(); // Refresh the users list
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create user",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      const response = await request<null, DeleteUserResponse>({
        url: `/users/${selectedUser._id}`,
        method: 'DELETE'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "User deleted successfully",
        });
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh the users list
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete user",
      });
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const response = await request<null, ToggleStatusResponse>({
        url: `/users/${user._id}/toggle-status`,
        method: 'PATCH'
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        fetchUsers(); // Refresh the users list
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to toggle user status",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{softwareName} | Users</title>
        <meta name="description" content="Manage users for your copper wire manufacturing management system." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold font-sans">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Add and manage your users
            </p>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-sans">Users</CardTitle>
              <Dialog
                open={modalOpen}
                onOpenChange={(open) => {
                  setModalOpen(open);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add User</DialogTitle>
                  </DialogHeader>
                  <UserForm
                    categories={categories}
                    onSubmit={handleAdd}
                    onCancel={() => {
                      setModalOpen(false);
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
                        Name/Email
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
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          <div className="flex justify-center items-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-4 py-2">
                            {user.categoryId === 2 ? user.email : user.name}
                          </td>
                          <td className="px-4 py-2">{user.phoneNumber || "N/A"}</td>
                          <td className="px-4 py-2">
                            {categories.find((c) => c.id === user.categoryId)
                              ?.name || "N/A"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {user.status}
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
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  <Power className="mr-2 h-4 w-4" />
                                  {user.status === 'active' ? 'Deactivate' : 'Activate'}
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
                      ))
                    ) : (
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

              {/* Pagination */}
              {users.length > 0 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                    {pagination.totalItems} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete confirmation dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user "{selectedUser?.name || selectedUser?.email}".
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
    </>
  );
};

export default UsersPage;