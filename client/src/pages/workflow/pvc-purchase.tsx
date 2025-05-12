import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { API_ENDPOINTS, STATUS_OPTIONS, UNIT_OPTIONS } from "@/lib/constants";
import { PvcPurchase, Supplier, insertPvcPurchaseSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Search, Filter, Loader2 } from "lucide-react";

// Form schema for creating/editing PVC purchases
const pvcPurchaseFormSchema = insertPvcPurchaseSchema.extend({
  supplierId: z.coerce.number().min(1, "Please select a supplier"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  pricePerUnit: z.coerce.number().positive("Price per unit must be positive"),
  totalPrice: z.coerce.number().positive("Total price must be positive"),
  pvcColor: z.string().min(1, "Please enter a PVC color"),
  status: z.string().min(1, "Please select a status"),
});

type PvcPurchaseFormValues = z.infer<typeof pvcPurchaseFormSchema>;

const PvcPurchasePage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PvcPurchase | null>(null);

  // Fetch PVC purchases
  const { data: pvcPurchases, isLoading: isPvcPurchasesLoading } = useQuery<PvcPurchase[]>({
    queryKey: [API_ENDPOINTS.workflow.pvcPurchases],
  });

  // Fetch suppliers
  const { data: suppliers, isLoading: isSuppliersLoading } = useQuery<Supplier[]>({
    queryKey: [API_ENDPOINTS.suppliers],
  });

  // Create PVC purchase mutation
  const createPvcPurchaseMutation = useMutation({
    mutationFn: async (data: PvcPurchaseFormValues) => {
      const res = await apiRequest("POST", API_ENDPOINTS.workflow.pvcPurchases, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.pvcPurchases] });
      toast({
        title: "PVC purchase created",
        description: "The PVC purchase has been created successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update PVC purchase mutation
  const updatePvcPurchaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PvcPurchaseFormValues> }) => {
      const res = await apiRequest(
        "PATCH",
        `${API_ENDPOINTS.workflow.pvcPurchases}/${id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.pvcPurchases] });
      toast({
        title: "PVC purchase updated",
        description: "The PVC purchase has been updated successfully.",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create PVC purchase form
  const createForm = useForm<PvcPurchaseFormValues>({
    resolver: zodResolver(pvcPurchaseFormSchema),
    defaultValues: {
      supplierId: undefined,
      pvcColor: "",
      quantity: undefined,
      unit: "kg",
      pricePerUnit: undefined,
      totalPrice: undefined,
      invoiceNumber: "",
      purchaseDate: new Date().toISOString(),
      status: "pending",
      createdBy: user?.id,
      notes: "",
    },
  });

  // Watch price per unit and quantity to auto-calculate total price
  const watchPricePerUnit = createForm.watch("pricePerUnit");
  const watchQuantity = createForm.watch("quantity");

  // Update total price when price per unit or quantity changes
  useState(() => {
    if (watchPricePerUnit && watchQuantity) {
      createForm.setValue("totalPrice", watchPricePerUnit * watchQuantity);
    }
  });

  // Edit PVC purchase form
  const editForm = useForm<PvcPurchaseFormValues>({
    resolver: zodResolver(pvcPurchaseFormSchema.partial()),
    defaultValues: {
      supplierId: selectedPurchase?.supplierId,
      pvcColor: selectedPurchase?.pvcColor,
      quantity: selectedPurchase?.quantity ? Number(selectedPurchase.quantity) : undefined,
      unit: selectedPurchase?.unit,
      pricePerUnit: selectedPurchase?.pricePerUnit
        ? Number(selectedPurchase.pricePerUnit)
        : undefined,
      totalPrice: selectedPurchase?.totalPrice ? Number(selectedPurchase.totalPrice) : undefined,
      invoiceNumber: selectedPurchase?.invoiceNumber,
      purchaseDate: selectedPurchase?.purchaseDate,
      status: selectedPurchase?.status,
      createdBy: selectedPurchase?.createdBy,
      notes: selectedPurchase?.notes || "",
    },
  });

  // Update edit form when selected purchase changes
  useState(() => {
    if (selectedPurchase) {
      editForm.reset({
        supplierId: selectedPurchase.supplierId,
        pvcColor: selectedPurchase.pvcColor,
        quantity: selectedPurchase.quantity ? Number(selectedPurchase.quantity) : undefined,
        unit: selectedPurchase.unit,
        pricePerUnit: selectedPurchase.pricePerUnit
          ? Number(selectedPurchase.pricePerUnit)
          : undefined,
        totalPrice: selectedPurchase.totalPrice
          ? Number(selectedPurchase.totalPrice)
          : undefined,
        invoiceNumber: selectedPurchase.invoiceNumber,
        purchaseDate: selectedPurchase.purchaseDate,
        status: selectedPurchase.status,
        createdBy: selectedPurchase.createdBy,
        notes: selectedPurchase.notes || "",
      });
    }
  });

  // Watch price per unit and quantity for edit form
  const watchEditPricePerUnit = editForm.watch("pricePerUnit");
  const watchEditQuantity = editForm.watch("quantity");

  // Update total price for edit form
  useState(() => {
    if (watchEditPricePerUnit && watchEditQuantity) {
      editForm.setValue("totalPrice", watchEditPricePerUnit * watchEditQuantity);
    }
  });

  const onCreateSubmit = (data: PvcPurchaseFormValues) => {
    createPvcPurchaseMutation.mutate({
      ...data,
      createdBy: user?.id,
    });
  };

  const onEditSubmit = (data: PvcPurchaseFormValues) => {
    if (selectedPurchase) {
      updatePvcPurchaseMutation.mutate({
        id: selectedPurchase.id,
        data,
      });
    }
  };

  // Filter purchases based on search and status
  const filteredPurchases = pvcPurchases
    ? pvcPurchases.filter((purchase) => {
        const matchesSearch =
          searchTerm === "" ||
          purchase.pvcColor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || purchase.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort by purchase date (newest first)
  const sortedPurchases = [...filteredPurchases].sort(
    (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
  );

  const columns = [
    {
      header: "ID",
      accessorKey: (row: PvcPurchase) => `PVC-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Color",
      accessorKey: "pvcColor",
    },
    {
      header: "Supplier",
      accessorKey: (row: PvcPurchase) => {
        const supplier = suppliers?.find((s) => s.id === row.supplierId);
        return supplier ? supplier.name : "N/A";
      },
    },
    {
      header: "Quantity",
      accessorKey: (row: PvcPurchase) =>
        `${Number(row.quantity).toLocaleString()} ${row.unit}`,
    },
    {
      header: "Total Price",
      accessorKey: (row: PvcPurchase) =>
        `₹${Number(row.totalPrice).toLocaleString("en-IN")}`,
    },
    {
      header: "Date",
      accessorKey: "purchaseDate",
      cell: (row: PvcPurchase) => format(new Date(row.purchaseDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: PvcPurchase) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessorKey: (row: PvcPurchase) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedPurchase(row);
                setIsEditDialogOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        {/* Workflow Stages */}
        <WorkflowStages currentStage={5} />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">PVC Purchase</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage PVC material purchases for wire insulation
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-sans">PVC Purchases</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add PVC Purchase
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New PVC Purchase</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a supplier" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isSuppliersLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading suppliers...
                                </SelectItem>
                              ) : suppliers && suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                    {supplier.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No suppliers available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="pvcColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PVC Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PVC color (e.g. Red, Black)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter quantity"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  if (watchPricePerUnit && e.target.value) {
                                    createForm.setValue(
                                      "totalPrice",
                                      parseFloat(e.target.value) * watchPricePerUnit
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {UNIT_OPTIONS.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="pricePerUnit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price Per Unit (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter price per unit"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  if (watchQuantity && e.target.value) {
                                    createForm.setValue(
                                      "totalPrice",
                                      parseFloat(e.target.value) * watchQuantity
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="totalPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Total price"
                                {...field}
                                readOnly
                                className="bg-gray-50 dark:bg-gray-800"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={createForm.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Invoice Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter invoice number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Add any notes or comments" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="button" variant="outline" className="mr-2" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createPvcPurchaseMutation.isPending}
                      >
                        {createPvcPurchaseMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search purchases..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={sortedPurchases}
              isLoading={isPvcPurchasesLoading}
            />
          </CardContent>
        </Card>

        {/* Edit PVC Purchase Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit PVC Purchase</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isSuppliersLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading suppliers...
                            </SelectItem>
                          ) : suppliers && suppliers.length > 0 ? (
                            suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No suppliers available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="pvcColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PVC Color</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PVC color (e.g. Red, Black)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                              if (watchEditPricePerUnit && e.target.value) {
                                editForm.setValue(
                                  "totalPrice",
                                  parseFloat(e.target.value) * watchEditPricePerUnit
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="pricePerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Unit (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter price per unit"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseFloat(e.target.value));
                              if (watchEditQuantity && e.target.value) {
                                editForm.setValue(
                                  "totalPrice",
                                  parseFloat(e.target.value) * watchEditQuantity
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="totalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Total price"
                            {...field}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter invoice number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add any notes or comments" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="button" variant="outline" className="mr-2" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updatePvcPurchaseMutation.isPending}
                  >
                    {updatePvcPurchaseMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default PvcPurchasePage;