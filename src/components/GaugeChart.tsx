// src/components/GaugeChart.tsx
import React from 'react';

interface GaugeChartProps {
  value: number; // 0-100
  size?: number;
  label?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, size = 250, label }) => {
    const clampedValue = Math.min(100, Math.max(0, value));
    const angle = (clampedValue / 100) * 180; // Semicircle
    const radius = size * 0.4;
    const cx = size / 2;
    const cy = size / 2;

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    const endPoint = polarToCartesian(cx, cy, radius, angle);
    const largeArcFlag = '0';

    const pathData = [
        'M', cx - radius, cy,
        'A', radius, radius, 0, largeArcFlag, 1, endPoint.x, endPoint.y,
    ].join(' ');

    const getColor = (val: number) => {
        if (val < 40) return '#ef4444'; // red-500 from tailwind
        if (val < 70) return '#f59e0b'; // amber-500 from tailwind
        return '#22c55e'; // green-500 from tailwind
    };

    const color = getColor(clampedValue);

    return (
        <div style={{ width: size, height: size / 2 + 20, position: 'relative' }}>
            <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`} style={{ overflow: 'visible' }}>
                <path
                    d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
                    fill="none"
                    stroke="#4A4A4A"
                    strokeWidth="25"
                    strokeLinecap="round"
                />
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="25"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease', strokeDasharray: 2 * Math.PI * radius, strokeDashoffset: 0 }}
                />
            </svg>
            <div
                style={{
                    position: 'absolute',
                    top: '60%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    color: '#fff',
                    width: '100%'
                }}
            >
                <div style={{ fontSize: size * 0.18, fontWeight: 'bold', color }}>
                    {Math.round(clampedValue)}
                </div>
                {label && <div style={{ fontSize: size * 0.08, color: '#B3B3B3', marginTop: `-${size * 0.02}px` }}>{label}</div>}
            </div>
        </div>
    );
};

export default GaugeChart;