import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { API_ENDPOINTS, STATUS_OPTIONS } from "@/lib/constants";
import { ReadyCopper, DrawProcess, insertReadyCopperSchema } from "@shared/schema";
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

// Form schema for creating/editing ready copper
const readyCopperFormSchema = insertReadyCopperSchema.extend({
  drawProcessId: z.coerce.number().min(1, "Please select a draw process"),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  wireSize: z.string().min(1, "Please enter wire size"),
  status: z.string().min(1, "Please select a status"),
});

type ReadyCopperFormValues = z.infer<typeof readyCopperFormSchema>;

const ReadyCopperPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCopper, setSelectedCopper] = useState<ReadyCopper | null>(null);

  // Fetch ready copper records
  const { data: readyCoppers, isLoading: isReadyCoppersLoading } = useQuery<ReadyCopper[]>({
    queryKey: [API_ENDPOINTS.workflow.readyCopper],
  });

  // Fetch draw processes (to select from)
  const { data: drawProcesses, isLoading: isDrawProcessesLoading } = useQuery<DrawProcess[]>({
    queryKey: [API_ENDPOINTS.workflow.drawProcess],
  });

  // Create ready copper mutation
  const createReadyCopperMutation = useMutation({
    mutationFn: async (data: ReadyCopperFormValues) => {
      const res = await apiRequest("POST", API_ENDPOINTS.workflow.readyCopper, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.readyCopper] });
      toast({
        title: "Ready copper created",
        description: "The ready copper record has been created successfully.",
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

  // Update ready copper mutation
  const updateReadyCopperMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ReadyCopperFormValues> }) => {
      const res = await apiRequest(
        "PATCH",
        `${API_ENDPOINTS.workflow.readyCopper}/${id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_ENDPOINTS.workflow.readyCopper] });
      toast({
        title: "Ready copper updated",
        description: "The ready copper record has been updated successfully.",
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

  // Create ready copper form
  const createForm = useForm<ReadyCopperFormValues>({
    resolver: zodResolver(readyCopperFormSchema),
    defaultValues: {
      drawProcessId: undefined,
      userId: user?.id,
      quantity: undefined,
      wireSize: "",
      readyDate: new Date().toISOString(),
      status: "in_stock",
      notes: "",
    },
  });

  // Edit ready copper form
  const editForm = useForm<ReadyCopperFormValues>({
    resolver: zodResolver(readyCopperFormSchema.partial()),
    defaultValues: {
      drawProcessId: selectedCopper?.drawProcessId,
      userId: selectedCopper?.userId,
      quantity: selectedCopper?.quantity ? Number(selectedCopper.quantity) : undefined,
      wireSize: selectedCopper?.wireSize || "",
      readyDate: selectedCopper?.readyDate,
      status: selectedCopper?.status,
      notes: selectedCopper?.notes || "",
    },
  });

  // Update edit form when selected copper changes
  useState(() => {
    if (selectedCopper) {
      editForm.reset({
        drawProcessId: selectedCopper.drawProcessId,
        userId: selectedCopper.userId,
        quantity: selectedCopper.quantity ? Number(selectedCopper.quantity) : undefined,
        wireSize: selectedCopper.wireSize || "",
        readyDate: selectedCopper.readyDate,
        status: selectedCopper.status,
        notes: selectedCopper.notes || "",
      });
    }
  });

  const onCreateSubmit = (data: ReadyCopperFormValues) => {
    createReadyCopperMutation.mutate({
      ...data,
      userId: user?.id,
    });
  };

  const onEditSubmit = (data: ReadyCopperFormValues) => {
    if (selectedCopper) {
      updateReadyCopperMutation.mutate({
        id: selectedCopper.id,
        data,
      });
    }
  };

  // Filter ready coppers based on search and status
  const filteredCoppers = readyCoppers
    ? readyCoppers.filter((copper) => {
        const matchesSearch =
          searchTerm === "" ||
          copper.wireSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
          copper.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "" || copper.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Sort by ready date (newest first)
  const sortedCoppers = [...filteredCoppers].sort(
    (a, b) => new Date(b.readyDate).getTime() - new Date(a.readyDate).getTime()
  );

  const columns = [
    {
      header: "ID",
      accessorKey: (row: ReadyCopper) => `RC-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Draw Process",
      accessorKey: (row: ReadyCopper) => `DP-${row.drawProcessId.toString().padStart(4, "0")}`,
    },
    {
      header: "Wire Size",
      accessorKey: "wireSize",
    },
    {
      header: "Quantity",
      accessorKey: (row: ReadyCopper) => `${Number(row.quantity).toLocaleString()} kg`,
    },
    {
      header: "Date",
      accessorKey: "readyDate",
      cell: (row: ReadyCopper) => format(new Date(row.readyDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: ReadyCopper) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      accessorKey: (row: ReadyCopper) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedCopper(row);
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
        <WorkflowStages currentStage={4} />

        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Ready Copper</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage ready copper inventory for production
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-lg font-sans">Ready Copper Records</CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ready Copper
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Ready Copper</DialogTitle>
                </DialogHeader>
                <Form {...createForm}>
                  <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                    <FormField
                      control={createForm.control}
                      name="drawProcessId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Draw Process</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select draw process" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isDrawProcessesLoading ? (
                                <SelectItem value="loading" disabled>
                                  Loading draw processes...
                                </SelectItem>
                              ) : drawProcesses && drawProcesses.length > 0 ? (
                                drawProcesses
                                  .filter(process => process.status === "completed")
                                  .map((process) => (
                                    <SelectItem key={process.id} value={process.id.toString()}>
                                      DP-{process.id} ({process.wireSize}, {process.outputQuantity} kg)
                                    </SelectItem>
                                  ))
                              ) : (
                                <SelectItem value="empty" disabled>
                                  No completed draw processes available
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
                      name="wireSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wire Size</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter wire size (e.g. 1.5mm)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter quantity"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
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
                        disabled={createReadyCopperMutation.isPending}
                      >
                        {createReadyCopperMutation.isPending && (
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
                  placeholder="Search ready copper..."
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
                    <SelectItem value="all">All Statuses</SelectItem>
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
              data={sortedCoppers}
              isLoading={isReadyCoppersLoading}
            />
          </CardContent>
        </Card>

        {/* Edit Ready Copper Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Ready Copper</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="drawProcessId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Draw Process</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select draw process" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isDrawProcessesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading draw processes...
                            </SelectItem>
                          ) : drawProcesses && drawProcesses.length > 0 ? (
                            drawProcesses
                              .filter(process => process.status === "completed")
                              .map((process) => (
                                <SelectItem key={process.id} value={process.id.toString()}>
                                  DP-{process.id} ({process.wireSize}, {process.outputQuantity} kg)
                                </SelectItem>
                              ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              No completed draw processes available
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
                  name="wireSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wire Size</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter wire size (e.g. 1.5mm)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter quantity"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
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
                    disabled={updateReadyCopperMutation.isPending}
                  >
                    {updateReadyCopperMutation.isPending && (
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

export default ReadyCopperPage;