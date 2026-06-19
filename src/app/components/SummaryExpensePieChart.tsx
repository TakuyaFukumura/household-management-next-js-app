'use client';

import React, {useState} from 'react';
import type {PieSectorShapeProps} from 'recharts';
import {Label, Pie, PieChart, ResponsiveContainer, Sector, Tooltip} from 'recharts';
import type {CategoryAggregation, SummaryDisplayMetric} from '@/lib/aggregation';
import {getRepresentativeValue} from '@/lib/aggregation';

interface Props {
    readonly categories: readonly CategoryAggregation[];
    readonly metric: SummaryDisplayMetric;
}

const COLORS = [
    '#4e79a7',
    '#59a14f',
    '#e15759',
    '#76b7b2',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ac',
    '#499894',
    '#f1ce63',
    '#a0cbe8',
    '#ffbe7d',
    '#8cd17d',
    '#b6992d',
];

const MIN_PERCENTAGE = 3;

interface ChartEntry {
    name: string;
    value: number;
    percentage: number;
    fill: string;
}

function formatCurrency(value: number): string {
    return `¥${Math.round(value).toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
    return typeof value === 'number' ? formatCurrency(value) : String(value ?? '');
}

function aggregateSmallSlices(entries: readonly ChartEntry[], total: number): ChartEntry[] {
    const main = entries.filter((entry) => entry.percentage >= MIN_PERCENTAGE);
    const small = entries.filter((entry) => entry.percentage < MIN_PERCENTAGE);

    if (small.length === 0) {
        return [...entries].sort((a, b) => b.value - a.value);
    }

    const otherValue = small.reduce((sum, entry) => sum + entry.value, 0);
    const existingOther = main.find((entry) => entry.name === 'その他');

    if (existingOther) {
        return main.map((entry) => entry.name === 'その他'
            ? {
                ...entry,
                value: entry.value + otherValue,
                percentage: total > 0 ? ((entry.value + otherValue) / total) * 100 : 0,
            }
            : entry).sort((a, b) => b.value - a.value);
    }

    return [
        ...main,
        {
            name: 'その他',
            value: otherValue,
            percentage: total > 0 ? (otherValue / total) * 100 : 0,
            fill: COLORS[main.length % COLORS.length],
        },
    ].sort((a, b) => b.value - a.value);
}

function renderPieShape(props: PieSectorShapeProps) {
    const {cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill = '#808080', isActive} = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={isActive ? outerRadius + 10 : outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
}

export default function SummaryExpensePieChart({categories, metric}: Readonly<Props>) {
    const [isDark, setIsDark] = useState(false);

    React.useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
        return () => observer.disconnect();
    }, []);

    const rawData = categories
        .map((category, index) => ({
            name: category.category,
            value: getRepresentativeValue(category, metric),
            percentage: 0,
            fill: COLORS[index % COLORS.length],
        }))
        .filter((category) => category.value > 0)
        .sort((a, b) => b.value - a.value);

    const total = rawData.reduce((sum, entry) => sum + entry.value, 0);
    const withPercentage = rawData.map((entry) => ({
        ...entry,
        percentage: total > 0 ? (entry.value / total) * 100 : 0,
    }));
    const data = aggregateSmallSlices(withPercentage, total);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 dark:text-gray-500">支出データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">支出カテゴリ構成比</h2>
            <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        shape={renderPieShape}
                        isAnimationActive={true}
                    >
                        <Label
                            value={`合計 ${formatCurrency(total)}`}
                            position="center"
                            style={{fontSize: '14px', fill: isDark ? '#d1d5db' : '#374151'}}
                        />
                    </Pie>
                    <Tooltip formatter={formatTooltipValue}/>
                </PieChart>
            </ResponsiveContainer>
            <ul className="mt-3 space-y-1 text-sm">
                {data.map((entry) => (
                    <li key={entry.name} className="flex items-center gap-2">
                        <span
                            className="inline-block w-3 h-3 rounded-full shrink-0"
                            style={{backgroundColor: entry.fill}}
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                            {entry.name}：{formatCurrency(entry.value)}（{entry.percentage.toFixed(1)}%）
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
