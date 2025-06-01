import { Link } from "wouter";
import { 
  Plus, 
  Users, 
  FileText, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <CardTitle className="font-sans text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <Link href="/workflow/purchase-management">
          <Button className="w-full flex items-center justify-center">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Button>
        </Link>
        
        <Link href="/users">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Suppliers
          </Button>
        </Link>
        
        <Link href="/transactions">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
          >
            <Search className="mr-2 h-4 w-4" />
            Track Order
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
