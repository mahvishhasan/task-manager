import { useEffect, useMemo, useState } from "react";
import { fetchTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { TaskList } from "../components/TaskList";
import { TaskForm } from "../components/TaskForm";
import { TaskDetails } from "../components/TaskDetails";
import { ProgressBar } from "../components/ProgressBar";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const refresh = async () => {
    const data = await fetchTasks({ search, status: statusFilter });
    setTasks(data);
    if (selected) setSelected(data.find((t) => t._id === selected._id) || null);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "Completed").length,
    [tasks]
  );

  const handleSubmit = async (payload) => {
    if (editing) {
      await updateTask(editing._id, payload);
      setEditing(null);
    } else {
      await createTask(payload);
    }
    await refresh();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    if (selected?._id === id) setSelected(null);
    if (editing?._id === id) setEditing(null);
    await refresh();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6 space-y-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-3xl font-black">Task Manager</div>
            <div className="text-gray-600">Create, track, and finish tasks on time.</div>
          </div>

          <div className="w-full md:w-[360px]">
            <ProgressBar completed={completedCount} total={tasks.length} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TaskForm
            onSubmit={handleSubmit}
            editingTask={editing}
            onCancel={() => setEditing(null)}
          />

          <div className="md:col-span-2 space-y-3">
            <div className="p-4 rounded-2xl border border-gray-200 flex gap-2 flex-wrap">
              <input
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                placeholder="Search title/description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-black"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold">Tasks</div>
                  {selected && (
                    <button
                      className="text-sm px-3 py-1 rounded-xl border border-gray-300 hover:border-black"
                      onClick={() => setEditing(selected)}
                    >
                      Edit selected
                    </button>
                  )}
                </div>

                <TaskList
                  tasks={tasks}
                  selectedId={selected?._id}
                  onSelect={setSelected}
                  onDelete={handleDelete}
                />
              </div>

              <TaskDetails task={selected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
