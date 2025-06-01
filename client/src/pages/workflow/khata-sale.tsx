// --- Local interfaces ---
interface ProductItem {
  id: number;
  name: string;
  availableQty: number;
  sellingQty: number;
  price: number;
  total: number;
}
interface CustomerDetails {
  name: string;
  phone: string;
  saleDate: string;
  paymentTypes: string[];
  cashAmount?: string;
  bankAmount?: string;
  bankName?: string;
  checkAmount?: string;
  checkNumber?: string;
}
interface KhataSaleRecord {
  id: number;
  customer: CustomerDetails;
  products: ProductItem[];
  totalBill: number;
  date: string;
  history: KhataSaleHistory[];
}
interface KhataSaleHistory {
  date: string;
  action: 'add' | 'delete';
  note?: string;
}

import { useState } from "react";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const dummyProducts = [
  { id: 1, name: "25mm 4 core Copper Std", availableQty: 36 },
  { id: 2, name: "16mm 2 core Copper Std", availableQty: 20 },
];
const dummyCustomers = [
  { name: "Customer A", phone: "920000000001" },
  { name: "Customer B", phone: "920000000002" },
];

const KhataSalePage = () => {
  // Cart state
  const [cart, setCart] = useState<ProductItem[]>([]);
  const [productId, setProductId] = useState("");
  const [sellingQty, setSellingQty] = useState("");
  const [price, setPrice] = useState("");
  const [productError, setProductError] = useState("");

  // Customer form state
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: "",
    phone: "",
    saleDate: format(new Date(), "yyyy-MM-dd"),
    paymentTypes: [],
    cashAmount: "",
    bankAmount: "",
    bankName: "",
    checkAmount: "",
    checkNumber: "",
  });
  const [customerError, setCustomerError] = useState("");

  // Saved Khata Sales
  const [khataSales, setKhataSales] = useState<KhataSaleRecord[]>([]);
  const [historyModal, setHistoryModal] = useState<{ open: boolean; sale: KhataSaleRecord | null }>({ open: false, sale: null });

  // Add product to cart
  const handleAddProduct = () => {
    setProductError("");
    const prod = dummyProducts.find((p) => p.id === Number(productId));
    if (!prod) {
      setProductError("Select a product");
      return;
    }
    const qty = Number(sellingQty);
    const prc = Number(price);
    if (!qty || qty <= 0 || qty > prod.availableQty) {
      setProductError("Invalid quantity");
      return;
    }
    if (!prc || prc <= 0) {
      setProductError("Invalid price");
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: prod.name,
        availableQty: prod.availableQty,
        sellingQty: qty,
        price: prc,
        total: qty * prc,
      },
    ]);
    setProductId("");
    setSellingQty("");
    setPrice("");
  };

  // Remove product from cart
  const handleRemoveProduct = (id: number) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  // Handle customer form change
  const handleCustomerChange = (field: keyof CustomerDetails, value: string | string[]) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
  };

  // Save Khata Sale
  const handleSaveKhataSale = () => {
    setCustomerError("");
    if (!customer.name || !customer.phone) {
      setCustomerError("Customer name and phone required");
      return;
    }
    if (cart.length === 0) {
      setCustomerError("Add at least one product");
      return;
    }
    const totalBill = cart.reduce((sum, p) => sum + p.total, 0);
    setKhataSales((prev) => [
      {
        id: Date.now(),
        customer: { ...customer },
        products: [...cart],
        totalBill,
        date: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        history: [
          {
            date: new Date().toISOString(),
            action: 'add',
            note: 'Created',
          },
        ],
      },
      ...prev,
    ]);
    setCart([]);
    setCustomer({
      name: "",
      phone: "",
      saleDate: format(new Date(), "yyyy-MM-dd"),
      paymentTypes: [],
      cashAmount: "",
      bankAmount: "",
      bankName: "",
      checkAmount: "",
      checkNumber: "",
    });
  };

  // Delete Khata Sale
  const handleDeleteSale = (id: number) => {
    setKhataSales((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold font-sans">Khata Sale</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Add products, then customer details, then save the Khata Sale</p>
          </div>
        </div>
        {/* Product Details Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label>Product *</label>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger className={productError && !productId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyProducts.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Available Qty *</label>
                <Input value={productId ? dummyProducts.find(p => p.id === Number(productId))?.availableQty ?? "" : ""} disabled />
              </div>
              <div>
                <label>Selling Qty *</label>
                <Input type="number" value={sellingQty} onChange={e => setSellingQty(e.target.value)} className={productError && (!sellingQty || Number(sellingQty) <= 0) ? 'border-red-500' : ''} />
              </div>
              <div>
                <label>Price *</label>
                <Input type="number" value={price} onChange={e => setPrice(e.target.value)} className={productError && (!price || Number(price) <= 0) ? 'border-red-500' : ''} />
              </div>
            </div>
            {productError && <div className="text-red-600 text-xs mb-2">{productError}</div>}
            <Button onClick={handleAddProduct}>Add Product</Button>
            {/* Cart DataTable */}
            {cart.length > 0 && (
              <div className="mt-6">
                <h6 className="font-semibold mb-3">Added Products</h6>
                <DataTable
                  columns={[
                    { header: "Product", accessorKey: "name" },
                    { header: "Quantity", accessorKey: "sellingQty" },
                    { header: "Price", accessorKey: (row) => `Rs. ${row.price}` },
                    { header: "Total", accessorKey: (row) => `Rs. ${row.total}` },
                    {
                      header: "Actions",
                      accessorKey: (row) => row.id,
                      cell: (row) => (
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveProduct(row.id)}>
                          Remove
                        </Button>
                      ),
                    },
                  ]}
                  data={cart}
                />
                <div className="flex justify-end mt-2 font-bold">
                  Total Bill Amount: Rs. {cart.reduce((sum, p) => sum + p.total, 0)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Customer Details Section */}
        {cart.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label>Customer Name *</label>
                  <Select value={customer.name} onValueChange={v => handleCustomerChange('name', v)}>
                    <SelectTrigger className={customerError && !customer.name ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {dummyCustomers.map((c) => (
                        <SelectItem key={c.phone} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Phone Number *</label>
                  <Input value={customer.name ? dummyCustomers.find(c => c.name === customer.name)?.phone ?? "" : ""} disabled />
                </div>
                <div>
                  <label>Khata Sale Date *</label>
                  <Input type="date" value={customer.saleDate} onChange={e => handleCustomerChange('saleDate', e.target.value)} />
                </div>
              </div>
              <div className="mb-4">
                <label>Payment Types *</label>
                <div className="flex gap-4 mt-2">
                  {['cash', 'bank', 'check'].map((type) => (
                    <label key={type} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={customer.paymentTypes.includes(type)}
                        onChange={e => {
                          const checked = e.target.checked;
                          let updated = [...customer.paymentTypes];
                          if (checked) updated.push(type);
                          else updated = updated.filter(t => t !== type);
                          handleCustomerChange('paymentTypes', updated);
                        }}
                        className="form-checkbox"
                      />
                      <span className="ml-2 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {customer.paymentTypes.includes('cash') && (
                  <div>
                    <label>Cash Amount *</label>
                    <Input value={customer.cashAmount} onChange={e => handleCustomerChange('cashAmount', e.target.value)} />
                  </div>
                )}
                {customer.paymentTypes.includes('bank') && (
                  <>
                    <div>
                      <label>Bank Name *</label>
                      <Input value={customer.bankName} onChange={e => handleCustomerChange('bankName', e.target.value)} />
                    </div>
                    <div>
                      <label>Bank Amount *</label>
                      <Input value={customer.bankAmount} onChange={e => handleCustomerChange('bankAmount', e.target.value)} />
                    </div>
                  </>
                )}
                {customer.paymentTypes.includes('check') && (
                  <>
                    <div>
                      <label>Check Number *</label>
                      <Input value={customer.checkNumber} onChange={e => handleCustomerChange('checkNumber', e.target.value)} />
                    </div>
                    <div>
                      <label>Check Amount *</label>
                      <Input value={customer.checkAmount} onChange={e => handleCustomerChange('checkAmount', e.target.value)} />
                    </div>
                  </>
                )}
              </div>
              {customerError && <div className="text-red-600 text-xs mb-2">{customerError}</div>}
              <div className="flex justify-end gap-4 mt-6">
                <Button onClick={handleSaveKhataSale}>Save Khata Sale</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Previous Khata Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Khata Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Products</th>
                    <th>Total Bill</th>
                    <th>History</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {khataSales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">No sales yet.</td>
                    </tr>
                  )}
                  {khataSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.customer.name}</td>
                      <td>{sale.customer.phone}</td>
                      <td>{sale.date}</td>
                      <td>
                        <ul>
                          {sale.products.map((p) => (
                            <li key={p.id}>{p.name} (Qty: {p.sellingQty}, Rs. {p.price})</li>
                          ))}
                        </ul>
                      </td>
                      <td>Rs. {sale.totalBill}</td>
                      <td>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setHistoryModal({ open: true, sale })}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                      <td>
                        <Button variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDeleteSale(sale.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* History Modal */}
        <Dialog open={historyModal.open} onOpenChange={(open) => setHistoryModal({ open, sale: open ? historyModal.sale : null })}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Khata Sale History</DialogTitle>
            </DialogHeader>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Date/Time</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {historyModal.sale?.history.map((h, idx) => (
                    <tr key={idx}>
                      <td>{h.action}</td>
                      <td>{format(new Date(h.date), "yyyy-MM-dd HH:mm:ss")}</td>
                      <td>{h.note}</td>
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

export default KhataSalePage; 