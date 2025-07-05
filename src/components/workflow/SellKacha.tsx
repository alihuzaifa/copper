import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dayjs from "dayjs";

interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
}

interface KachaInventoryItem {
  _id: string;
  originalPurchaseItemId: PurchaseItem;
  newName: string;
  quantity: number;
  returnDate: string;
  shopId: string;
  returnedBy: string;
}

interface KachaSale {
  _id: string;
  originalPurchaseItemId: PurchaseItem;
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  buyerName: string;
  saleDate: string;
  shopId: string;
  soldBy: string;
  notes?: string;
}

interface SellKachaProps {
  returnedInventory: KachaInventoryItem[];
  salesHistory: KachaSale[];
  purchaseItems: PurchaseItem[];
  sellDialogOpen: boolean;
  setSellDialogOpen: (open: boolean) => void;
  sellPurchaseItemId: string;
  setSellPurchaseItemId: (id: string) => void;
  sellQuantity: string;
  setSellQuantity: (q: string) => void;
  sellPricePerUnit: string;
  setSellPricePerUnit: (p: string) => void;
  sellBuyerName: string;
  setSellBuyerName: (n: string) => void;
  sellError: string;
  handleSellKacha: () => void;
  loading: boolean;
}

const getPurchaseItemName = (purchaseItem: any) => purchaseItem?.name || purchaseItem?.materialName || '';
const getPurchaseItemId = (purchaseItem: any) => purchaseItem?.id || purchaseItem?._id || '';

const SellKacha = ({
  returnedInventory,
  salesHistory,
  purchaseItems,
  sellDialogOpen,
  setSellDialogOpen,
  sellPurchaseItemId,
  setSellPurchaseItemId,
  sellQuantity,
  setSellQuantity,
  sellPricePerUnit,
  setSellPricePerUnit,
  sellBuyerName,
  setSellBuyerName,
  sellError,
  handleSellKacha,
  loading,
}: SellKachaProps) => (
  <>
    {/* Sell Kacha Dialog */}
    <Dialog open={sellDialogOpen} onOpenChange={setSellDialogOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sell Kacha</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Item to Sell</label>
            <Select
              value={sellPurchaseItemId}
              onValueChange={setSellPurchaseItemId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                {returnedInventory.map((inv) => (
                  <SelectItem key={inv._id} value={inv._id}>
                    {inv.newName} (Available: {inv.quantity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Quantity to Sell</label>
            <Input
              type="number"
              min="0"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Price per Unit</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={sellPricePerUnit}
              onChange={(e) => setSellPricePerUnit(e.target.value)}
              placeholder="Enter price per unit"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Buyer Name</label>
            <Input
              type="text"
              value={sellBuyerName}
              onChange={(e) => setSellBuyerName(e.target.value)}
              placeholder="Enter buyer name"
            />
          </div>
          {sellError && (
            <div className="text-red-600 text-xs">{sellError}</div>
          )}
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setSellDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSellKacha}>Sell</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Sales History */}
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-sans">Sales History</CardTitle>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Record of all kacha sales
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sale Date</th>
              </tr>
            </thead>
            <tbody>
              {salesHistory.map((sale) => (
                <tr key={sale._id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2">
                    <div>
                      <span className="font-medium">{sale.itemName}</span>
                      <span className="text-xs text-gray-500 block">
                        (Originally: {typeof sale.originalPurchaseItemId === 'object' ? getPurchaseItemName(sale.originalPurchaseItemId) :
                          purchaseItems.find((i) => getPurchaseItemId(i) === (typeof sale.originalPurchaseItemId === 'string' ? sale.originalPurchaseItemId : getPurchaseItemId(sale.originalPurchaseItemId)))?.name || "N/A"})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{sale.quantity}</td>
                  <td className="px-4 py-2">{sale.pricePerUnit}</td>
                  <td className="px-4 py-2">{sale.totalAmount}</td>
                  <td className="px-4 py-2">{sale.buyerName}</td>
                  <td className="px-4 py-2">{dayjs(sale.saleDate).format("YYYY-MM-DD HH:mm")}</td>
                </tr>
              ))}
              {salesHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No sales recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </>
);

export default SellKacha; 