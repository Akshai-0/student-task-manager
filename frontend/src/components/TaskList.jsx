// Decides what to show: loading message, empty message, or the list of tasks.
import TaskItem from "./TaskItem.jsx";

export default function TaskList({ tasks, loading, filter, onToggle, onEdit, onDelete }) {
  if (loading) return <p className="muted">Loading tasks…</p>;

  if (tasks.length === 0) {
    return (
      <p className="muted">
        {filter === "ALL"
          ? "No tasks yet. Add your first task using the form."
          : `No ${filter.toLowerCase()} tasks.`}
      </p>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
