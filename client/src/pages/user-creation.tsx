import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Simulating mock data storage
import { useEffect } from "react";

// Interface for our mock user type
interface MockUser {
  id: number;
  name: string;
  phoneNumber: string | null;
  createdAt: string;
}

// Interface for our mock data store
interface MockDataStore {
  suppliers: MockUser[];
  meltingUsers: MockUser[];
  drawers: MockUser[];
}

// Define a global store for our mock data
// This is a workaround for the scope issue - in a real app we'd use context or state management
const mockStore = {
  suppliers: [] as MockUser[],
  meltingUsers: [] as MockUser[],
  drawers: [] as MockUser[]
};

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phoneNumber: z.string().optional(),
  userType: z.enum(["supplier", "meltingUser", "drawer"], {
    required_error: "Please select a user type",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const UserCreationPage = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      userType: undefined,
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Add the user to the appropriate mock storage based on type
      const newUser: MockUser = {
        id: Math.floor(Math.random() * 10000),
        name: data.name,
        phoneNumber: data.phoneNumber || null,
        createdAt: new Date().toISOString(),
      };
      
      switch (data.userType) {
        case "supplier":
          mockStore.suppliers.push(newUser);
          console.log("Added supplier:", newUser);
          console.log("Current suppliers:", mockStore.suppliers);
          break;
        case "meltingUser":
          mockStore.meltingUsers.push(newUser);
          console.log("Added melting user:", newUser);
          console.log("Current melting users:", mockStore.meltingUsers);
          break;
        case "drawer":
          mockStore.drawers.push(newUser);
          console.log("Added drawer:", newUser);
          console.log("Current drawers:", mockStore.drawers);
          break;
      }
      
      // Show success message
      toast({
        title: "User created",
        description: `${data.name} has been added as a ${data.userType}.`,
      });
      
      // Reset form
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-sans">Create User</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add new suppliers, melting users, or drawers to the system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Enter the details of the new user you want to add
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter user name" {...field} />
                        </FormControl>
                        <FormDescription>
                          Full name of the user
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Contact number for the user
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select user type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="meltingUser">Melting User (Kacha)</SelectItem>
                            <SelectItem value="drawer">Drawer</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Category to which this user belongs
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-2"
                      onClick={() => navigate("/dashboard")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>User Types Explained</CardTitle>
              <CardDescription>
                Information about different user types in the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Suppliers</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Suppliers provide raw materials for the copper manufacturing process. They appear in the Purchase Management workflow.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Melting Users (Kacha)</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Melting users are responsible for the initial processing of raw copper (Kacha process). They appear in the Kacha Processing workflow.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-lg">Drawers</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Drawers are responsible for drawing copper into wires of various sizes. They appear in the Draw Process workflow.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserCreationPage;