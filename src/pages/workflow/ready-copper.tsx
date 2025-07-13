import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import AddReadyCopper from "@/components/workflow/AddReadyCopper";
import ReadyCopperReturned from "@/components/workflow/ReadyCopperReturned";
import SellReadyCopper from "@/components/workflow/SellReadyCopper";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

const ReadyCopperPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);

  return (
    <>
      <Helmet>
        <title>{softwareName} | Ready Copper</title>
        <meta name="description" content="Manage ready copper for your copper wire manufacturing workflow." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Workflow Stages */}
          <WorkflowStages currentStage={4} />

          <div className="mb-6">
            <h1 className="text-2xl font-semibold font-sans">
              Ready Copper
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage ready copper processing and sales
            </p>
          </div>

          {/* Add Ready Copper Component */}
          <AddReadyCopper key={`add-${refreshKey}`} onDataChange={handleDataChange} />

          {/* Returned Ready Copper Inventory Component */}
          <ReadyCopperReturned key={`returned-${refreshKey}`} onDataChange={handleDataChange} />

          {/* Sell Ready Copper Component */}
          <SellReadyCopper key={`sell-${refreshKey}`} onDataChange={handleDataChange} />
        </div>
      </DashboardLayout>
    </>
  );
};

export default ReadyCopperPage;
