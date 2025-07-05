import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface KachaReturnedProps {
  returnedInventory: KachaInventoryItem[];
  purchaseItems: PurchaseItem[];
  loading: boolean;
}

const getPurchaseItemName = (purchaseItem: any) => purchaseItem?.name || purchaseItem?.materialName || '';
const getPurchaseItemId = (purchaseItem: any) => purchaseItem?.id || purchaseItem?._id || '';

const KachaReturned = ({ returnedInventory, purchaseItems, loading }: KachaReturnedProps) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle className="text-lg font-sans">
        Returned Kacha Inventory
      </CardTitle>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Kacha returned from processing, available for sale
      </p>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Available Quantity</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Return Date</th>
            </tr>
          </thead>
          <tbody>
            {returnedInventory.map((inv) => (
              <tr key={inv._id} className="border-b border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">
                  <div>
                    <span className="font-medium">{inv.newName}</span>
                    <span className="text-xs text-gray-500 block">
                      (Originally: {typeof inv.originalPurchaseItemId === 'object' ? getPurchaseItemName(inv.originalPurchaseItemId) :
                        purchaseItems.find((i) => getPurchaseItemId(i) === (typeof inv.originalPurchaseItemId === 'string' ? inv.originalPurchaseItemId : getPurchaseItemId(inv.originalPurchaseItemId)))?.name || "N/A"})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">{inv.quantity}</td>
                <td className="px-4 py-2">{dayjs(inv.returnDate).format("YYYY-MM-DD HH:mm")}</td>
              </tr>
            ))}
            {returnedInventory.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No inventory available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default KachaReturned; 