interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: BarChartProps) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <div style={{ height, display: 'flex', alignItems: 'flex-end', gap: '8px', width: '100%', padding: '20px 0 0 0' }}>
      {data.map((item, idx) => {
        const hPct = (item.value / maxVal) * 100;
        return (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              {item.value}
            </div>
            <div
              style={{
                width: '100%',
                minHeight: '4px',
                height: `${hPct}%`,
                backgroundColor: item.color || '#3b82f6',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease'
              }}
            />
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '6px', textAlign: 'center' }}>
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
