import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Calendar } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

// Transaction interface (since shared schema is removed)
interface Transaction {
  id: string | number;
  transactionType: string;
  description: string;
  quantity?: number;
  amount?: number;
  transactionDate: string;
}

const TransactionHistory = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [API_ENDPOINTS.transactions],
  });

  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);

  // Filter transactions based on search, type, and date
  const filteredTransactions = transactions
    ? transactions.filter((transaction) => {
        const matchesSearch =
          searchTerm === "" ||
          transaction.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType =
          typeFilter === "" || transaction.transactionType === typeFilter;

        const matchesDate =
          dateFilter === "" ||
          (dateFilter === "today"
            ? new Date(transaction.transactionDate).toDateString() === new Date().toDateString()
            : dateFilter === "week"
            ? new Date(transaction.transactionDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            : dateFilter === "month"
            ? new Date(transaction.transactionDate) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            : true);

        return matchesSearch && matchesType && matchesDate;
      })
    : [];

  // Sort by transaction date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  );

  // Apply pagination
  const paginatedTransactions = sortedTransactions.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE
  );

  const columns = [
    {
      header: "ID",
      accessorKey: (row: Transaction) => `TRX-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Type",
      accessorKey: "transactionType" as keyof Transaction,
      cell: (row: Transaction) => <StatusBadge status={row.transactionType} />,
    },
    {
      header: "Description",
      accessorKey: "description" as keyof Transaction,
    },
    {
      header: "Quantity",
      accessorKey: "quantity" as keyof Transaction,
      cell: (row: Transaction) => (row.quantity ? Number(row.quantity).toLocaleString() : "N/A"),
    },
    {
      header: "Amount",
      accessorKey: "amount" as keyof Transaction,
      cell: (row: Transaction) =>
        row.amount ? `₹${Number(row.amount).toLocaleString("en-IN")}` : "N/A",
    },
    {
      header: "Date",
      accessorKey: "transactionDate" as keyof Transaction,
      cell: (row: Transaction) => format(new Date(row.transactionDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: (row: Transaction) => {
        const status =
          row.transactionType === "purchase"
            ? "completed"
            : row.transactionType === "process"
            ? "in_progress"
            : "completed";
        return <StatusBadge status={status} />;
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>{softwareName} | Transaction History</title>
        <meta name="description" content="View all transaction history for your copper wire manufacturing management." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold font-sans">Transaction History</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              View and filter all transaction records
            </p>
          </div>

          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <CardTitle className="font-sans text-lg">All Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Search and filter controls */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_types">All Types</SelectItem>
                      <SelectItem value="purchase">Purchase</SelectItem>
                      <SelectItem value="process">Process</SelectItem>
                      <SelectItem value="verify">Verify</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_time">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Transactions table */}
              <DataTable
                columns={columns}
                data={paginatedTransactions}
                isLoading={isLoading}
                pageSize={DEFAULT_PAGE_SIZE}
                totalItems={filteredTransactions.length}
                currentPage={page}
                onPageChange={setPage}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default TransactionHistory;
