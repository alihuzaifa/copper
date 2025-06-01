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
import { Calendar } from "@/components/ui/calendar";
import { Eye, Plus } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Define a local Expense type
export type Expense = {
  name: string;
  amount: number;
  date: Date;
};

const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  amount: z
    .string()
    .min(1, "Expense amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  date: z.date(),
});

function ExpenseForm({ onSubmit, onCancel, defaultDate, defaultValues }: {
  onSubmit: (data: Expense) => void;
  onCancel: () => void;
  defaultDate: Date;
  defaultValues?: Expense;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ? {
      name: defaultValues.name,
      amount: defaultValues.amount.toString(),
      date: defaultValues.date,
    } : {
      name: "",
      amount: "",
      date: defaultDate,
    },
    mode: "onTouched",
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          name: data.name,
          amount: Number(data.amount),
          date: data.date,
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1 font-medium">Expense Name</label>
        <input
          {...register("name")}
          placeholder="Enter expense name"
          className={
            `border px-3 py-2 rounded-md outline-none w-full ${touchedFields.name && errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-black`}
        />
        {touchedFields.name && errors.name && (
          <div className="text-red-600 text-xs mt-1">{errors.name.message as string}</div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Expense Amount</label>
        <input
          {...register("amount")}
          placeholder="Enter amount"
          className={
            `border px-3 py-2 rounded-md outline-none w-full ${touchedFields.amount && errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-black bg-white`}
          type="number"
          min="0"
        />
        {touchedFields.amount && errors.amount && (
          <div className="text-red-600 text-xs mt-1">{errors.amount.message as string}</div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-medium">Date</label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <input
              type="date"
              className={
                `border px-3 py-2 rounded-md outline-none w-full ${touchedFields.date && errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-black bg-white`
              }
              max={new Date().toISOString().split('T')[0]}
              value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
              onChange={e => field.onChange(new Date(e.target.value))}
            />
          )}
        />
        {touchedFields.date && errors.date && (
          <div className="text-red-600 text-xs mt-1">{errors.date.message as string}</div>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Expense</Button>
      </div>
    </form>
  );
}

const ExpensePage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>(undefined);

  // Group expenses by date (ISO string)
  const grouped = expenses.reduce((acc: Record<string, Expense[]>, exp) => {
    const dateKey = exp.date.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(exp);
    return acc;
  }, {});

  const today = new Date();

  // Edit logic
  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setFormOpen(true);
    setModalOpen(false);
  };

  // Delete logic
  const handleDelete = (expense: Expense) => {
    setExpenses((prev) => prev.filter((e) => e !== expense));
  };

  // Save logic for add/edit
  const handleSave = (data: Expense) => {
    if (editExpense) {
      setExpenses((prev) => prev.map((e) => (e === editExpense ? data : e)));
      setEditExpense(undefined);
    } else {
      setExpenses((prev) => [...prev, data]);
    }
    setFormOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold font-sans">Expense Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Add, view, and manage your expenses
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-sans">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(grouped).length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No expenses found.
                      </td>
                    </tr>
                  )}
                  {Object.entries(grouped).map(([date, exps]) => {
                    const expensesArr = exps as Expense[];
                    return (
                      <tr key={date} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">{date}</td>
                        <td className="px-4 py-2">{expensesArr.reduce((sum, e) => sum + e.amount, 0)}</td>
                        <td className="px-4 py-2">
                          <Button variant="ghost" onClick={() => { setViewDate(new Date(date)); setModalOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Add/Edit Expense Dialog */}
        <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditExpense(undefined); }}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto scrollbar-none">
            <DialogHeader>
              <DialogTitle>{editExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleSave}
              onCancel={() => { setFormOpen(false); setEditExpense(undefined); }}
              defaultDate={editExpense?.date || today}
              defaultValues={editExpense}
            />
          </DialogContent>
        </Dialog>
        {/* View Expenses Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Expenses for {viewDate && viewDate.toISOString().split("T")[0]}</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {viewDate && (grouped[viewDate.toISOString().split("T")[0]] as Expense[])?.map((exp: Expense, idx: number) => (
                    <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2">{exp.name}</td>
                      <td className="px-4 py-2">{typeof exp.amount === 'number' ? exp.amount : Number(exp.amount)}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(exp)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Total row */}
              {viewDate && (
                <div className="flex justify-end mt-2">
                  <span className="font-semibold">Total: {((grouped[viewDate.toISOString().split("T")[0]] as Expense[])?.reduce((sum, e) => sum + (typeof e.amount === 'number' ? e.amount : Number(e.amount)), 0) || 0)}</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ExpensePage; 