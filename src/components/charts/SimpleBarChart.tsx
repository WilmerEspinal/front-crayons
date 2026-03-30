interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showValues?: boolean;
}

export function SimpleBarChart({ data, height = 120, showValues = true }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 20);
          const color = item.color || '#8b5cf6';
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0">
              <div className="w-full flex flex-col items-center">
                {showValues && (
                  <span className="text-xs font-medium mb-1 text-gray-600">
                    {item.value.toLocaleString()}
                  </span>
                )}
                <div
                  className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: color,
                    minHeight: '4px'
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center truncate w-full">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
