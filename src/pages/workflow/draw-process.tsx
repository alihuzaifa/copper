import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import WorkflowStages from "@/components/layout/workflow-stages";
import AddDrawProcessing from "@/components/workflow/AddDrawProcessing";
import DrawReturned from "@/components/workflow/DrawReturned";
import SellDraw from "@/components/workflow/SellDraw";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';

const DrawProcessPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>{softwareName} | Draw Processing</title>
        <meta name="description" content="Manage draw processing for your copper wire manufacturing workflow." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          {/* Workflow Stages */}
          <WorkflowStages currentStage={3} />

          <div className="mb-6">
            <h1 className="text-2xl font-semibold font-sans">
              Draw Processing
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Assign Drawer Users to process kacha products
            </p>
          </div>

          {/* Add Draw Processing Component */}
          <AddDrawProcessing key={`add-${refreshKey}`} onDataChange={handleDataChange} />

          {/* Returned Draw Inventory Component */}
          <DrawReturned key={`returned-${refreshKey}`} onDataChange={handleDataChange} />

          {/* Sell Draw Component */}
          <SellDraw key={`sell-${refreshKey}`} onDataChange={handleDataChange} />
        </div>
      </DashboardLayout>
    </>
  );
};

export default DrawProcessPage;
