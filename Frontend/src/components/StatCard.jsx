export default function StatCard({ label, value, delta, direction }) {
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {delta && <div className={`delta ${direction || ''}`}>{delta}</div>}
    </div>
  );
}
