import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTasks, createTask, updateTask, deleteTask } from "@/api/tasks";

import TaskForm from "@/components/TaskForm";
import TaskList from "@/components/TaskList";
import TaskDetails from "@/components/TaskDetails";
import ProgressBar from "@/components/ProgressBar";

import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

export default function Index() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const createMutation = useMutation<Task, Error, CreateTaskInput>({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast({ title: "Task created successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to create task", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation<Task, Error, UpdateTaskInput>({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
      if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
      toast({ title: "Task updated successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to update task", description: err.message, variant: "destructive" });
    },
  });
  

  const deleteMutation = useMutation<string, Error, string>({
    mutationFn: deleteTask,
    onSuccess: (_deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (selectedTask?.id === _deletedId) setSelectedTask(null);
      if (editingTask?.id === _deletedId) setEditingTask(null);
      toast({ title: "Task deleted successfully" });
    },
    onError: (err) => {
      toast({ title: "Failed to delete task", description: err.message, variant: "destructive" });
    },
  });

  const handleSubmit = async (data: CreateTaskInput) => {
    if (editingTask) {
      await updateMutation.mutateAsync({ id: editingTask.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    setEditingTask(null);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3 px-6">
          <h1 className="text-2xl font-bold text-destructive">
            Error Loading Tasks
          </h1>
          <p className="text-muted-foreground">
            {(error as Error).message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">Task Manager</h1>
      </header>

      {/* Divider (replaces broken <Separator />) */}
      <div className="h-px bg-border" />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <ProgressBar tasks={tasks as Task[]} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-4">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>

              <TaskForm
                editingTask={editingTask}
                onSubmit={handleSubmit}
                onCancel={handleCancelEdit}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </div>

          {/* Right Column - Tasks + Details */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task List */}
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Tasks
              </h2>

              <TaskList
                tasks={tasks as Task[]}
                selectedTaskId={selectedTask?.id ?? null}
                onSelectTask={handleSelectTask}
                isLoading={isLoading}
              />
            </div>

            {/* Task Details */}
            <div className="bg-card rounded-lg border border-border p-6 min-h-[300px]">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Details
              </h2>

              <TaskDetails
                task={selectedTask}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteMutation.isPending}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
