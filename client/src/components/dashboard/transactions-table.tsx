import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { DataTable } from "@/components/ui/data-table";
import StatusBadge from "@/components/ui/status-badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const TransactionsTable = () => {
  const [page, setPage] = useState(1);
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [API_ENDPOINTS.transactions],
  });
  
  // Calculate paginated subset of transactions
  const paginatedTransactions = transactions
    ? transactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE)
    : [];
  
  const totalTransactions = transactions?.length || 0;
  
  const columns = [
    {
      header: "ID",
      accessorKey: (row: Transaction) => `TRX-${row.id.toString().padStart(4, "0")}`,
    },
    {
      header: "Type",
      accessorKey: "transactionType",
      cell: (row: Transaction) => <StatusBadge status={row.transactionType} />,
    },
    {
      header: "Description",
      accessorKey: "description",
    },
    {
      header: "Quantity",
      accessorKey: "quantity",
      cell: (row: Transaction) => row.quantity ? Number(row.quantity).toLocaleString() : "N/A",
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: Transaction) => row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : "N/A",
    },
    {
      header: "Date",
      accessorKey: "transactionDate",
      cell: (row: Transaction) => format(new Date(row.transactionDate), "MMM dd, yyyy"),
    },
    {
      header: "Status",
      accessorKey: (row: Transaction) => {
        const status = row.transactionType === "purchase" 
          ? "completed" 
          : row.transactionType === "process" 
            ? "in_progress" 
            : "completed";
        return <StatusBadge status={status} />;
      }
    },
  ];

  return (
    <Card className="mb-8">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 py-4 px-5 flex flex-row items-center justify-between">
        <CardTitle className="font-sans text-lg">Recent Transactions</CardTitle>
        <Link href="/transactions">
          <Button variant="link" className="text-sm text-primary hover:underline p-0">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={paginatedTransactions}
          isLoading={isLoading}
          pageSize={DEFAULT_PAGE_SIZE}
          totalItems={totalTransactions}
          currentPage={page}
          onPageChange={setPage}
        />
      </CardContent>
      {!isLoading && paginatedTransactions.length === 0 && (
        <CardFooter className="py-4 text-center text-gray-500 dark:text-gray-400">
          No transactions available
        </CardFooter>
      )}
    </Card>
  );
};

export default TransactionsTable;
