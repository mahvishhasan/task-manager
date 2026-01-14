import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Calendar, Clock } from "lucide-react";
import type { Task, TaskStatus } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskDetailsProps {
  task: Task | null;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const styles = {
    Pending: "bg-status-pending text-status-pending-foreground",
    "In Progress": "bg-status-progress text-status-progress-foreground",
    Completed: "bg-status-completed text-status-completed-foreground",
  };

  return (
    <span className={cn("px-3 py-1 rounded-md text-sm font-medium", styles[status])}>
      {status}
    </span>
  );
};

const TaskDetails = ({ task, onEdit, onDelete, isDeleting }: TaskDetailsProps) => {
  if (!task) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a task to view details</p>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Not set";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-foreground break-words">
            {task.title}
          </h2>
          <div className="mt-2">
            <StatusBadge status={task.status} />
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="icon" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Task</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{task.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(task.id)}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </h3>
        <p className="text-foreground whitespace-pre-wrap">
          {task.description || "No description provided."}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Due Date:</span>
          <span className="text-foreground">{formatDate(task.dueDate)}</span>
        </div>
        {task.createdAt && (
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span className="text-foreground">{formatDate(task.createdAt)}</span>
          </div>
        )}
        {task.updatedAt && (
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="text-foreground">{formatDate(task.updatedAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
