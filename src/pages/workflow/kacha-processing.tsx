import { useState } from "react";
import AddKachaProcessing from "@/components/workflow/AddKachaProcessing";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface KachaUser {
  _id: string;
  name: string;
}
interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
}
interface KachaProcessingRecord {
  _id: string;
  kachaUserId: KachaUser;
  purchaseItemId: PurchaseItem;
  quantity: number;
  totalAmount: number;
  status: string;
  history: any[];
}

const dummyUsers: KachaUser[] = [];
const dummyItems: PurchaseItem[] = [];
const dummyRecords: KachaProcessingRecord[] = [];

const KachaProcessingPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyModalKachaUserId, setHistoryModalKachaUserId] = useState("");

  return (
    <DashboardLayout>
      <AddKachaProcessing
        users={dummyUsers}
        items={dummyItems}
        records={dummyRecords}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        loading={false}
        formLoading={false}
        onAdd={() => { }}
        openHistoryModal={() => { }}
        historyModalOpen={historyModalOpen}
        setHistoryModalOpen={setHistoryModalOpen}
        historyModalKachaUserId={historyModalKachaUserId}
      />
    </DashboardLayout>
  );
};

export default KachaProcessingPage;
