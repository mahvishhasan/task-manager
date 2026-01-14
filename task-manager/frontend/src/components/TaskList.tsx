import { useMemo, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import type { Task, TaskStatus } from "../types/task";
import { cn } from "../lib/utils";

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  isLoading?: boolean;
}

const statusFilters: Array<TaskStatus | "All"> = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
];

const StatusPill = ({ status }: { status: TaskStatus }) => {
  const styles: Record<TaskStatus, string> = {
    Pending: "bg-status-pending text-status-pending-foreground",
    "In Progress": "bg-status-progress text-status-progress-foreground",
    Completed: "bg-status-completed text-status-completed-foreground",
  };

  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", styles[status])}>
      {status}
    </span>
  );
};

export default function TaskList({
  tasks,
  selectedTaskId,
  onSelectTask,
  isLoading,
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = (task.title || "").toLowerCase();
      const desc = (task.description || "").toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = q === "" || title.includes(q) || desc.includes(q);
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchQuery, statusFilter]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // normalize id (Mongo uses _id)
  const getId = (t: any) => t._id ?? t.id;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-secondary rounded animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-20 bg-secondary rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="pl-10 bg-secondary border-border"
        />
      </div>

      {/* Status Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(filter)}
            className={cn("text-xs", statusFilter !== filter && "bg-secondary hover:bg-accent")}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {tasks.length === 0 ? "No tasks yet. Create your first task!" : "No tasks match your search."}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const id = String(getId(task));
            return (
              <button
                key={id}
                onClick={() => onSelectTask(task)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-colors",
                  "hover:bg-accent",
                  selectedTaskId === id ? "border-primary bg-accent" : "border-border bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <StatusPill status={task.status} />
                </div>

                {task.dueDate && (
                  <p className="text-xs text-muted-foreground mt-2">Due: {formatDate(task.dueDate)}</p>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
