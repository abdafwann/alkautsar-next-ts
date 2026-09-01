'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface SparklineMetricProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  colorScheme: 'green' | 'blue' | 'orange' | 'purple';
  sparklineData?: number[];
}

const colorMap = {
  green: {
    stroke: '#10B981',
    fill: 'url(#gradient-green)',
    pillBg: 'text-emerald-600',
    dotBg: 'bg-emerald-500',
  },
  blue: {
    stroke: '#3B82F6',
    fill: 'url(#gradient-blue)',
    pillBg: 'text-blue-600',
    dotBg: 'bg-blue-500',
  },
  orange: {
    stroke: '#F97316',
    fill: 'url(#gradient-orange)',
    pillBg: 'text-orange-600',
    dotBg: 'bg-orange-500',
  },
  purple: {
    stroke: '#A855F7',
    fill: 'url(#gradient-purple)',
    pillBg: 'text-purple-600',
    dotBg: 'bg-purple-500',
  },
};

export default function SparklineMetricCard({
  title,
  value,
  change,
  isPositive,
  colorScheme,
  sparklineData = [15, 20, 18, 26, 22, 35, 30, 42, 38, 48],
}: SparklineMetricProps) {
  const scheme = colorMap[colorScheme] || colorMap.green;

  // Generate SVG path points for sparkline
  const width = 110;
  const height = 40;
  const min = Math.min(...sparklineData);
  const max = Math.max(...sparklineData);
  const range = max - min || 1;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Create smooth bezier curve
  const pathD = sparklineData.reduce((acc, val, idx, arr) => {
    const x = (idx / (arr.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    if (idx === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;

    const prevX = ((idx - 1) / (arr.length - 1)) * width;
    const prevY = height - ((arr[idx - 1] - min) / range) * (height - 10) - 5;
    const cpX1 = prevX + (x - prevX) / 2;
    const cpY1 = prevY;
    const cpX2 = prevX + (x - prevX) / 2;
    const cpY2 = y;
    return `${acc} C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, '');

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100/90 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between group">
      <div>
        <p className="text-[13px] font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-1 tabular-nums">
          {value}
        </h3>
      </div>

      <div className="flex items-center justify-between mt-4 pt-1">
        <div className={`flex items-center gap-0.5 text-xs font-semibold ${scheme.pillBg}`}>
          {isPositive ? (
            <span className="flex items-center gap-0.5">
              <span>+</span> {change}
            </span>
          ) : (
            <span className="flex items-center gap-0.5 text-rose-600">
              <span>-</span> {change}
            </span>
          )}
        </div>

        {/* Mini SVG Sparkline */}
        <div className="w-[100px] h-[34px] flex items-center justify-end">
          <svg
            width="100"
            height="34"
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id={`gradient-${colorScheme}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={scheme.stroke} stopOpacity="0.3" />
                <stop offset="100%" stopColor={scheme.stroke} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L ${width} ${height} L 0 ${height} Z`}
              fill={scheme.fill}
            />
            <path
              d={pathD}
              fill="none"
              stroke={scheme.stroke}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
