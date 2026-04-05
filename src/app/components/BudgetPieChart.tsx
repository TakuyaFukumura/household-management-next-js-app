'use client';

import React, {useState} from 'react';
import type {PieSectorShapeProps} from 'recharts';
import {Label, Pie, PieChart, ResponsiveContainer, Sector, Tooltip} from 'recharts';
import type {BudgetEntry} from '@/lib/budget';

interface Props {
    readonly budgetEntries: readonly BudgetEntry[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MIN_PERCENTAGE = 3;

interface ChartEntry {
    name: string;
    value: number;
    percentage: number;
}

interface ChartEntryWithFill extends ChartEntry {
    fill: string;
}

function buildChartData(budgetEntries: readonly BudgetEntry[]): ChartEntry[] {
    const expenses = budgetEntries.filter((e) => e.type === '支出');
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return expenses
        .map((e) => ({
            name: e.category,
            value: e.amount,
            percentage: total > 0 ? (e.amount / total) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);
}

function aggregateSmallSlices(entries: ChartEntry[], total: number): ChartEntry[] {
    const main = entries.filter((e) => e.percentage >= MIN_PERCENTAGE);
    const small = entries.filter((e) => e.percentage < MIN_PERCENTAGE);

    if (small.length === 0) return main;

    const otherValue = small.reduce((sum, e) => sum + e.value, 0);
    const existingOther = main.find((e) => e.name === 'その他');

    if (existingOther) {
        existingOther.value += otherValue;
        existingOther.percentage = total > 0 ? (existingOther.value / total) * 100 : 0;
        return main;
    }

    return [
        ...main,
        {
            name: 'その他',
            value: otherValue,
            percentage: total > 0 ? (otherValue / total) * 100 : 0,
        },
    ];
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

export default function BudgetPieChart({budgetEntries}: Readonly<Props>) {
    const [isDark, setIsDark] = useState(false);

    React.useEffect(() => {
        const update = () => setIsDark(document.documentElement.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
        return () => observer.disconnect();
    }, []);

    const rawData = buildChartData(budgetEntries);
    const total = rawData.reduce((sum, e) => sum + e.value, 0);
    const data: ChartEntryWithFill[] = aggregateSmallSlices(rawData, total)
        .sort((a, b) => b.value - a.value)
        .map((entry, index) => ({
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
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">予算割合</h2>
            <ResponsiveContainer width="100%" height={250}>
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
            <ul className="mt-4 space-y-1 text-sm">
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
