import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

const API_BASE = "/api/tasks";

function normalizeTask(t: any): Task {
  return {
    id: String(t.id ?? t._id ?? ""),
    title: String(t.title ?? ""),
    description: String(t.description ?? ""),
    status: (t.status ?? "Pending") as Task["status"],
    dueDate: t.dueDate ? String(t.dueDate) : "",
    createdAt: t.createdAt ? String(t.createdAt) : undefined,
    updatedAt: t.updatedAt ? String(t.updatedAt) : undefined,
  };
}

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // backend might return html or plain text
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      text ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

const baseFetchInit: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(API_BASE, {
    credentials: "include",
  });
  const data = await readJson<any>(res);
  return Array.isArray(data) ? data.map(normalizeTask) : [];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(API_BASE, {
    ...baseFetchInit,
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await readJson<any>(res);
  return normalizeTask(data);
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const { id, ...patch } = input;

  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    ...baseFetchInit,
    method: "PUT",
    body: JSON.stringify(patch),
  });

  const data = await readJson<any>(res);
  return normalizeTask(data);
}

export async function deleteTask(id: string): Promise<string> {
  const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    credentials: "include",
    method: "DELETE",
  });

  // if backend returns JSON, this will parse it; if empty, it returns null
  await readJson<any>(res).catch(() => null);

  return id;
}
