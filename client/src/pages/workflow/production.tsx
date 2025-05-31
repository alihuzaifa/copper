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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dayjs from "dayjs";

// Dummy data for dropdowns
const dummyReadyCopper = [
  { id: 1, wireSize: "1.5mm", quantity: 100 },
  { id: 2, wireSize: "2.5mm", quantity: 80 },
  { id: 3, wireSize: "4mm", quantity: 60 },
];
const dummyPVC = [
  { id: 1, pvcColor: "Red", quantity: 50 },
  { id: 2, pvcColor: "Blue", quantity: 40 },
  { id: 3, pvcColor: "Green", quantity: 30 },
];

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
  readyCopperId: number;
  wireSize: string;
  quantity: number;
}
interface PVCInput {
  pvcId: number;
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
  productionId: number;
  action: "add" | "delete";
  actionDate: string;
  details: any;
}

const ProductionPage = () => {
  // State for input lists
  const [readyCopperInputs, setReadyCopperInputs] = useState<ReadyCopperInput[]>([]);
  const [pvcInputs, setPVCInputs] = useState<PVCInput[]>([]);
  const [productions, setProductions] = useState<ProductionRecord[]>([]);
  const [history, setHistory] = useState<ProductionHistory[]>([]);
  // Dialogs
  const [outputDialogOpen, setOutputDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyDialogId, setHistoryDialogId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  // Add Ready Copper input
  const onAddRC = (data: any) => {
    const rc = dummyReadyCopper.find((r) => r.id === parseInt(data.readyCopperId));
    if (!rc) return;
    setReadyCopperInputs((prev) => [
      ...prev,
      {
        readyCopperId: rc.id,
        wireSize: rc.wireSize,
        quantity: Number(data.quantity),
      },
    ]);
    resetRC();
  };
  // Remove RC input
  const onRemoveRC = (idx: number) => {
    setReadyCopperInputs((prev) => prev.filter((_, i) => i !== idx));
  };
  // Add PVC input
  const onAddPVC = (data: any) => {
    const pvc = dummyPVC.find((p) => p.id === parseInt(data.pvcId));
    if (!pvc) return;
    setPVCInputs((prev) => [
      ...prev,
      {
        pvcId: pvc.id,
        pvcColor: pvc.pvcColor,
        quantity: Number(data.quantity),
      },
    ]);
    resetPVC();
  };
  // Remove PVC input
  const onRemovePVC = (idx: number) => {
    setPVCInputs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Finalize production
  const onFinalize = (data: any) => {
    if (readyCopperInputs.length === 0 && pvcInputs.length === 0) return;
    const newId = Date.now();
    const record: ProductionRecord = {
      id: newId,
      readyCopperInputs: [...readyCopperInputs],
      pvcInputs: [...pvcInputs],
      output: {
        materialName: data.materialName,
        quantity: Number(data.quantity),
        mazdoori: Number(data.mazdoori),
      },
      date: new Date().toISOString(),
    };
    setProductions((prev) => [record, ...prev]);
    setHistory((prev) => [
      ...prev,
      {
        productionId: newId,
        action: "add",
        actionDate: new Date().toISOString(),
        details: record,
      },
    ]);
    setReadyCopperInputs([]);
    setPVCInputs([]);
    resetOutput();
    setOutputDialogOpen(false);
  };

  // Delete production
  const onDelete = () => {
    if (deleteId == null) return;
    const deleted = productions.find((p) => p.id === deleteId);
    setProductions((prev) => prev.filter((p) => p.id !== deleteId));
    setHistory((prev) => [
      ...prev,
      {
        productionId: deleteId,
        action: "delete",
        actionDate: new Date().toISOString(),
        details: deleted,
      },
    ]);
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Per-row history
  const openHistory = (id: number) => {
    setHistoryDialogId(id);
    setHistoryDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
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
            <div className="mb-4">
              <h2 className="font-semibold mb-2">Ready Copper</h2>
              <form
                onSubmit={handleRCSubmit(onAddRC)}
                className="flex gap-2 items-end"
              >
                <Controller
                  name="readyCopperId"
                  control={rcControl}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select Ready Copper" />
                      </SelectTrigger>
                      <SelectContent>
                        {dummyReadyCopper.map((rc) => (
                          <SelectItem key={rc.id} value={rc.id.toString()}>
                            {rc.wireSize} (Available: {rc.quantity})
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
                <Button type="submit">Add</Button>
              </form>
              {rcErrors.readyCopperId && (
                <div className="text-red-600 text-xs mt-1">{rcErrors.readyCopperId.message as string}</div>
              )}
              {rcErrors.quantity && (
                <div className="text-red-600 text-xs mt-1">{rcErrors.quantity.message as string}</div>
              )}
              <ul className="mt-2">
                {readyCopperInputs.map((rc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>
                      {rc.wireSize} - {rc.quantity} kg
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveRC(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            {/* PVC Input */}
            <div className="mb-4">
              <h2 className="font-semibold mb-2">PVC</h2>
              <form
                onSubmit={handlePVCSubmit(onAddPVC)}
                className="flex gap-2 items-end"
              >
                <Controller
                  name="pvcId"
                  control={pvcControl}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select PVC" />
                      </SelectTrigger>
                      <SelectContent>
                        {dummyPVC.map((pvc) => (
                          <SelectItem key={pvc.id} value={pvc.id.toString()}>
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
                <Button type="submit">Add</Button>
              </form>
              {pvcErrors.pvcId && (
                <div className="text-red-600 text-xs mt-1">{pvcErrors.pvcId.message as string}</div>
              )}
              {pvcErrors.quantity && (
                <div className="text-red-600 text-xs mt-1">{pvcErrors.quantity.message as string}</div>
              )}
              <ul className="mt-2">
                {pvcInputs.map((pvc, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>
                      {pvc.pvcColor} - {pvc.quantity} kg
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemovePVC(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Finalize Section */}
            <div className="flex justify-end">
              <Button
                onClick={() => setOutputDialogOpen(true)}
                disabled={readyCopperInputs.length === 0 && pvcInputs.length === 0}
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
            <form onSubmit={handleOutputSubmit(onFinalize)} className="space-y-4">
              <Controller
                name="materialName"
                control={outputControl}
                render={({ field }) => (
                  <Input placeholder="Output Material Name" {...field} />
                )}
              />
              {outputErrors.materialName && (
                <div className="text-red-600 text-xs">{outputErrors.materialName.message as string}</div>
              )}
              <Controller
                name="quantity"
                control={outputControl}
                render={({ field }) => (
                  <Input type="number" placeholder="Output Quantity" {...field} />
                )}
              />
              {outputErrors.quantity && (
                <div className="text-red-600 text-xs">{outputErrors.quantity.message as string}</div>
              )}
              <Controller
                name="mazdoori"
                control={outputControl}
                render={({ field }) => (
                  <Input type="number" placeholder="Mazdoori (PKR)" {...field} />
                )}
              />
              {outputErrors.mazdoori && (
                <div className="text-red-600 text-xs">{outputErrors.mazdoori.message as string}</div>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOutputDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Production</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Productions Table */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-sans">Production Records</CardTitle>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} disabled={productions.length === 0}>
              Delete Production
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Inputs</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Output</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mazdoori</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.map((prod) => (
                    <tr key={prod.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">PRD-{prod.id.toString().slice(-4)}</td>
                      <td className="px-4 py-2">
                        <div>
                          <b>Ready Copper:</b>
                          <ul>
                            {prod.readyCopperInputs.map((rc, idx) => (
                              <li key={idx}>{rc.wireSize} - {rc.quantity} kg</li>
                            ))}
                          </ul>
                          <b>PVC:</b>
                          <ul>
                            {prod.pvcInputs.map((pvc, idx) => (
                              <li key={idx}>{pvc.pvcColor} - {pvc.quantity} kg</li>
                            ))}
                          </ul>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        {prod.output.materialName} - {prod.output.quantity} kg
                      </td>
                      <td className="px-4 py-2">{prod.output.mazdoori} PKR</td>
                      <td className="px-4 py-2">{dayjs(prod.date).format("YYYY-MM-DD HH:mm")}</td>
                      <td className="px-4 py-2">
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => openHistory(prod.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                      <td className="px-4 py-2">
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => { setDeleteId(prod.id); setDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {productions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No production records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.filter((h) => h.productionId === historyDialogId).length === 0 && (
                    <tr>
                      <td colSpan={2} className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No history yet.
                      </td>
                    </tr>
                  )}
                  {history
                    .filter((h) => h.productionId === historyDialogId)
                    .map((h, idx) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">
                          <span className={h.action === "add" ? "text-green-600" : "text-red-600"}>
                            {h.action === "add" ? "Add" : "Delete"}
                          </span>
                        </td>
                        <td className="px-4 py-2">{dayjs(h.actionDate).format("YYYY-MM-DD HH:mm:ss")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductionPage;
