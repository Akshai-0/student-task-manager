// Three buttons: All / Pending / Completed. The parent stores the choice.
const OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
];

export default function FilterBar({ value, onChange }) {
  return (
    <div className="filter-bar" role="group" aria-label="Filter tasks by status">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={value === opt.value ? "active" : ""}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
