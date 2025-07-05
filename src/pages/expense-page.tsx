import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import moment from 'moment';

// Types
export type NewExpense = {
  expenseName: string;
  amount: number;
  date: Date;
};

export type Expense = {
  id: string;
  expenseName: string;
  amount: number;
  date: Date;
};

interface ApiExpense {
  _id: string;
  expenseName: string;
  amount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseResponse {
  success: boolean;
  message: string;
  data: {
    expense: ApiExpense;
  };
}

interface ExpensesResponse {
  success: boolean;
  message: string;
  data: {
    expenses: ApiExpense[];
  };
}

const expenseSchema = z.object({
  expenseName: z.string().min(1, "Expense name is required"),
  amount: z
    .string()
    .min(1, "Expense amount is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Amount must be a positive number",
    }),
  date: z.date(),
});

// Form types
type ExpenseFormData = {
  expenseName: string;
  amount: string;  // amount is string in form, converted to number on submit
  date: Date;
};

function ExpenseForm({ onSubmit, onCancel, defaultDate, defaultValues }: {
  onSubmit: (data: NewExpense) => void;
  onCancel: () => void;
  defaultDate: Date;
  defaultValues?: Expense;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, touchedFields },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ? {
      expenseName: defaultValues.expenseName,
      amount: defaultValues.amount.toString(),
      date: defaultValues.date,
    } : {
      expenseName: "",
      amount: "",
      date: defaultDate,
    },
    mode: "onTouched",
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          expenseName: data.expenseName,
          amount: Number(data.amount),
          date: data.date,
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block mb-1 font-medium">Expense Name</label>
        <input
          {...register("expenseName")}
          placeholder="Enter expense name"
          className={
            `border px-3 py-2 rounded-md outline-none w-full ${touchedFields.expenseName && errors.expenseName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} text-black`}
        />
        {touchedFields.expenseName && errors.expenseName && (
          <div className="text-red-600 text-xs mt-1">{errors.expenseName.message as string}</div>
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
        <Button type="submit">
          {defaultValues ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}

const ExpensePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | undefined>(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await request<void, ExpensesResponse>({
        url: '/expenses',
        method: 'GET'
      });

      const transformedExpenses = response.data.expenses.map((apiExp): Expense => ({
        id: apiExp._id,
        expenseName: apiExp.expenseName,
        amount: apiExp.amount,
        date: moment(apiExp.date, 'YYYY-MM-DD').toDate()
      })) || [];

      setExpenses(transformedExpenses);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch expenses",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Edit logic
  const handleEdit = (expense: Expense) => {
    setEditExpense(expense);
    setFormOpen(true);
    setModalOpen(false);
  };

  // Delete logic
  const handleDelete = async (expense: Expense) => {
    try {
      const response = await request<void, { success: boolean; message: string }>({
        url: `/expenses/${expense.id}`,
        method: 'DELETE'
      });

      toast({
        title: "Success",
        description: response.message || "Expense deleted successfully",
      });

      setModalOpen(false);
      fetchExpenses(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete expense",
      });
    }
  };

  // Save logic for add/edit
  const handleSave = async (data: NewExpense) => {
    try {
      const formattedData = {
        expenseName: data.expenseName,
        amount: data.amount,
        date: moment(data.date).format('YYYY-MM-DD')
      };

      if (editExpense) {
        const response = await request<typeof formattedData, ExpenseResponse>({
          url: `/expenses/${editExpense.id}`,
          method: 'PUT',
          data: formattedData
        });

        toast({
          title: "Success",
          description: response.message || "Expense updated successfully",
        });
      } else {
        const response = await request<typeof formattedData, ExpenseResponse>({
          url: '/expenses',
          method: 'POST',
          data: formattedData
        });

        toast({
          title: "Success",
          description: response.message || "Expense created successfully",
        });
      }

      setFormOpen(false);
      setEditExpense(undefined);
      fetchExpenses(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save expense",
      });
    }
  };

  // Group expenses by date (ISO string)
  const grouped = expenses.reduce((acc: Record<string, Expense[]>, exp) => {
    const dateKey = exp.date.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(exp);
    return acc;
  }, {});

  const today = new Date();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

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
              {/* Grand Total Section */}
              {Object.keys(grouped).length > 0 && (
                <div className="flex justify-end mt-4 pr-4">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Grand Total: </span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {Object.values(grouped).reduce((total, expenses) => {
                        const expensesArr = expenses as Expense[];
                        return total + expensesArr.reduce((sum, e) => sum + e.amount, 0);
                      }, 0)}
                    </span>
                  </div>
                </div>
              )}
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
                      <td className="px-4 py-2">{exp.expenseName}</td>
                      <td className="px-4 py-2">{exp.amount}</td>
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
                  <span className="font-semibold">Total: {((grouped[viewDate.toISOString().split("T")[0]] as Expense[])?.reduce((sum, e) => sum + e.amount, 0) || 0)}</span>
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