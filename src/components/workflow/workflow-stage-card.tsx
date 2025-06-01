import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface WorkflowStageCardProps {
  id: number;
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  value: number;
  total: number;
  status: string;
  color: string;
}

const WorkflowStageCard = ({
  id,
  name,
  description,
  icon: Icon,
  path,
  value,
  total,
  status,
  color,
}: WorkflowStageCardProps) => {
  // Calculate progress percentage
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  // Color classes based on the provided color
  const colorClasses = {
    blue: "border-blue-200 dark:border-blue-800",
    green: "border-green-200 dark:border-green-800",
    yellow: "border-yellow-200 dark:border-yellow-800",
    purple: "border-purple-200 dark:border-purple-800",
    red: "border-red-200 dark:border-red-800",
    gray: "border-gray-200 dark:border-gray-700",
  };
  
  const colorBg = {
    blue: "bg-blue-100 dark:bg-blue-900",
    green: "bg-green-100 dark:bg-green-900",
    yellow: "bg-yellow-100 dark:bg-yellow-900",
    purple: "bg-purple-100 dark:bg-purple-900",
    red: "bg-red-100 dark:bg-red-900",
    gray: "bg-gray-100 dark:bg-gray-900",
  };
  
  const colorText = {
    blue: "text-blue-700 dark:text-blue-300",
    green: "text-green-700 dark:text-green-300",
    yellow: "text-yellow-700 dark:text-yellow-300",
    purple: "text-purple-700 dark:text-purple-300",
    red: "text-red-700 dark:text-red-300",
    gray: "text-gray-700 dark:text-gray-300",
  };
  
  const colorProgress = {
    blue: "bg-blue-500 dark:bg-blue-600",
    green: "bg-green-500 dark:bg-green-600",
    yellow: "bg-yellow-500 dark:bg-yellow-600",
    purple: "bg-purple-500 dark:bg-purple-600",
    red: "bg-red-500 dark:bg-red-600",
    gray: "bg-gray-500 dark:bg-gray-600",
  };
  
  return (
    <Card className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.gray}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className={`w-10 h-10 rounded-full ${colorBg[color as keyof typeof colorBg] || colorBg.gray} flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${colorText[color as keyof typeof colorText] || colorText.gray}`} />
          </div>
          <div className="text-2xl font-bold">{id}</div>
        </div>
        <CardTitle className="mt-2">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{value} items</span>
            <span>{percentage}%</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-2 bg-gray-100 dark:bg-gray-800" 
            indicatorClassName={colorProgress[color as keyof typeof colorProgress] || colorProgress.gray}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Status: <span className="font-medium">{status}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={path}>
          <Button variant="outline" className="w-full">
            Manage {name}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default WorkflowStageCard;
