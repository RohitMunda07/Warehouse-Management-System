export default function StatusBadge({ label, color }) {
  return <span className={`badge badge-${color}`}>{label}</span>;
}
