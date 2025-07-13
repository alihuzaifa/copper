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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";
import WorkflowStages from "@/components/layout/workflow-stages";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

// API Types
interface ReadyCopperItem {
  _id: string;
  newName: string;
  quantity: number;
  originalReadyCopperId?: {
    vendorId: {
      name: string;
      phoneNumber: string;
    };
  };
}

interface PVCItem {
  _id: string;
  pvcColor: string;
  quantity: number;
  pricePerUnit: number;
  supplierId?: {
    name: string;
    phoneNumber: string;
  };
}

interface ProductionRecord {
  _id: string;
  readyCopperInputs: Array<{
    readyCopperId: string;
    wireSize: string;
    quantity: number;
  }>;
  pvcInputs: Array<{
    pvcId: string;
    pvcColor: string;
    quantity: number;
  }>;
  output: {
    materialName: string;
    quantity: number;
    mazdoori: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    name: string;
  };
  updatedBy?: {
    name: string;
  };
  deletedBy?: {
    name: string;
  };
  history: Array<{
    _id: string;
    action: string;
    date: string;
    actionBy: string;
    details: any;
    notes: string;
  }>;
}

// API Response Types
interface GetReadyCopperResponse {
  success: boolean;
  data: ReadyCopperItem[];
}

interface GetPVCResponse {
  success: boolean;
  data: PVCItem[];
}

interface GetProductionsResponse {
  success: boolean;
  data: ProductionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Zod schemas
const readyCopperInputSchema = z.object({
  readyCopperId: z.string().min(1, "Select Ready Copper"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
});
const pvcInputSchema = z.object({
  pvcId: z.string().min(1, "Select PVC"),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
});
const outputSchema = z.object({
  materialName: z.string().min(1, "Enter output material name"),
  quantity: z.coerce.number().positive("Enter output quantity"),
  mazdoori: z.coerce.number().positive("Enter Mazdoori"),
});

interface ReadyCopperInput {
  readyCopperId: string;
  wireSize: string;
  quantity: number;
}
interface PVCInput {
  pvcId: string;
  pvcColor: string;
  quantity: number;
}
interface Output {
  materialName: string;
  quantity: number;
  mazdoori: number;
}
interface ProductionRecord {
  id: number;
  readyCopperInputs: ReadyCopperInput[];
  pvcInputs: PVCInput[];
  output: Output;
  date: string;
}
interface ProductionHistory {
  productionId: string;
  action: "add" | "delete";
  actionDate: string;
  details: any;
}

const ProductionPage = () => {
  const { toast } = useToast();
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  const [readyCopperItems, setReadyCopperItems] = useState<ReadyCopperItem[]>([]);
  const [pvcItems, setPVCItems] = useState<PVCItem[]>([]);
  const [productions, setProductions] = useState<ProductionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [productionsLoading, setProductionsLoading] = useState(false);
  
  // State for input lists
  const [readyCopperInputs, setReadyCopperInputs] = useState<
    ReadyCopperInput[]
  >([]);
  const [pvcInputs, setPVCInputs] = useState<PVCInput[]>([]);
  // Dialogs
  const [outputDialogOpen, setOutputDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyDialogId, setHistoryDialogId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Ready Copper form
  const {
    control: rcControl,
    handleSubmit: handleRCSubmit,
    reset: resetRC,
    formState: { errors: rcErrors },
  } = useForm({
    resolver: zodResolver(readyCopperInputSchema),
    defaultValues: { readyCopperId: "", quantity: "" },
  });
  // PVC form
  const {
    control: pvcControl,
    handleSubmit: handlePVCSubmit,
    reset: resetPVC,
    formState: { errors: pvcErrors },
  } = useForm({
    resolver: zodResolver(pvcInputSchema),
    defaultValues: { pvcId: "", quantity: "" },
  });
  // Output form
  const {
    control: outputControl,
    handleSubmit: handleOutputSubmit,
    reset: resetOutput,
    formState: { errors: outputErrors },
  } = useForm({
    resolver: zodResolver(outputSchema),
    defaultValues: { materialName: "", quantity: "", mazdoori: "" },
  });

  // Fetch production records
  const fetchProductions = async () => {
    try {
      setProductionsLoading(true);
      const response = await request<void, GetProductionsResponse>({
        url: '/productions',
        method: 'GET'
      });

      if (response.success) {
        setProductions(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching production records:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch production records",
        variant: "destructive",
      });
    } finally {
      setProductionsLoading(false);
    }
  };

  // Fetch available ready copper items
  const fetchReadyCopperItems = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetReadyCopperResponse>({
        url: '/productions/ready-copper/available',
        method: 'GET'
      });

      if (response.success) {
        setReadyCopperItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching ready copper items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ready copper items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available PVC items
  const fetchPVCItems = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetPVCResponse>({
        url: '/productions/pvc/available',
        method: 'GET'
      });

      if (response.success) {
        setPVCItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching PVC items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch PVC items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add Ready Copper input
  const onAddRC = (data: any) => {
    const rc = readyCopperItems.find(
      (r) => r._id === data.readyCopperId
    );
    if (!rc) return;
    
    // Check if quantity is available
    if (data.quantity > rc.quantity) {
      toast({
        title: "Error",
        description: `Cannot add more than available quantity. Available: ${rc.quantity} kg`,
        variant: "destructive",
      });
      return;
    }
    
    setReadyCopperInputs((prev) => [
      ...prev,
      {
        readyCopperId: rc._id,
        wireSize: rc.newName,
        quantity: Number(data.quantity),
      },
    ]);

    // Update local state to subtract the quantity
    setReadyCopperItems((prev) =>
      prev.map((item) =>
        item._id === rc._id
          ? { ...item, quantity: item.quantity - Number(data.quantity) }
          : item
      )
    );
    
    resetRC();
  };
  // Remove RC input
  const onRemoveRC = (idx: number) => {
    const removedItem = readyCopperInputs[idx];
    setReadyCopperInputs((prev) => prev.filter((_, i) => i !== idx));

    // Restore the quantity back to available items
    setReadyCopperItems((prev) =>
      prev.map((item) =>
        item._id === removedItem.readyCopperId
          ? { ...item, quantity: item.quantity + removedItem.quantity }
          : item
      )
    );
  };
  // Add PVC input
  const onAddPVC = (data: any) => {
    const pvc = pvcItems.find((p) => p._id === data.pvcId);
    if (!pvc) return;
    
    // Check if quantity is available
    if (data.quantity > pvc.quantity) {
      toast({
        title: "Error",
        description: `Cannot add more than available quantity. Available: ${pvc.quantity} kg`,
        variant: "destructive",
      });
      return;
    }
    
    setPVCInputs((prev) => [
      ...prev,
      {
        pvcId: pvc._id,
        pvcColor: pvc.pvcColor,
        quantity: Number(data.quantity),
      },
    ]);

    // Update local state to subtract the quantity
    setPVCItems((prev) =>
      prev.map((item) =>
        item._id === pvc._id
          ? { ...item, quantity: item.quantity - Number(data.quantity) }
          : item
      )
    );
    
    resetPVC();
  };
  // Remove PVC input
  const onRemovePVC = (idx: number) => {
    const removedItem = pvcInputs[idx];
    setPVCInputs((prev) => prev.filter((_, i) => i !== idx));

    // Restore the quantity back to available items
    setPVCItems((prev) =>
      prev.map((item) =>
        item._id === removedItem.pvcId
          ? { ...item, quantity: item.quantity + removedItem.quantity }
          : item
      )
    );
  };

  // Finalize production
  const onFinalize = async (data: any) => {
    if (readyCopperInputs.length === 0 && pvcInputs.length === 0) return;
    
    try {
      setLoading(true);
      
      const response = await request<any, any>({
        url: '/productions',
        method: 'POST',
        data: {
          readyCopperInputs: readyCopperInputs.map(input => ({
            readyCopperId: input.readyCopperId,
            quantity: input.quantity
          })),
          pvcInputs: pvcInputs.map(input => ({
            pvcId: input.pvcId,
            quantity: input.quantity
          })),
          output: {
            materialName: data.materialName,
            quantity: Number(data.quantity),
            mazdoori: Number(data.mazdoori),
          },
          notes: `Production created with output: ${data.materialName} - ${data.quantity} kg`
        }
      });

      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Production created successfully",
        });
        
        // Reset all inputs
        setReadyCopperInputs([]);
        setPVCInputs([]);
        resetOutput();
        setOutputDialogOpen(false);
        
        // Refresh the available items to get updated quantities
        await fetchReadyCopperItems();
        await fetchPVCItems();
        
        // Refresh the production list
        await fetchProductions();
      }
    } catch (error: any) {
      console.error('Error creating production:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create production",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete production
  const onDelete = () => {
    if (deleteId == null) return;
    setProductions((prev) => prev.filter((p) => p._id !== deleteId));
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Per-row history
  const openHistory = (id: string) => {
    setHistoryDialogId(id);
    setHistoryDialogOpen(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchReadyCopperItems();
    fetchPVCItems();
    fetchProductions();
  }, []);

  return (
    <>
      <Helmet>
        <title>{softwareName} | Production</title>
        <meta name="description" content="Manage production for your copper wire manufacturing workflow." />
      </Helmet>
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
            <CardHeader>
              <CardTitle className="text-lg font-sans">Add Inputs</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Ready Copper Input */}
              <div className="mb-6">
                <h2 className="font-semibold mb-3">Ready Copper</h2>
                <form
                  onSubmit={handleRCSubmit(onAddRC)}
                  className="flex gap-2 items-end mb-3"
                >
                  <Controller
                    name="readyCopperId"
                    control={rcControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select Ready Copper" />
                        </SelectTrigger>
                        <SelectContent>
                          {readyCopperItems.map((rc) => (
                            <SelectItem key={rc._id} value={rc._id}>
                              {rc.newName} (Available: {rc.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name="quantity"
                    control={rcControl}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Quantity"
                        {...field}
                        className="w-32"
                      />
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add
                  </Button>
                </form>
                {rcErrors.readyCopperId && (
                  <div className="text-red-600 text-xs mb-2">
                    {rcErrors.readyCopperId.message as string}
                  </div>
                )}
                {rcErrors.quantity && (
                  <div className="text-red-600 text-xs mb-2">
                    {rcErrors.quantity.message as string}
                  </div>
                )}
                
                {/* Ready Copper Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Wire Size
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity (kg)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {readyCopperInputs.map((rc, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2">{rc.wireSize}</td>
                          <td className="px-4 py-2">{rc.quantity}</td>
                          <td className="px-4 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemoveRC(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {readyCopperInputs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No ready copper inputs added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PVC Input */}
              <div className="mb-6">
                <h2 className="font-semibold mb-3">PVC</h2>
                <form
                  onSubmit={handlePVCSubmit(onAddPVC)}
                  className="flex gap-2 items-end mb-3"
                >
                  <Controller
                    name="pvcId"
                    control={pvcControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select PVC" />
                        </SelectTrigger>
                        <SelectContent>
                          {pvcItems.map((pvc) => (
                            <SelectItem key={pvc._id} value={pvc._id}>
                              {pvc.pvcColor} (Available: {pvc.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Controller
                    name="quantity"
                    control={pvcControl}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="Quantity"
                        {...field}
                        className="w-32"
                      />
                    )}
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add
                  </Button>
                </form>
                {pvcErrors.pvcId && (
                  <div className="text-red-600 text-xs mb-2">
                    {pvcErrors.pvcId.message as string}
                  </div>
                )}
                {pvcErrors.quantity && (
                  <div className="text-red-600 text-xs mb-2">
                    {pvcErrors.quantity.message as string}
                  </div>
                )}
                
                {/* PVC Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          PVC Color
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity (kg)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pvcInputs.map((pvc, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2">{pvc.pvcColor}</td>
                          <td className="px-4 py-2">{pvc.quantity}</td>
                          <td className="px-4 py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onRemovePVC(idx)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {pvcInputs.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                            No PVC inputs added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Finalize Section */}
              <div className="flex justify-end">
                <Button
                  onClick={() => setOutputDialogOpen(true)}
                  disabled={
                    readyCopperInputs.length === 0 || pvcInputs.length === 0
                  }
                >
                  Finalize Production
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Output Dialog */}
          <Dialog open={outputDialogOpen} onOpenChange={setOutputDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Output Details</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleOutputSubmit(onFinalize)}
                className="space-y-4"
              >
                <Controller
                  name="materialName"
                  control={outputControl}
                  render={({ field }) => (
                    <Input placeholder="Output Material Name" {...field} />
                  )}
                />
                {outputErrors.materialName && (
                  <div className="text-red-600 text-xs">
                    {outputErrors.materialName.message as string}
                  </div>
                )}
                <Controller
                  name="quantity"
                  control={outputControl}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Output Quantity"
                      {...field}
                    />
                  )}
                />
                {outputErrors.quantity && (
                  <div className="text-red-600 text-xs">
                    {outputErrors.quantity.message as string}
                  </div>
                )}
                <Controller
                  name="mazdoori"
                  control={outputControl}
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="Mazdoori (PKR)"
                      {...field}
                    />
                  )}
                />
                {outputErrors.mazdoori && (
                  <div className="text-red-600 text-xs">
                    {outputErrors.mazdoori.message as string}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOutputDialogOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Production
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          {/* Productions Table */}
          <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-sans">
                Production Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading production records...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Inputs
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Output
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Mazdoori
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          History
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Delete
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {productions.map((prod) => (
                        <tr
                          key={prod._id}
                          className="border-b border-gray-200 dark:border-gray-700"
                        >
                          <td className="px-4 py-2">
                            PRD-{prod._id.toString().slice(-4)}
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <b>Ready Copper:</b>
                              <ul>
                                {prod.readyCopperInputs.map((rc, idx) => (
                                  <li key={idx}>
                                    {rc.wireSize} - {rc.quantity} kg
                                  </li>
                                ))}
                              </ul>
                              <b>PVC:</b>
                              <ul>
                                {prod.pvcInputs.map((pvc, idx) => (
                                  <li key={idx}>
                                    {pvc.pvcColor} - {pvc.quantity} kg
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {prod.output.materialName} - {prod.output.quantity} kg
                          </td>
                          <td className="px-4 py-2">{prod.output.mazdoori} PKR</td>
                          <td className="px-4 py-2">
                            {dayjs(prod.createdAt).format("YYYY-MM-DD HH:mm")}
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => openHistory(prod._id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                setDeleteId(prod._id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {productions.length === 0 && !productionsLoading && (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 text-gray-500 dark:text-gray-400"
                          >
                            No production records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Delete Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Production</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>Are you sure you want to delete this production record?</div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={onDelete}>
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          {/* History Dialog */}
          <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>History</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date/Time
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {productions
                      .filter((p) => p._id === historyDialogId)
                      .map((prod) =>
                        prod.history.map((h: any) => (
                          <tr
                            key={h._id}
                            className="border-b border-gray-200 dark:border-gray-700"
                          >
                            <td className="px-4 py-2">
                              <span
                                className={
                                  h.action === "add"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {h.action === "add" ? "Add" : "Delete"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {dayjs(h.date).format("YYYY-MM-DD HH:mm:ss")}
                            </td>
                            <td className="px-4 py-2">
                              {h.notes}
                            </td>
                          </tr>
                        ))
                      )}
                    {!productions.some((p) => p._id === historyDialogId) && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center py-4 text-gray-500 dark:text-gray-400"
                        >
                          No history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </>
  );
};

export default ProductionPage;
