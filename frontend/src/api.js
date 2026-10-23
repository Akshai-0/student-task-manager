// All communication with the Express backend lives in this one file.
// Components never call fetch() directly; they call these functions.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Error that carries the HTTP status and per-field messages from the backend.
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || {};
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    // fetch only throws when the server cannot be reached at all.
    throw new ApiError(
      "Cannot reach the server. Check that the backend is running on port 5000.",
      0
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    /* response had no JSON body */
  }

  if (!response.ok) {
    throw new ApiError(data?.error || "Something went wrong", response.status, data?.details);
  }
  return data;
}

export function fetchTasks(status) {
  const query = status && status !== "ALL" ? `?status=${status}` : "";
  return request(`/tasks${query}`);
}

export const fetchStats = () => request("/tasks/stats");

export const createTask = (task) =>
  request("/tasks", { method: "POST", body: JSON.stringify(task) });

export const updateTask = (id, task) =>
  request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) });

export const setTaskStatus = (id, status) =>
  request(`/tasks/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: "DELETE" });
