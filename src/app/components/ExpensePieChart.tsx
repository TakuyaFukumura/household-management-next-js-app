'use client';

import React, {useState} from 'react';
import {Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip} from 'recharts';
import {Transaction} from './CsvUploader';

interface Props {
    transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const MIN_PERCENTAGE = 3;

interface ChartEntry {
    name: string;
    value: number;
    percentage: number;
}

function buildChartData(transactions: Transaction[]): ChartEntry[] {
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

function renderActiveShape(props: {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
}) {
    const {cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill} = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
        />
    );
}

function renderCustomLegend(props: {payload?: Array<{color: string; payload: ChartEntry}>}) {
    const {payload = []} = props;
    return (
        <ul className="mt-2 space-y-1 text-sm">
            {payload.map((entry) => (
                <li key={entry.payload.name} className="flex items-center gap-2">
                    <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{backgroundColor: entry.color}}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        {entry.payload.name}：¥{entry.payload.value.toLocaleString()}（{entry.payload.percentage.toFixed(1)}%）
                    </span>
                </li>
            ))}
        </ul>
    );
}

function formatTooltipValue(value: unknown) {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function ExpensePieChart({transactions}: Props) {
    const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
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
    const data = aggregateSmallSlices(rawData, total);

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
            <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(undefined)}
                        isAnimationActive={true}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                        <Label
                            value={`合計 ¥${total.toLocaleString()}`}
                            position="center"
                            style={{fontSize: '14px', fill: isDark ? '#d1d5db' : '#374151'}}
                        />
                    </Pie>
                    <Tooltip formatter={formatTooltipValue}/>
                    <Legend content={renderCustomLegend}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

