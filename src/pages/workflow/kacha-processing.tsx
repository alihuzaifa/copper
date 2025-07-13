import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AddKachaProcessing from "@/components/workflow/AddKachaProcessing";
import KachaReturned from "@/components/workflow/KachaReturned";
import SellKacha from "@/components/workflow/SellKacha";
import WorkflowStages from "@/components/layout/workflow-stages";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

const KachaProcessingPage = () => {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  // Shared state for triggering refreshes across components
  const [addKachaRefreshKey, setAddKachaRefreshKey] = useState(0);
  const [kachaReturnedRefreshKey, setKachaReturnedRefreshKey] = useState(0);
  const [sellKachaRefreshKey, setSellKachaRefreshKey] = useState(0);

  // Functions to trigger refreshes in other components
  const triggerAddKachaRefresh = () => {
    setAddKachaRefreshKey(prev => prev + 1);
  };

  const triggerKachaReturnedRefresh = () => {
    setKachaReturnedRefreshKey(prev => prev + 1);
  };

  const triggerSellKachaRefresh = () => {
    setSellKachaRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>{softwareName} | Kacha Processing</title>
        <meta name="description" content="Manage kacha processing for your copper wire manufacturing workflow." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <WorkflowStages currentStage={2} />
          <AddKachaProcessing
            key={`add-kacha-${addKachaRefreshKey}`}
            onDataChange={() => {
              triggerKachaReturnedRefresh();
              triggerSellKachaRefresh();
            }}
          />
          <KachaReturned
            key={`kacha-returned-${kachaReturnedRefreshKey}`}
            onDataChange={() => {
              triggerAddKachaRefresh();
              triggerSellKachaRefresh();
            }}
          />
          <SellKacha
            key={`sell-kacha-${sellKachaRefreshKey}`}
            onDataChange={() => {
              triggerAddKachaRefresh();
              triggerKachaReturnedRefresh();
            }}
          />
        </div>
      </DashboardLayout>
    </>
  );
};

export default KachaProcessingPage;
