import { Progress } from "../components/ui/progress";
import type { Task } from "../types/task";

interface ProgressBarProps {
  tasks: Task[];
}

const ProgressBar = ({ tasks }: ProgressBarProps) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress</span>
        <span className="text-foreground font-medium">
          {completed} of {total} completed ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ProgressBar;
