interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  height?: number;
  color?: string;
  showDots?: boolean;
}

export function SimpleLineChart({ data, height = 80, color = '#8b5cf6', showDots = true }: LineChartProps) {
  if (!data || data.length === 0) {
    return <div className="w-full flex items-center justify-center text-gray-400 text-xs italic" style={{ height: `${height}px` }}>No hay datos</div>;
  }

  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = (maxValue - minValue) || 1;
  const dataLength = data.length;

  const points = data.map((item, index) => {
    const x = dataLength > 1 ? (index / (dataLength - 1)) * 100 : 50;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full">
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Line */}
          {dataLength > 1 && (
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          )}

          {/* Dots */}
          {showDots && data.map((item, index) => {
            const x = dataLength > 1 ? (index / (dataLength - 1)) * 100 : 50;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                fill={color}
                className="drop-shadow-sm"
              />
            );
          })}
        </svg>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-gray-500 text-center">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
