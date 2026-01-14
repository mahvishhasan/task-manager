import { useEffect, useMemo, useState } from "react";

const STATUSES = ["Pending", "In Progress", "Completed"];

function formatDateInputValue(date) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toIsoOrEmpty(yyyyMmDd) {
  // backend usually accepts ISO date; send empty if not provided
  if (!yyyyMmDd) return "";
  const d = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Create / Edit form state
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState(formatDateInputValue(new Date()));

  // Search + Filter
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const selectedTask = useMemo(
    () => tasks.find((t) => t._id === selectedId) || null,
    [tasks, selectedId]
  );

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === "Completed").length,
    [tasks]
  );
  const completionPct = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((completedCount / tasks.length) * 100);
  }, [tasks.length, completedCount]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => (statusFilter === "All" ? true : t.status === statusFilter))
      .filter((t) => {
        if (!q) return true;
        const hay = `${t.title || ""} ${t.description || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        // soonest due date first; no due dates go last
        const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return ad - bd;
      });
  }, [tasks, query, statusFilter]);

  async function api(path, options = {}) {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || `HTTP ${res.status}`);
    }
    return data;
  }

  async function refresh(selectAfter = null) {
    try {
      setError("");
      const data = await api("/api/tasks");
      setTasks(Array.isArray(data) ? data : []);
      if (selectAfter) setSelectedId(selectAfter);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetFormToCreate() {
    setMode("create");
    setTitle("");
    setDescription("");
    setStatus("Pending");
    setDueDate(formatDateInputValue(new Date()));
  }

  function loadFormForEdit(task) {
    setMode("edit");
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setStatus(task?.status || "Pending");
    setDueDate(formatDateInputValue(task?.dueDate || ""));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!title.trim()) throw new Error("Title is required.");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: toIsoOrEmpty(dueDate) || null,
      };

      if (mode === "create") {
        await api("/api/tasks", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        await refresh();
        resetFormToCreate();
      } else {
        if (!selectedTask?._id) throw new Error("No task selected to edit.");
        await api(`/api/tasks/${selectedTask._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        await refresh(selectedTask._id);
      }
    } catch (e2) {
      setError(String(e2?.message || e2));
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(taskId) {
    if (!taskId) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/tasks/${taskId}`, { method: "DELETE" });
      const nextSelected = selectedId === taskId ? null : selectedId;
      await refresh(nextSelected);
      if (selectedId === taskId) resetFormToCreate();
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  const pillClasses = (s) => {
    if (s === "Completed") return "bg-emerald-950/60 text-emerald-200 border-emerald-900";
    if (s === "In Progress") return "bg-amber-950/60 text-amber-200 border-amber-900";
    return "bg-slate-900/60 text-slate-200 border-slate-800";
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">📝 Task Manager</h1>
            <p className="mt-1 text-sm text-slate-400">
              Create, track, and complete tasks. Backed by your API at <span className="text-slate-300">/api/tasks</span>.
            </p>
          </div>

          {/* Progress */}
          <div className="w-full sm:w-[360px] rounded-xl border border-slate-800 bg-[#0f1620] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Completion</span>
              <span className="text-sm text-slate-200">{completionPct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-slate-200"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {completedCount} of {tasks.length} completed
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Main */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: List */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f1620] p-4 lg:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex w-full gap-2">
                <input
                  className="w-full rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-600"
                  placeholder="Search tasks by title/description…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  className="w-[160px] rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="rounded-xl border border-slate-700 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-60"
                onClick={() => refresh(selectedId)}
                disabled={busy}
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-sm text-slate-400">Loading tasks…</div>
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-[#0b0f14] p-4 text-sm text-slate-400">
                No tasks found. Create one on the right.
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredTasks.map((t) => {
                  const isSelected = t._id === selectedId;
                  return (
                    <li key={t._id}>
                      <button
                        onClick={() => {
                          setSelectedId(t._id);
                          loadFormForEdit(t);
                        }}
                        className={[
                          "w-full rounded-2xl border p-4 text-left transition",
                          isSelected
                            ? "border-slate-500 bg-[#0b0f14]"
                            : "border-slate-800 bg-[#0b0f14] hover:border-slate-600",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold">
                              {t.title}
                            </div>
                            {t.description ? (
                              <div className="mt-1 line-clamp-2 text-sm text-slate-400">
                                {t.description}
                              </div>
                            ) : (
                              <div className="mt-1 text-sm text-slate-500">
                                No description
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <span
                              className={[
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                                pillClasses(t.status),
                              ].join(" ")}
                            >
                              {t.status}
                            </span>

                            <div className="text-xs text-slate-400">
                              Due:{" "}
                              {t.dueDate
                                ? new Date(t.dueDate).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(t._id);
                              loadFormForEdit(t);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-xl border border-red-900/50 px-3 py-1.5 text-xs text-red-200 hover:border-red-700 disabled:opacity-60"
                            disabled={busy}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(t._id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Right: Form */}
          <div className="rounded-2xl border border-slate-800 bg-[#0f1620] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">
                  {mode === "create" ? "Create" : "Edit"} task
                </div>
                <div className="text-lg font-semibold">
                  {mode === "create" ? "New task" : "Update task"}
                </div>
              </div>

              {mode === "edit" && (
                <button
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
                  onClick={() => {
                    setSelectedId(null);
                    resetFormToCreate();
                  }}
                >
                  New
                </button>
              )}
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">Title</label>
                <input
                  className="w-full rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-600"
                  placeholder="e.g., Finish Week 1 API"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-400">Description</label>
                <textarea
                  className="w-full resize-none rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-slate-600"
                  rows={4}
                  placeholder="Optional notes…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Status</label>
                  <select
                    className="w-full rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-400">Due date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-slate-800 bg-[#0b0f14] px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-600"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-60"
              >
                {busy
                  ? "Saving…"
                  : mode === "create"
                  ? "Add task"
                  : "Save changes"}
              </button>

              {mode === "edit" && selectedTask?._id && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onDelete(selectedTask._id)}
                  className="w-full rounded-xl border border-red-900/50 px-4 py-2 text-sm font-semibold text-red-200 hover:border-red-700 disabled:opacity-60"
                >
                  Delete task
                </button>
              )}

              <div className="pt-2 text-xs text-slate-500">
                Tip: If you’re using a Vite proxy, keep your API calls as <span className="text-slate-300">/api/…</span>.
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-slate-500">
          Backend endpoints: <span className="text-slate-300">GET/POST /api/tasks</span>,{" "}
          <span className="text-slate-300">GET/PUT/DELETE /api/tasks/:id</span>
        </div>
      </div>
    </div>
  );
}
