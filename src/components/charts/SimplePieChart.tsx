interface PieChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  size?: number;
  showLegend?: boolean;
}

export function SimplePieChart({ data, size = 120, showLegend = true }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;
  
  const slices = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1)
    };
  });
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          ))}
        </svg>
      </div>
      
      {showLegend && (
        <div className="flex flex-col gap-1">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-600">
                {slice.label}: {slice.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
