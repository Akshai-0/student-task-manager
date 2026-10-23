// App is the "parent" component. It owns the data (state) and talks to the
// backend through api.js. Child components only display data and report events.
import { useCallback, useEffect, useState } from "react";
import * as api from "./api.js";
import TaskSummary from "./components/TaskSummary.jsx";
import TaskForm from "./components/TaskForm.jsx";
import FilterBar from "./components/FilterBar.jsx";
import TaskList from "./components/TaskList.jsx";

export default function App() {
  const [tasks, setTasks] = useState([]); //          tasks returned by the database
  const [stats, setStats] = useState(null); //        { total, pending, completed }
  const [filter, setFilter] = useState("ALL"); //     ALL | PENDING | COMPLETED
  const [loading, setLoading] = useState(true); //    true while waiting for the API
  const [error, setError] = useState(""); //          page-level error message
  const [editingTask, setEditingTask] = useState(null); // task being edited, or null

  // Fetch tasks + statistics from the backend (which reads PostgreSQL).
  const loadData = useCallback(async () => {
    try {
      setError("");
      const [taskData, statsData] = await Promise.all([api.fetchTasks(filter), api.fetchStats()]);
      setTasks(taskData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Runs on first load and again whenever the filter changes.
  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  // Called by TaskForm. Throws on failure so the form can show field errors.
  async function handleSave(formData) {
    if (editingTask) {
      await api.updateTask(editingTask.id, formData);
      setEditingTask(null);
    } else {
      await api.createTask(formData);
    }
    await loadData(); // re-read from the database so the screen matches it
  }

  async function handleToggle(task) {
    try {
      const next = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
      await api.setTaskStatus(task.id, next);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.deleteTask(task.id);
      if (editingTask?.id === task.id) setEditingTask(null);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Student Task Manager</h1>
        <p className="subtitle">Keep track of your assignments in one place.</p>
      </header>

      <TaskSummary stats={stats} />

      {error && (
        <div className="alert" role="alert">
          {error} <button onClick={loadData}>Retry</button>
        </div>
      )}

      <div className="layout">
        <section className="card">
          <h2>{editingTask ? "Edit task" : "Add a task"}</h2>
          <TaskForm
            key={editingTask ? editingTask.id : "new"}
            editingTask={editingTask}
            onSubmit={handleSave}
            onCancel={() => setEditingTask(null)}
          />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Your tasks</h2>
            <FilterBar value={filter} onChange={setFilter} />
          </div>
          <TaskList
            tasks={tasks}
            loading={loading}
            filter={filter}
            onToggle={handleToggle}
            onEdit={setEditingTask}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </div>
  );
}
