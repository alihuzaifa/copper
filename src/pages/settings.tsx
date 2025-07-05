import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { request } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

// Phone number regex for Pakistani numbers
const phoneRegex = /^(\+92|92|0)(3\d{2}|3\d{2})[-]?\d{7}$/;

// Form schema
const settingsSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  softwareName: z.string().min(1, "Software name is required"),
  shopAddress: z.string().min(1, "Shop address is required"),
  shopDescription: z.string().min(1, "Shop description is required"),
  firstOwnerName: z.string().min(1, "First owner name is required"),
  firstOwnerNumber1: z.string().regex(phoneRegex, "Please enter a valid Pakistani phone number"),
  firstOwnerNumber2: z.string().regex(phoneRegex, "Please enter a valid Pakistani phone number").optional(),
  secondOwnerName: z.string().optional(),
  secondOwnerNumber1: z.string().regex(phoneRegex, "Please enter a valid Pakistani phone number").optional(),
  secondOwnerNumber2: z.string().regex(phoneRegex, "Please enter a valid Pakistani phone number").optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsResponse extends SettingsFormValues {
  _id: string;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      shopName: "",
      softwareName: "",
      shopAddress: "",
      shopDescription: "",
      firstOwnerName: "",
      firstOwnerNumber1: "",
      firstOwnerNumber2: "",
      secondOwnerName: "",
      secondOwnerNumber1: "",
      secondOwnerNumber2: "",
    },
  });

  // Fetch existing settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await request<void, SettingsResponse>({
        url: '/settings',
        method: 'GET'
      });

      if (response) {
        setHasExistingSettings(true);
        const { 
          _id, shopId, createdAt, updatedAt, __v,
          ...formData 
        } = response;
        form.reset(formData);
      }
    } catch (error: any) {
      if (error.status !== 404) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to fetch settings",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setIsLoading(true);
      const response = await request<SettingsFormValues, SettingsResponse>({
        url: '/settings',
        method: 'POST',
        data: values
      });

      if (response) {
        toast({
          title: "Success",
          description: `Settings ${hasExistingSettings ? 'updated' : 'saved'} successfully`,
        });

        if (!hasExistingSettings) {
          setHasExistingSettings(true);
        }

        // Update form with new values
        const { 
          _id, shopId, createdAt, updatedAt, __v,
          ...formData 
        } = response;
        form.reset(formData);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save settings",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !hasExistingSettings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Software Settings</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Shop Details */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="shopName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter shop name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="softwareName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Software Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter software name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* First Owner Details */}
            <Card>
              <CardHeader>
                <CardTitle>First Owner Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstOwnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter owner name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstOwnerNumber1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="03XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstOwnerNumber2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Number</FormLabel>
                        <FormControl>
                          <Input placeholder="03XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Second Owner Details */}
            <Card>
              <CardHeader>
                <CardTitle>Second Owner Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="secondOwnerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter owner name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondOwnerNumber1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Number</FormLabel>
                        <FormControl>
                          <Input placeholder="03XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondOwnerNumber2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Number</FormLabel>
                        <FormControl>
                          <Input placeholder="03XX-XXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shop Address and Description */}
            <Card>
              <CardHeader>
                <CardTitle>Shop Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <FormField
                  control={form.control}
                  name="shopAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter complete shop address" 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter shop description (e.g., types of cables)" 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {hasExistingSettings ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  hasExistingSettings ? 'Update Settings' : 'Save Settings'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
}
