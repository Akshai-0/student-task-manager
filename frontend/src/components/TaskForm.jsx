// Form used for BOTH adding and editing a task.
// "Controlled inputs": React state is the single source of truth for each field.
import { useState } from "react";
import { ApiError } from "../api.js";

const MAX = { title: 120, subject: 60, description: 1000 };

// Same rules as the backend (utils/validation.js) so users get instant feedback.
// The backend still re-checks everything: never trust the browser alone.
function validate(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = "Title is required";
  else if (values.title.trim().length > MAX.title) errors.title = `Max ${MAX.title} characters`;
  if (!values.subject.trim()) errors.subject = "Subject is required";
  else if (values.subject.trim().length > MAX.subject) errors.subject = `Max ${MAX.subject} characters`;
  if (values.description.length > MAX.description) errors.description = `Max ${MAX.description} characters`;
  if (!values.dueDate) errors.dueDate = "Due date is required";
  return errors;
}

export default function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: editingTask?.title ?? "",
    description: editingTask?.description ?? "",
    subject: editingTask?.subject ?? "",
    dueDate: editingTask?.dueDate ?? "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setValues({ ...values, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page
    const found = validate(values);
    setErrors(found);
    setFormError("");
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(values);
      if (!editingTask) setValues({ title: "", description: "", subject: "", dueDate: "" });
    } catch (err) {
      // Show the backend's field-by-field messages if it sent any.
      if (err instanceof ApiError && Object.keys(err.details).length > 0) setErrors(err.details);
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && <div className="alert" role="alert">{formError}</div>}

      <label>
        Title *
        <input name="title" value={values.title} onChange={handleChange} maxLength={MAX.title + 20} />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </label>

      <label>
        Subject *
        <input name="subject" value={values.subject} onChange={handleChange} placeholder="e.g. Mathematics" />
        {errors.subject && <span className="field-error">{errors.subject}</span>}
      </label>

      <label>
        Due date *
        <input type="date" name="dueDate" value={values.dueDate} onChange={handleChange} />
        {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
      </label>

      <label>
        Description
        <textarea name="description" rows="3" value={values.description} onChange={handleChange} />
        {errors.description && <span className="field-error">{errors.description}</span>}
      </label>

      <div className="form-actions">
        <button type="submit" className="primary" disabled={saving}>
          {saving ? "Saving…" : editingTask ? "Save changes" : "Add task"}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel} disabled={saving}>Cancel</button>
        )}
      </div>
    </form>
  );
}
