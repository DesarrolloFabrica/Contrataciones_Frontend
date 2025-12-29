// src/components/RadarChart.tsx
import React from 'react';

interface RadarChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
        }[];
    };
    size?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, size = 250 }) => {
    const { labels, datasets } = data;
    const numAxes = labels.length;
    const angleSlice = (Math.PI * 2) / numAxes;
    const radius = size * 0.35;
    const center = size / 2;
    const scaleLevels = 5;

    const getPoint = (value: number, index: number) => {
        const angle = angleSlice * index - Math.PI / 2;
        const x = center + radius * (value / 100) * Math.cos(angle);
        const y = center + radius * (value / 100) * Math.sin(angle);
        return `${x},${y}`;
    };

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Concentric Polygons (Grid) */}
            {[...Array(scaleLevels)].map((_, i) => {
                const levelRadius = radius * ((i + 1) / scaleLevels);
                const points = labels.map((_, j) => {
                    const angle = angleSlice * j - Math.PI / 2;
                    const x = center + levelRadius * Math.cos(angle);
                    const y = center + levelRadius * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ');
                return <polygon key={i} points={points} fill="none" stroke="#4A4A4A" strokeWidth="1" />;
            })}

            {/* Axes and Labels */}
            {labels.map((label, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const x1 = center;
                const y1 = center;
                const x2 = center + radius * Math.cos(angle);
                const y2 = center + radius * Math.sin(angle);
                const labelX = center + (radius + 25) * Math.cos(angle);
                const labelY = center + (radius + 25) * Math.sin(angle);
                
                const labelParts = label.split('\n');

                return (
                    <g key={label}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#666" strokeWidth="1" />
                        <text
                            x={labelX}
                            y={labelY}
                            fill="#B3B3B3"
                            fontSize="10"
                            textAnchor={labelX > center + 1 ? 'start' : labelX < center - 1 ? 'end' : 'middle'}
                            dominantBaseline="middle"
                        >
                           {labelParts.map((part, index) => (
                              <tspan key={index} x={labelX} dy={index === 0 ? 0 : '1.2em'}>{part}</tspan>
                           ))}
                        </text>
                    </g>
                );
            })}

            {/* Data Polygons */}
            {datasets.map((dataset) => {
                const points = dataset.data.map(getPoint).join(' ');
                return (
                    <polygon
                        key={dataset.label}
                        points={points}
                        fill={dataset.backgroundColor}
                        stroke={dataset.borderColor}
                        strokeWidth={dataset.borderWidth}
                    />
                );
            })}
        </svg>
    );
};

export default RadarChart;
