import DashboardLayout from "@/components/layout/dashboard-layout";
import SupplierList from "@/components/suppliers/supplier-list";

const SuppliersPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Supplier Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, and manage your suppliers
          </p>
        </div>
        
        <SupplierList />
      </div>
    </DashboardLayout>
  );
};

export default SuppliersPage;
