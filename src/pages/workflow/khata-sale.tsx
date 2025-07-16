import { useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { getSoftwareName } from '@/lib/utils';
import defaultSoftwareDetail from '@/softwareSetting';
import AddKhataSale from "@/components/workflow/AddKhataSale";
import KhataSaleList from "@/components/workflow/KhataSaleList";

const KhataSalePage = () => {
  const { apiSettings } = useSelector((state: any) => state.settings);
  const softwareName = getSoftwareName(apiSettings, defaultSoftwareDetail.softwareName);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Helmet>
        <title>{softwareName} | Khata Sale</title>
        <meta name="description" content="Manage khata sales for your copper wire manufacturing workflow." />
      </Helmet>
      <DashboardLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold font-sans">Khata Sale</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Add products, then customer details, then save the Khata Sale</p>
            </div>
          </div>
          
          {/* Add Khata Sale Component */}
          <div className="mb-8">
            <AddKhataSale onDataChange={handleDataChange} />
          </div>

          {/* Khata Sale List Component */}
          <div key={refreshKey}>
            <KhataSaleList onDataChange={handleDataChange} />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default KhataSalePage; 