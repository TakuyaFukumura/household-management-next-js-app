'use client';

import React, {useState} from 'react';
import type {PieSectorShapeProps} from 'recharts';
import {Label, Pie, PieChart, ResponsiveContainer, Sector, Tooltip} from 'recharts';
import type {Transaction} from '@/lib/csv';

interface Props {
    readonly transactions: readonly Transaction[];
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
}

interface ChartEntryWithFill extends ChartEntry {
    fill: string;
}

function buildChartData(transactions: readonly Transaction[]): ChartEntry[] {
    const expenses = transactions.filter((t) => t.type === '支出');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();
    for (const t of expenses) {
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }

    return Array.from(map.entries())
        .map(([name, value]) => ({
            name,
            value,
            percentage: total > 0 ? (value / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

function aggregateSmallSlices(entries: ChartEntry[], total: number): ChartEntry[] {
    const main = entries.filter((e) => e.percentage >= MIN_PERCENTAGE);
    const small = entries.filter((e) => e.percentage < MIN_PERCENTAGE);

    let result: ChartEntry[];

    if (small.length === 0) {
        result = main;
    } else {
        const otherValue = small.reduce((sum, e) => sum + e.value, 0);
        const existingOther = main.find((e) => e.name === 'その他');

        if (existingOther) {
            existingOther.value += otherValue;
            existingOther.percentage = total > 0 ? (existingOther.value / total) * 100 : 0;
            result = main;
        } else {
            result = [
                ...main,
                {
                    name: 'その他',
                    value: otherValue,
                    percentage: total > 0 ? (otherValue / total) * 100 : 0,
                },
            ];
        }
    }

    return result.sort((a, b) => b.value - a.value);
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

function formatTooltipValue(value: unknown): string {
    if (typeof value === 'number') return `¥${value.toLocaleString()}`;
    if (typeof value === 'string') return value;
    return '';
}

export default function ExpensePieChart({transactions}: Readonly<Props>) {
    const [isDark, setIsDark] = useState(false);

    React.useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
        return () => observer.disconnect();
    }, []);

    const rawData = buildChartData(transactions);
    const total = rawData.reduce((sum, e) => sum + e.value, 0);
    const data: ChartEntryWithFill[] = aggregateSmallSlices(rawData, total).map((entry, index) => ({
        ...entry,
        fill: COLORS[index % COLORS.length],
    }));

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 dark:text-gray-500">データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">支出割合</h2>
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
                            value={`合計 ¥${total.toLocaleString()}`}
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
                            {entry.name}：¥{entry.value.toLocaleString()}（{entry.percentage.toFixed(1)}%）
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
