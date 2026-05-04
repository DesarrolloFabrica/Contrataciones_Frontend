// src/components/GaugeChart.tsx
import React from 'react';

interface GaugeChartProps {
  value: number;
  size?: number;
  label?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, size = 250, label }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const angle = (clampedValue / 100) * 180;
  const radius = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  const polarToCartesian = (centerX: number, centerY: number, rad: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + rad * Math.cos(angleInRadians),
      y: centerY + rad * Math.sin(angleInRadians),
    };
  };

  const endPoint = polarToCartesian(cx, cy, radius, angle);

  const pathData = [
    'M', cx - radius, cy,
    'A', radius, radius, 0, '0', 1, endPoint.x, endPoint.y,
  ].join(' ');

  const getColor = (val: number) => {
    if (val < 40) return '#f43f5e';
    if (val < 70) return '#f59e0b';
    return '#06b6d4';
  };

  const color = getColor(clampedValue);

  return (
    <div style={{ width: size, height: size / 2 + 24, position: 'relative' }}>
      <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="gaugeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1a2332"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <div style={{ fontSize: size * 0.2, fontWeight: 900, color, letterSpacing: '-0.02em' }}>
          {Math.round(clampedValue)}
        </div>
        {label && (
          <div style={{ fontSize: size * 0.07, color: '#64748b', marginTop: '2px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default GaugeChart;
