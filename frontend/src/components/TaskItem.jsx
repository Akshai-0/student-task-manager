// One row in the list. Receives a task through props and reports button clicks
// back to the parent through the onToggle / onEdit / onDelete functions.
function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const done = task.status === "COMPLETED";
  // Both are "YYYY-MM-DD" strings, so plain string comparison works.
  const overdue = !done && task.dueDate < todayString();

  return (
    <li className={`task ${done ? "done" : ""}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
        <div className="meta">
          <span className="tag">{task.subject}</span>
          <span>Due: {task.dueDate}</span>
          <span className={`status ${done ? "status-done" : "status-pending"}`}>
            {done ? "Completed" : "Pending"}
          </span>
          {overdue && <span className="status status-overdue">Overdue</span>}
        </div>
      </div>
      <div className="task-actions">
        <button onClick={() => onToggle(task)}>{done ? "Reopen" : "Mark done"}</button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button className="danger" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </li>
  );
}
