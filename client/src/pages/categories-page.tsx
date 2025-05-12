import DashboardLayout from "@/components/layout/dashboard-layout";
import CategoryList from "@/components/categories/category-list";

const CategoriesPage = () => {
  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Category Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage supplier, drawer, and kacha user categories
          </p>
        </div>
        
        <CategoryList />
      </div>
    </DashboardLayout>
  );
};

export default CategoriesPage;
