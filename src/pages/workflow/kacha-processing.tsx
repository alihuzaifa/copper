import DashboardLayout from "@/components/layout/dashboard-layout";
import AddKachaProcessing from "@/components/workflow/AddKachaProcessing";
import KachaReturned from "@/components/workflow/KachaReturned";

const KachaProcessingPage = () => {
  return (
    <DashboardLayout>
      <AddKachaProcessing />
      <KachaReturned />
    </DashboardLayout>
  );
};

export default KachaProcessingPage;
