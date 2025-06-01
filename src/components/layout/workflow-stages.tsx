import { WORKFLOW_STAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface WorkflowStagesProps {
  currentStage?: number;
}

const WorkflowStages = ({ currentStage = 0 }: WorkflowStagesProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-sans font-semibold mb-4">Manufacturing Workflow</h2>
      <div className="relative">
        {/* Timeline Track */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 transform -translate-y-1/2"></div>
        
        {/* Timeline Points */}
        <div className="relative flex justify-between">
          {WORKFLOW_STAGES.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center">
              <div 
                className={cn(
                  "z-10 rounded-full w-8 h-8 flex items-center justify-center text-white text-sm mb-2",
                  stage.id < currentStage 
                    ? "bg-green-500 dark:bg-green-600" 
                    : stage.id === currentStage 
                      ? "bg-primary dark:bg-primary" 
                      : "bg-gray-300 dark:bg-gray-600"
                )}
              >
                {stage.id}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowStages;
