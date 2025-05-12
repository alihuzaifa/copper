import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "gray";
  
  const colorClasses = {
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colorClasses[color as keyof typeof colorClasses],
        className
      )}
    >
      {formattedStatus}
    </span>
  );
};

export default StatusBadge;
