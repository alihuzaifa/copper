import DashboardLayout from "@/components/layout/dashboard-layout";
import AddKachaProcessing from "@/components/workflow/AddKachaProcessing";
import KachaReturned from "@/components/workflow/KachaReturned";
import SellKacha from "@/components/workflow/SellKacha";

const KachaProcessingPage = () => {
  return (
    <DashboardLayout>
      <AddKachaProcessing />
      <KachaReturned />
      <SellKacha />
    </DashboardLayout>
  );
};

export default KachaProcessingPage;
