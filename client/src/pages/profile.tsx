import DashboardLayout from "@/components/layout/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format } from "date-fns";

const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const initials = user.name ? getInitials(user.name) : user.username.substring(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your account information and settings
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4 border-b border-gray-200 dark:border-gray-700">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-sans">{user.name || user.username}</CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Username</span>
                    <span>{user.username}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Email</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Account Created</span>
                    <span>{user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "N/A"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Permissions</h3>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Role</span>
                    <span className="capitalize">{user.role || "User"}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                    <span className="text-gray-500 dark:text-gray-400">Status</span>
                    <span className="capitalize">{user.isVerified ? "Verified" : "Unverified"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;