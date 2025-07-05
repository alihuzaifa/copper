import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import dayjs from "dayjs";
import KachaProcessingForm from "./KachaProcessingForm";

// Minimal type definitions for local use
export interface KachaUser {
  _id: string;
  name: string;
  phoneNumber?: string;
}
export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit?: number;
}
export interface KachaProcessingRecord {
  _id: string;
  kachaUserId: KachaUser;
  purchaseItemId: PurchaseItem;
  quantity: number;
  totalAmount: number;
  status: string;
  history: Array<{
    _id: string;
    action: string;
    quantity: number;
    totalAmount: number;
    actionDate: string;
    actionBy: string;
    notes: string;
    previousQuantity: number;
    newQuantity: number;
  }>;
}

interface AddKachaProcessingProps {
  users: KachaUser[];
  items: PurchaseItem[];
  records: KachaProcessingRecord[];
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  loading: boolean;
  formLoading: boolean;
  onAdd: (data: any) => void;
  openHistoryModal: (kachaUserId: string, purchaseItemId: string | number) => void;
  historyModalOpen: boolean;
  setHistoryModalOpen: (open: boolean) => void;
  historyModalKachaUserId: string;
}

const getPurchaseItemName = (purchaseItem: PurchaseItem) => purchaseItem?.name || '';
const getPurchaseItemId = (purchaseItem: PurchaseItem) => purchaseItem?.id || '';
const getPurchaseItemQuantity = (purchaseItem: PurchaseItem) => purchaseItem?.quantity || 0;

const AddKachaProcessing = ({
  users,
  items,
  records,
  modalOpen,
  setModalOpen,
  loading,
  formLoading,
  onAdd,
  openHistoryModal,
  historyModalOpen,
  setHistoryModalOpen,
  historyModalKachaUserId,
}: AddKachaProcessingProps) => {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-sans">
            Kacha Processing
          </CardTitle>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Kacha Processing</DialogTitle>
              </DialogHeader>
              <KachaProcessingForm
                onSubmit={onAdd}
                onCancel={() => setModalOpen(false)}
                users={users}
                items={items}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kacha User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price/Unit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">History</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record._id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2">{record.kachaUserId.name}</td>
                    <td className="px-4 py-2">{record.kachaUserId.phoneNumber}</td>
                    <td className="px-4 py-2">{getPurchaseItemName(record.purchaseItemId)}</td>
                    <td className="px-4 py-2">{getPurchaseItemQuantity(record.purchaseItemId)}</td>
                    <td className="px-4 py-2">{record.purchaseItemId.pricePerUnit}</td>
                    <td className="px-4 py-2">{record.quantity}</td>
                    <td className="px-4 py-2">{record.totalAmount}</td>
                    <td className="px-4 py-2">
                      <span className={record.status === "active" ? "text-green-600" : "text-red-600"}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => openHistoryModal(record._id, getPurchaseItemId(record.purchaseItemId))}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Per-row History Modal */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>History</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Previous Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">New Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                </tr>
              </thead>
              <tbody>
                {records
                  .filter((r) => r._id === historyModalKachaUserId)
                  .map((record) =>
                    record.history.map((h: any) => (
                      <tr key={h._id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-4 py-2">
                          <span
                            className={
                              h.action === "created"
                                ? "text-green-600"
                                : h.action === "return"
                                ? "text-blue-600"
                                : "text-red-600"
                            }
                          >
                            {h.action.charAt(0).toUpperCase() + h.action.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">{h.previousQuantity}</td>
                        <td className="px-4 py-2">{h.newQuantity}</td>
                        <td className="px-4 py-2">{h.totalAmount}</td>
                        <td className="px-4 py-2">{h.notes}</td>
                        <td className="px-4 py-2">{dayjs(h.actionDate).format("YYYY-MM-DD HH:mm:ss")}</td>
                      </tr>
                    ))
                  )}
                {!records.some((r) => r._id === historyModalKachaUserId) && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No history yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddKachaProcessing; 