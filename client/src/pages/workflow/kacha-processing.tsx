import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { API_ENDPOINTS, STATUS_OPTIONS, UNIT_OPTIONS } from "@/lib/constants";
import { KachaProcessing, RawMaterialPurchase, KachaUserCategory, insertKachaProcessingSchema } from "@shared/schema";
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

// Form schema for creating/editing kacha processing
const kachaProcessingFormSchema = insertKachaProcessingSchema.extend({
  purchaseId: z.coerce.number().min(1, "Please select a raw material"),
  categoryId: z.coerce.number().min(1, "Please select a processor category"),
  inputQuantity: z.coerce.number().positive("Input quantity must be positive"),
  outputQuantity: z.coerce.number().positive("Output quantity must be positive"),
  wastage: z.coerce.number().optional(),
  status: z.string().min(1, "Please select a status"),
});

type KachaProcessingFormValues = z.infer<typeof kachaProcessingFormSchema>;

const KachaProcessingPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<KachaProcessing | null>(null);

  // Fetch kacha processing records
  const { data: kachaProcesses, isLoading: isKachaProcessesLoading } = useQuery<KachaProcessing[]>({
    queryKey: [API_ENDPOINTS.workflow.kachaProcessing],
  });

  // Fetch raw material purchases (to select from)
  const { data: rawMaterials, isLoading: isRawMaterialsLoading } = useQuery<RawMaterialPurchase[]>({
    queryKey: [API_ENDPOINTS.workflow.rawMaterialPurchases],
  });

  // Fetch kacha user categories
  const { data: kachaCategories, isLoading: isKachaUserCategoriesLoading } = useQuery<KachaUserCategory[]>({
    queryKey: [API_ENDPOINTS.categories.kachaUserCategories],
  });

  // Create kacha processing mutation
  const createKachaProcessingMutation = useMutation({
    mutationFn: async (data: KachaProcessingFormValues) => {
      const res = await apiRequest("POST", API_ENDPOINTS.workflow.kachaProcessing, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.kachaProcessing] });
      toast({
        title: "Kacha processing created",
        description: "The kacha processing record has been created successfully.",
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

  // Update kacha processing mutation
  const updateKachaProcessingMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<KachaProcessingFormValues> }) => {
      const res = await apiRequest(
        "PATCH",
        `${API_ENDPOINTS.workflow.kachaProcessing}/${id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.kachaProcessing] });
      toast({
        title: "Kacha processing updated",
        description: "The kacha processing record has been updated successfully.",
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

  // Create kacha processing form
  const createForm = useForm<KachaProcessingFormValues>({
    resolver: zodResolver(kachaProcessingFormSchema),
    defaultValues: {
      purchaseId: undefined,
      processorId: user?.id,
      categoryId: undefined,
      inputQuantity: undefined,
      outputQuantity: undefined,
      wastage: undefined,
      processDate: new Date().toISOString(),
      status: "in_progress",
      notes: "",
    },
  });

  // Watch input and output quantities to auto-calculate wastage
  const watchInputQuantity = createForm.watch("inputQuantity");
  const watchOutputQuantity = createForm.watch("outputQuantity");

  // Update wastage when input or output quantity changes
  useState(() => {
    if (watchInputQuantity && watchOutputQuantity) {
      const wastage = watchInputQuantity - watchOutputQuantity;
      if (wastage >= 0) {
        createForm.setValue("wastage", wastage);
      }
    }
  });

  // Edit kacha processing form
  const editForm = useForm<KachaProcessingFormValues>({
    resolver: zodResolver(kachaProcessingFormSchema.partial()),
    defaultValues: {
      purchaseId: selectedProcess?.purchaseId,
      processorId: selectedProcess?.processorId,
      categoryId: selectedProcess?.categoryId,
      inputQuantity: selectedProcess?.inputQuantity ? Number(selectedProcess.inputQuantity) : undefined,
      outputQuantity: selectedProcess?.outputQuantity ? Number(selectedProcess.outputQuantity) : undefined,
      wastage: selectedProcess?.wastage ? Number(selectedProcess.wastage) : undefined,
      processDate: selectedProcess?.processDate,
      status: selectedProcess?.status,
      notes: selectedProcess?.notes || "",
    },
  });

  // Update edit form when selected process changes
  useState(() => {
    if (selectedProcess) {
      editForm.reset({
        purchaseId: selectedProcess.purchaseId,
        processorId: selectedProcess.processorId,
        categoryId: selectedProcess.categoryId,
        inputQuantity: selectedProcess.inputQuantity ? Number(selectedProcess.inputQuantity) : undefined,
        outputQuantity: selectedProcess.outputQuantity ? Number(selectedProcess.outputQuantity) : undefined,
        wastage: selectedProcess.wastage ? Number(selectedProcess.wastage) : undefined,
        processDate: selectedProcess.processDate,
        status: selectedProcess.status,
        notes: selectedProcess.notes || "",
      });
    }
  });

  // Watch input and output quantities for edit form
  const watchEditInputQuantity = editForm.watch("inputQuantity");
  const watchEditOutputQuantity = editForm.watch("outputQuantity");

  // Update wastage for edit form
  useState(() => {
    if (watchEditInputQuantity && watchEditOutputQuantity) {
      const wastage = watchEditInputQuantity - watchEditOutputQuantity;
      if (wastage >= 0) {
        editForm.setValue("wastage", wastage);
      }
    }
  });

  const onCreateSubmit = (data: KachaProcessingFormValues) => {
    createKachaProcessingMutation.mutate({
      ...data,
      processorId: user?.id,
    });
  };

  const onEditSubmit = (data: KachaProcessingFormValues) => {
    if (selectedProcess) {
      updateKachaProcessingMutation.mutate({
        id: selectedProcess.id,
        data,
      });
    }
  };

  // Filter processes based on search and status
  const filteredProcesses = kachaProcesses
    ? kachaProcesses.filter((process) => {
        const matchesSearch =
          searchTerm === "" ||
          process.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || process.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort by process date (newest first)
  const sortedProcesses = [...filteredProcesses].sort(
    (a, b) => new Date(b.processDate).getTime() - new Date(a.processDate).getTime()
  );

  const columns = [
    {
      header: "ID",
      accessorKey: (row: KachaProcessing) => `KP-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Raw Material",
      accessorKey: (row: KachaProcessing) => {
        const purchase = rawMaterials?.find(p => p.id === row.purchaseId);
        return purchase ? purchase.materialName : "N/A";
      },
    },
    {
      header: "Category",
      accessorKey: (row: KachaProcessing) => {
        const category = kachaCategories?.find(c => c.id === row.categoryId);
        return category ? category.name : "N/A";
      },
    },
    {
      header: "Input",
      accessorKey: (row: KachaProcessing) => `${Number(row.inputQuantity).toLocaleString()} kg`,
    },
    {
      header: "Output",
      accessorKey: (row: KachaProcessing) => `${Number(row.outputQuantity).toLocaleString()} kg`,
    },
    {
      header: "Wastage",
      accessorKey: (row: KachaProcessing) => 
        row.wastage ? `${Number(row.wastage).toLocaleString()} kg` : "N/A",
    },
    {
      header: "Date",
      accessorKey: "processDate",
      cell: (row: KachaProcessing) => format(new Date(row.processDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: KachaProcessing) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessorKey: (row: KachaProcessing) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedProcess(row);
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
        <WorkflowStages currentStage={2} />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Kacha Copper Processing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage the initial processing of raw copper materials
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-sans">Kacha Processing Records</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Process
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Kacha Processing</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="purchaseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raw Material</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select raw material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isRawMaterialsLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading raw materials...
                                </SelectItem>
                              ) : rawMaterials && rawMaterials.length > 0 ? (
                                rawMaterials
                                  .filter(material => material.status === "received")
                                  .map((material) => (
                                    <SelectItem key={material.id} value={material.id.toString()}>
                                      {material.materialName} ({material.quantity} {material.unit})
                                    </SelectItem>
                                  ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No raw materials available
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Processor Category</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select processor category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isKachaUserCategoriesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading categories...
                                </SelectItem>
                              ) : kachaCategories && kachaCategories.length > 0 ? (
                                kachaCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No categories available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={createForm.control}
                        name="inputQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Input Quantity (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter input quantity"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  if (watchOutputQuantity && e.target.value) {
                                    const wastage = parseFloat(e.target.value) - watchOutputQuantity;
                                    if (wastage >= 0) {
                                      createForm.setValue("wastage", wastage);
                                    }
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
                        name="outputQuantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Output Quantity (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter output quantity"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(parseFloat(e.target.value));
                                  if (watchInputQuantity && e.target.value) {
                                    const wastage = watchInputQuantity - parseFloat(e.target.value);
                                    if (wastage >= 0) {
                                      createForm.setValue("wastage", wastage);
                                    }
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
                        name="wastage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wastage (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Auto-calculated"
                                {...field}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                              {STATUS_OPTIONS.kachaProcessing.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
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
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any additional notes"
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
                        onClick={() => setIsAddDialogOpen(false)}
                        disabled={createKachaProcessingMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createKachaProcessingMutation.isPending}
                      >
                        {createKachaProcessingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Process"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search and filter controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    {STATUS_OPTIONS.kachaProcessing.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kacha processes table */}
            <DataTable
              columns={columns}
              data={sortedProcesses}
              isLoading={isKachaProcessesLoading}
            />
          </CardContent>
        </Card>

        {/* Edit kacha processing dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Kacha Processing</DialogTitle>
            </DialogHeader>
            {selectedProcess && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="purchaseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Raw Material</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select raw material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isRawMaterialsLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading raw materials...
                              </SelectItem>
                            ) : rawMaterials && rawMaterials.length > 0 ? (
                              rawMaterials
                                .filter(material => material.status === "received")
                                .map((material) => (
                                  <SelectItem key={material.id} value={material.id.toString()}>
                                    {material.materialName} ({material.quantity} {material.unit})
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="empty" disabled>
                                No raw materials available
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
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Processor Category</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select processor category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isKachaUserCategoriesLoading ? (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            ) : kachaCategories && kachaCategories.length > 0 ? (
                              kachaCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="empty" disabled>
                                No categories available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="inputQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Input Quantity (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter input quantity"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value));
                                if (watchEditOutputQuantity && e.target.value) {
                                  const wastage = parseFloat(e.target.value) - watchEditOutputQuantity;
                                  if (wastage >= 0) {
                                    editForm.setValue("wastage", wastage);
                                  }
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
                      name="outputQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Output Quantity (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter output quantity"
                              {...field}
                              onChange={(e) => {
                                field.onChange(parseFloat(e.target.value));
                                if (watchEditInputQuantity && e.target.value) {
                                  const wastage = watchEditInputQuantity - parseFloat(e.target.value);
                                  if (wastage >= 0) {
                                    editForm.setValue("wastage", wastage);
                                  }
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
                      name="wastage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wastage (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Auto-calculated"
                              {...field}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            {STATUS_OPTIONS.kachaProcessing.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
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
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes"
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
                      onClick={() => setIsEditDialogOpen(false)}
                      disabled={updateKachaProcessingMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateKachaProcessingMutation.isPending}
                    >
                      {updateKachaProcessingMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Process"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default KachaProcessingPage;
