import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { Task, TaskStatus, CreateTaskInput } from "@/types/task";

interface TaskFormProps {
  editingTask: Task | null;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm = ({ editingTask, onSubmit, onCancel, isLoading }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("Pending");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStatus(editingTask.status);
      setDueDate(editingTask.dueDate ? editingTask.dueDate.split("T")[0] : "");
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("Pending");
    setDueDate("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
    });

    if (!editingTask) {
      resetForm();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          className="bg-secondary border-border"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
          className="bg-secondary border-border resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(val) => setStatus(val as TaskStatus)}>
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="bg-secondary border-border"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : editingTask ? "Save Changes" : "Create Task"}
        </Button>
        {editingTask && (
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
