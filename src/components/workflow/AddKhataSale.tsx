import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/api-client";

// --- Local interfaces ---
interface ProductItem {
  id: number;
  productId: string; // Add this to track which production item this cart item belongs to
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

interface AddKhataSaleProps {
  onDataChange?: () => void;
}

// API Response Types
interface ProductionItem {
  _id: string;
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
}

interface GetProductionsResponse {
  success: boolean;
  data: ProductionItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface KhataUser {
  id: string;
  name: string;
  phoneNumber: string;
}

interface GetKhataUsersResponse {
  success: boolean;
  data: KhataUser[];
}

const AddKhataSale = ({ onDataChange }: AddKhataSaleProps) => {
  const { toast } = useToast();
  
  // API Data state
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [khataUsers, setKhataUsers] = useState<KhataUser[]>([]);
  const [loading, setLoading] = useState(false);
  
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
    saleDate: new Date().toISOString().split('T')[0],
    paymentTypes: [],
    cashAmount: "",
    bankAmount: "",
    bankName: "",
    checkAmount: "",
    checkNumber: "",
  });
  const [customerError, setCustomerError] = useState("");

  // Fetch production items
  const fetchProductionItems = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetProductionsResponse>({
        url: '/productions',
        method: 'GET',
        params: {
          page: 1,
          limit: 100, // Get productions with limit
          includeDeleted: false
        }
      });

      if (response.success) {
        setProductionItems(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching production items:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch production items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch khata users
  const fetchKhataUsers = async () => {
    try {
      setLoading(true);
      const response = await request<void, GetKhataUsersResponse>({
        url: '/khata-sales/users',
        method: 'GET'
      });

      if (response.success) {
        setKhataUsers(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching khata users:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch khata users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionItems();
    fetchKhataUsers();
  }, []);

  // Get available quantity for selected product (considering cart)
  const getAvailableQuantity = (productId: string) => {
    const product = productionItems.find(p => p._id === productId);
    if (!product) return 0;
    
    // Subtract quantities already in cart
    const cartQuantity = cart.reduce((sum, item) => {
      // Check if this cart item corresponds to the selected product
      if (item.productId === productId) {
        return sum + item.sellingQty;
      }
      return sum;
    }, 0);
    
    return product.output.quantity - cartQuantity;
  };

  // Add product to cart
  const handleAddProduct = () => {
    setProductError("");
    const prod = productionItems.find((p) => p._id === productId);
    if (!prod) {
      setProductError("Select a product");
      return;
    }
    const qty = Number(sellingQty);
    const prc = Number(price);
    if (!qty || qty <= 0) {
      setProductError("Invalid quantity");
      return;
    }
    
    const availableQty = getAvailableQuantity(productId);
    if (qty > availableQty) {
      setProductError(`Cannot add more than available quantity. Available: ${availableQty}`);
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
        productId: productId, // Store the production item ID
        name: prod.output.materialName,
        availableQty: prod.output.quantity,
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

    // Validate payment amounts
    let totalPaymentAmount = 0;
    if (customer.paymentTypes.includes('cash') && customer.cashAmount) {
      totalPaymentAmount += Number(customer.cashAmount);
    }
    if (customer.paymentTypes.includes('bank') && customer.bankAmount) {
      totalPaymentAmount += Number(customer.bankAmount);
    }
    if (customer.paymentTypes.includes('check') && customer.checkAmount) {
      totalPaymentAmount += Number(customer.checkAmount);
    }

    const totalBill = cart.reduce((sum, p) => sum + p.total, 0);
    
    if (totalPaymentAmount !== totalBill) {
      setCustomerError("Total payment amount must equal total bill amount");
      return;
    }

    // Here you would typically make an API call to save the khata sale
    // For now, we'll just show a success message
    toast({
      title: "Success",
      description: "Khata sale saved successfully",
    });

    // Reset form
    setCart([]);
    setCustomer({
      name: "",
      phone: "",
      saleDate: new Date().toISOString().split('T')[0],
      paymentTypes: [],
      cashAmount: "",
      bankAmount: "",
      bankName: "",
      checkAmount: "",
      checkNumber: "",
    });

    // Refresh available products
    fetchProductionItems();

    // Trigger refresh in parent component
    onDataChange?.();
  };

  return (
    <div className="space-y-6">
      {/* Product Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Product *</label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger className={productError && !productId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select Product" />
                </SelectTrigger>
                <SelectContent>
                  {productionItems.map((p) => (
                    <SelectItem key={p._id} value={p._id}>
                      {p.output.materialName} (Available: {getAvailableQuantity(p._id)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Available Qty *</label>
              <Input 
                value={productId ? getAvailableQuantity(productId) : ""} 
                disabled 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Selling Qty *</label>
              <Input 
                type="number" 
                value={sellingQty} 
                onChange={e => setSellingQty(e.target.value)} 
                className={productError && (!sellingQty || Number(sellingQty) <= 0) ? 'border-red-500' : ''} 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price *</label>
              <Input 
                type="number" 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                className={productError && (!price || Number(price) <= 0) ? 'border-red-500' : ''} 
              />
            </div>
          </div>
          {productError && <div className="text-red-600 text-xs mb-2">{productError}</div>}
          <Button onClick={handleAddProduct} disabled={loading}>Add Product</Button>
          
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
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Select value={customer.name} onValueChange={v => handleCustomerChange('name', v)}>
                  <SelectTrigger className={customerError && !customer.name ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                                  <SelectContent>
                  {khataUsers.map((c) => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number *</label>
                <Input 
                  value={customer.name ? khataUsers.find(c => c.name === customer.name)?.phoneNumber ?? "" : ""} 
                  disabled 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Khata Sale Date *</label>
                <Input 
                  type="date" 
                  value={customer.saleDate} 
                  onChange={e => handleCustomerChange('saleDate', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium">Payment Types *</label>
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
                  <label className="text-sm font-medium">Cash Amount *</label>
                  <Input 
                    type="number"
                    value={customer.cashAmount} 
                    onChange={e => handleCustomerChange('cashAmount', e.target.value)} 
                  />
                </div>
              )}
              {customer.paymentTypes.includes('bank') && (
                <>
                  <div>
                    <label className="text-sm font-medium">Bank Name *</label>
                    <Input 
                      value={customer.bankName} 
                      onChange={e => handleCustomerChange('bankName', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bank Amount *</label>
                    <Input 
                      type="number"
                      value={customer.bankAmount} 
                      onChange={e => handleCustomerChange('bankAmount', e.target.value)} 
                    />
                  </div>
                </>
              )}
              {customer.paymentTypes.includes('check') && (
                <>
                  <div>
                    <label className="text-sm font-medium">Check Number *</label>
                    <Input 
                      value={customer.checkNumber} 
                      onChange={e => handleCustomerChange('checkNumber', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Check Amount *</label>
                    <Input 
                      type="number"
                      value={customer.checkAmount} 
                      onChange={e => handleCustomerChange('checkAmount', e.target.value)} 
                    />
                  </div>
                </>
              )}
            </div>
            
            {customerError && <div className="text-red-600 text-xs mb-2">{customerError}</div>}
            
            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={handleSaveKhataSale} disabled={loading}>Save Khata Sale</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddKhataSale; 