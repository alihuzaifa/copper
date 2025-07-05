import { useEffect, useState } from 'react';
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Trash2, Check, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Constants
const PAGE_SIZES = [10, 20, 30, 50, 100];

// Types
interface ApiCheck {
  _id: string;
  bankName: string;
  accountTitle: string;
  checkNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  notes?: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  shopId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChecksResponse {
  success: boolean;
  message: string;
  data: {
    checks: ApiCheck[];
    total: number;
  };
}

interface CheckResponse {
  success: boolean;
  message: string;
  data: {
    check: ApiCheck;
  };
}

interface FilterState {
  search: string;
}

// Form schema
const checkSchema = z.object({
  bankName: z.string().min(1, "Bank Name is required"),
  accountTitle: z.string().min(1, "Account Title is required"),
  checkNumber: z.string().min(1, "Check Number is required"),
  amount: z.number().min(1, "Amount must be positive"),
  issueDate: z.string().min(1, "Issue Date is required"),
  dueDate: z.string().min(1, "Due Date is required"),
  notes: z.string().optional(),
});

type CheckFormValues = z.infer<typeof checkSchema>;

interface Check extends CheckFormValues {
  _id: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  shopId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CheckPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCheckId, setSelectedCheckId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [totalItems, setTotalItems] = useState(0);
  const [checks, setChecks] = useState<Check[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
  });

  const form = useForm<CheckFormValues>({
    resolver: zodResolver(checkSchema),
    defaultValues: {
      bankName: "",
      accountTitle: "",
      checkNumber: "",
      amount: 0,
      issueDate: moment().format("YYYY-MM-DD"),
      dueDate: moment().format("YYYY-MM-DD"),
      notes: "",
    },
  });

  useEffect(() => {
    fetchChecks();
  }, [page, pageSize, filters]);

  const fetchChecks = async () => {
    try {
      setPageLoading(true);
      const response = await request<void, ChecksResponse>({
        url: '/checks',
        method: 'GET',
        params: {
          page,
          limit: pageSize,
          search: filters.search || "",
        },
      });

      if (response.success) {
        setChecks(response.data.checks);
        setTotalItems(response.data.total);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch checks",
      });
    } finally {
      setPageLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchChecks();
  };

  const onSubmit = async (values: CheckFormValues) => {
    try {
      setIsLoading(true);
      if (editMode) {
        const response = await request<CheckFormValues, CheckResponse>({
          url: `/checks/${selectedCheckId}`,
          method: 'PUT',
          data: values,
        });

        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Check updated successfully",
          });
        } else {
          throw new Error(response.message);
        }
      } else {
        const response = await request<CheckFormValues, CheckResponse>({
          url: '/checks',
          method: 'POST',
          data: values,
        });

        if (response.success) {
          toast({
            title: "Success",
            description: response.message || "Check created successfully",
          });
        } else {
          throw new Error(response.message);
        }
      }
      form.reset();
      setEditMode(false);
      setSelectedCheckId("");
      fetchChecks();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${editMode ? 'update' : 'create'} check`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (check: Check) => {
    if (check.status === 'cleared') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cleared checks cannot be edited",
      });
      return;
    }
    setSelectedCheckId(check._id);
    setEditMode(true);
    form.reset({
      bankName: check.bankName,
      accountTitle: check.accountTitle,
      checkNumber: check.checkNumber,
      amount: check.amount,
      issueDate: moment(check.issueDate).format("YYYY-MM-DD"),
      dueDate: moment(check.dueDate).format("YYYY-MM-DD"),
      notes: check.notes,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await request<void, { success: boolean; message: string }>({
        url: `/checks/${id}`,
        method: 'DELETE',
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Check deleted successfully",
        });
        fetchChecks();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete check",
      });
    }
  };

  const handleStatusChange = async (id: string, status: 'cleared') => {
    try {
      const response = await request<{ status: string }, { success: boolean; message: string }>({
        url: `/checks/${id}/status`,
        method: 'PUT',
        data: { status },
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Check status updated successfully",
        });
        fetchChecks();
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update check status",
      });
    }
  };

  const columns = [
    {
      header: "Bank Name",
      accessorKey: "bankName" as keyof Check,
    },
    {
      header: "Account Title",
      accessorKey: "accountTitle" as keyof Check,
    },
    {
      header: "Check Number",
      accessorKey: "checkNumber" as keyof Check,
    },
    {
      header: "Amount",
      accessorKey: "amount" as keyof Check,
      cell: (row: Check) => `Rs. ${row.amount.toLocaleString()}`,
    },
    {
      header: "Issue Date",
      accessorKey: "issueDate" as keyof Check,
      cell: (row: Check) => moment(row.issueDate).format("DD/MM/YYYY"),
    },
    {
      header: "Due Date",
      accessorKey: "dueDate" as keyof Check,
      cell: (row: Check) => moment(row.dueDate).format("DD/MM/YYYY"),
    },
    {
      header: "Status",
      accessorKey: "status" as keyof Check,
      cell: (row: Check) => (
        <span className={`badge ${getStatusBadgeClass(row.status)}`}>
          {capitalize(row.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id" as keyof Check,
      cell: (row: Check) => (
        <div className="flex gap-2">
          {row.status !== 'cleared' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(row)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(row._id, 'cleared')}
              >
                <Check className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row._id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cleared':
        return 'bg-green-100 text-green-800';
      case 'bounced':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>{editMode ? 'Edit Check' : 'Add New Check'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter check number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notes (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  {editMode && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        setEditMode(false);
                        setSelectedCheckId("");
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editMode ? 'Update Check' : 'Add Check'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Checks List</CardTitle>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 flex gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                  <Input
                    placeholder="Search by bank name, account title, or check number..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <div className="flex gap-4">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => setPageSize(Number(value))}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={checks}
              isLoading={pageLoading}
              pageSize={pageSize}
              totalItems={totalItems}
              currentPage={page}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
