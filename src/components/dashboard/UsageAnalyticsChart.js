import styles from '@/styles/dashboard.module.css';

export default function UsageAnalyticsChart({ chartData }) {
  const maxChartValue = Math.max(...chartData.map(d => d.count), 5); 
  const chartWidth = 500;
  const chartHeight = 200;
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (d.count / maxChartValue) * (chartHeight - 40) - 20; 
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className={`glass-panel ${styles.chartCard}`}>
      <div className={styles.chartTitleRow}>
        <h3 style={{ fontSize: '1.25rem' }}>Usage Analytics (Last 7 Days)</h3>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Total: {chartData.reduce((a, b) => a + b.count, 0)} requests
        </span>
      </div>

      <div className={styles.chartContainer}>
        <svg className={styles.chartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
          <defs>
            {}
            <linearGradient id="chartGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
            {}
            <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.15)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
            </linearGradient>
          </defs>

          {}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = 20 + ratio * (chartHeight - 40);
            return (
              <line key={i} x1="0" y1={y} x2={chartWidth} y2={y} className={styles.chartGridLine} />
            );
          })}

          {}
          <path d={areaPath} className={styles.chartArea} />

          {}
          <path d={linePath} className={styles.chartPath} />

          {}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" className={styles.chartDataPoint} />
              <text x={p.x} y={chartHeight + 15} textAnchor="middle" className={styles.chartAxisText}>
                {new Date(p.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </text>
              {}
              <text x={p.x} y={p.y - 8} textAnchor="middle" className={styles.chartAxisText} style={{ fill: 'var(--text-main)', fontSize: '9px', fontWeight: 'bold' }}>
                {p.count}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
