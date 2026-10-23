// Shows the three counters returned by GET /api/tasks/stats.
export default function TaskSummary({ stats }) {
  const items = [
    { label: "Total", value: stats?.total },
    { label: "Pending", value: stats?.pending },
    { label: "Completed", value: stats?.completed },
  ];
  return (
    <div className="summary">
      {items.map((item) => (
        <div className="summary-box" key={item.label}>
          <span className="summary-number">{item.value ?? "–"}</span>
          <span className="summary-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
