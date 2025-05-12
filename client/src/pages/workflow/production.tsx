import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { API_ENDPOINTS, STATUS_OPTIONS } from "@/lib/constants";
import { Production, ReadyCopper, PvcPurchase, insertProductionSchema } from "@shared/schema";
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

// Form schema for creating/editing production
const productionFormSchema = insertProductionSchema.extend({
  readyCopperId: z.coerce.number().min(1, "Please select a ready copper"),
  pvcPurchaseId: z.coerce.number().min(1, "Please select a PVC purchase"),
  inputQuantity: z.coerce.number().positive("Input quantity must be positive"),
  outputQuantity: z.coerce.number().positive("Output quantity must be positive"),
  wireSize: z.string().min(1, "Please enter wire size"),
  pvcColor: z.string().min(1, "Please enter PVC color"),
  status: z.string().min(1, "Please select a status"),
});

type ProductionFormValues = z.infer<typeof productionFormSchema>;

const ProductionPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);

  // Fetch production records
  const { data: productions, isLoading: isProductionsLoading } = useQuery<Production[]>({
    queryKey: [API_ENDPOINTS.workflow.production],
  });

  // Fetch ready copper (to select from)
  const { data: readyCoppers, isLoading: isReadyCoppersLoading } = useQuery<ReadyCopper[]>({
    queryKey: [API_ENDPOINTS.workflow.readyCopper],
  });

  // Fetch PVC purchases (to select from)
  const { data: pvcPurchases, isLoading: isPvcPurchasesLoading } = useQuery<PvcPurchase[]>({
    queryKey: [API_ENDPOINTS.workflow.pvcPurchases],
  });

  // Create production mutation
  const createProductionMutation = useMutation({
    mutationFn: async (data: ProductionFormValues) => {
      const res = await apiRequest("POST", API_ENDPOINTS.workflow.production, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.production] });
      toast({
        title: "Production created",
        description: "The production record has been created successfully.",
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

  // Update production mutation
  const updateProductionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ProductionFormValues> }) => {
      const res = await apiRequest(
        "PATCH",
        `${API_ENDPOINTS.workflow.production}/${id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.production] });
      toast({
        title: "Production updated",
        description: "The production record has been updated successfully.",
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

  // Create production form
  const createForm = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      readyCopperId: undefined,
      pvcPurchaseId: undefined,
      operatorId: user?.id,
      wireSize: "",
      pvcColor: "",
      inputQuantity: undefined,
      outputQuantity: undefined,
      wastage: undefined,
      meterPerKg: undefined,
      productionDate: new Date().toISOString(),
      status: "in_progress",
      notes: "",
    },
  });

  // Watch input and output quantities to auto-calculate wastage
  const watchInputQuantity = createForm.watch("inputQuantity");
  const watchOutputQuantity = createForm.watch("outputQuantity");
  
  // Auto-populate wire size and PVC color based on selected ready copper and PVC purchase
  const watchReadyCopperId = createForm.watch("readyCopperId");
  const watchPvcPurchaseId = createForm.watch("pvcPurchaseId");

  // Update wastage when input or output quantity changes
  useState(() => {
    if (watchInputQuantity && watchOutputQuantity) {
      const wastage = watchInputQuantity - watchOutputQuantity;
      if (wastage >= 0) {
        createForm.setValue("wastage", wastage);
      }
    }
  });

  // Update wire size when ready copper changes
  useState(() => {
    if (watchReadyCopperId && readyCoppers) {
      const selectedCopper = readyCoppers.find(c => c.id === watchReadyCopperId);
      if (selectedCopper) {
        createForm.setValue("wireSize", selectedCopper.wireSize);
      }
    }
  });

  // Update PVC color when PVC purchase changes
  useState(() => {
    if (watchPvcPurchaseId && pvcPurchases) {
      const selectedPvc = pvcPurchases.find(p => p.id === watchPvcPurchaseId);
      if (selectedPvc) {
        createForm.setValue("pvcColor", selectedPvc.pvcColor);
      }
    }
  });

  // Edit production form
  const editForm = useForm<ProductionFormValues>({
    resolver: zodResolver(productionFormSchema.partial()),
    defaultValues: {
      readyCopperId: selectedProduction?.readyCopperId,
      pvcPurchaseId: selectedProduction?.pvcPurchaseId,
      operatorId: selectedProduction?.operatorId,
      wireSize: selectedProduction?.wireSize || "",
      pvcColor: selectedProduction?.pvcColor || "",
      inputQuantity: selectedProduction?.inputQuantity ? Number(selectedProduction.inputQuantity) : undefined,
      outputQuantity: selectedProduction?.outputQuantity ? Number(selectedProduction.outputQuantity) : undefined,
      wastage: selectedProduction?.wastage ? Number(selectedProduction.wastage) : undefined,
      meterPerKg: selectedProduction?.meterPerKg ? Number(selectedProduction.meterPerKg) : undefined,
      productionDate: selectedProduction?.productionDate,
      status: selectedProduction?.status,
      notes: selectedProduction?.notes || "",
    },
  });

  // Update edit form when selected production changes
  useState(() => {
    if (selectedProduction) {
      editForm.reset({
        readyCopperId: selectedProduction.readyCopperId,
        pvcPurchaseId: selectedProduction.pvcPurchaseId,
        operatorId: selectedProduction.operatorId,
        wireSize: selectedProduction.wireSize || "",
        pvcColor: selectedProduction.pvcColor || "",
        inputQuantity: selectedProduction.inputQuantity ? Number(selectedProduction.inputQuantity) : undefined,
        outputQuantity: selectedProduction.outputQuantity ? Number(selectedProduction.outputQuantity) : undefined,
        wastage: selectedProduction.wastage ? Number(selectedProduction.wastage) : undefined,
        meterPerKg: selectedProduction.meterPerKg ? Number(selectedProduction.meterPerKg) : undefined,
        productionDate: selectedProduction.productionDate,
        status: selectedProduction.status,
        notes: selectedProduction.notes || "",
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

  const onCreateSubmit = (data: ProductionFormValues) => {
    createProductionMutation.mutate({
      ...data,
      operatorId: user?.id,
    });
  };

  const onEditSubmit = (data: ProductionFormValues) => {
    if (selectedProduction) {
      updateProductionMutation.mutate({
        id: selectedProduction.id,
        data,
      });
    }
  };

  // Filter productions based on search and status
  const filteredProductions = productions
    ? productions.filter((production) => {
        const matchesSearch =
          searchTerm === "" ||
          production.wireSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
          production.pvcColor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          production.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || production.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort by production date (newest first)
  const sortedProductions = [...filteredProductions].sort(
    (a, b) => new Date(b.productionDate).getTime() - new Date(a.productionDate).getTime()
  );

  const columns = [
    {
      header: "ID",
      accessorKey: (row: Production) => `PRD-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Wire",
      accessorKey: (row: Production) => `${row.wireSize} (${row.pvcColor})`,
    },
    {
      header: "Input",
      accessorKey: (row: Production) => `${Number(row.inputQuantity).toLocaleString()} kg`,
    },
    {
      header: "Output",
      accessorKey: (row: Production) => `${Number(row.outputQuantity).toLocaleString()} kg`,
    },
    {
      header: "Meters/Kg",
      accessorKey: (row: Production) => row.meterPerKg ? `${row.meterPerKg} m/kg` : "N/A",
    },
    {
      header: "Date",
      accessorKey: "productionDate",
      cell: (row: Production) => format(new Date(row.productionDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Production) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessorKey: (row: Production) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedProduction(row);
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
        <WorkflowStages currentStage={6} />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Production</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage the final production of insulated copper wires
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-sans">Production Records</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Production
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Production</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="readyCopperId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ready Copper</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ready copper" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isReadyCoppersLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading ready copper...
                                </SelectItem>
                              ) : readyCoppers && readyCoppers.length > 0 ? (
                                readyCoppers
                                  .filter(copper => copper.status === "in_stock")
                                  .map((copper) => (
                                    <SelectItem key={copper.id} value={copper.id.toString()}>
                                      {copper.wireSize} - {copper.quantity} kg
                                    </SelectItem>
                                  ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No ready copper available
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
                      name="pvcPurchaseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PVC Material</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select PVC material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isPvcPurchasesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading PVC materials...
                                </SelectItem>
                              ) : pvcPurchases && pvcPurchases.length > 0 ? (
                                pvcPurchases
                                  .filter(pvc => pvc.status === "received")
                                  .map((pvc) => (
                                    <SelectItem key={pvc.id} value={pvc.id.toString()}>
                                      {pvc.pvcColor} - {pvc.quantity} {pvc.unit}
                                    </SelectItem>
                                  ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No PVC materials available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={createForm.control}
                        name="wireSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wire Size</FormLabel>
                            <FormControl>
                              <Input placeholder="Wire size" {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                            </FormControl>
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
                              <Input placeholder="PVC color" {...field} readOnly className="bg-gray-50 dark:bg-gray-800" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                placeholder="Wastage"
                                {...field}
                                readOnly
                                className="bg-gray-50 dark:bg-gray-800"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={createForm.control}
                        name="meterPerKg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meters per Kg</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Enter meters per kg"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                        disabled={createProductionMutation.isPending}
                      >
                        {createProductionMutation.isPending && (
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
                  placeholder="Search productions..."
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
              data={sortedProductions}
              isLoading={isProductionsLoading}
            />
          </CardContent>
        </Card>

        {/* Edit Production Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Production</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="readyCopperId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ready Copper</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ready copper" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isReadyCoppersLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading ready copper...
                            </SelectItem>
                          ) : readyCoppers && readyCoppers.length > 0 ? (
                            readyCoppers
                              .filter(copper => copper.status === "in_stock" || copper.id === field.value)
                              .map((copper) => (
                                <SelectItem key={copper.id} value={copper.id.toString()}>
                                  {copper.wireSize} - {copper.quantity} kg
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No ready copper available
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
                  name="pvcPurchaseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PVC Material</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PVC material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isPvcPurchasesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading PVC materials...
                            </SelectItem>
                          ) : pvcPurchases && pvcPurchases.length > 0 ? (
                            pvcPurchases
                              .filter(pvc => pvc.status === "received" || pvc.id === field.value)
                              .map((pvc) => (
                                <SelectItem key={pvc.id} value={pvc.id.toString()}>
                                  {pvc.pvcColor} - {pvc.quantity} {pvc.unit}
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No PVC materials available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="wireSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wire Size</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter wire size" {...field} />
                        </FormControl>
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
                          <Input placeholder="Enter PVC color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                            placeholder="Wastage"
                            {...field}
                            readOnly
                            className="bg-gray-50 dark:bg-gray-800"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="meterPerKg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meters per Kg</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Enter meters per kg"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    disabled={updateProductionMutation.isPending}
                  >
                    {updateProductionMutation.isPending && (
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

export default ProductionPage;