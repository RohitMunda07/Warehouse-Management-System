import { getHealthPercent } from '../utils/stock';

export default function HealthBar({ quantity, maxStock, color, width }) {
  const pct = getHealthPercent(quantity, maxStock);
  return (
    <div
      className="health-bar"
      style={width ? { width } : undefined}
      role="img"
      aria-label={`Stock level ${pct} percent of maximum`}
    >
      <span style={{ width: `${pct}%`, background: `var(--${color}-500)` }} />
    </div>
  );
}
