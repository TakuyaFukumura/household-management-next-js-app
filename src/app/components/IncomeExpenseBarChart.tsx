'use client';

import React from 'react';
import {Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import {Transaction} from './CsvUploader';

interface Props {
    transactions: Transaction[];
}

interface ChartEntry {
    name: string;
    value: number;
}

const BAR_COLORS: Record<string, string> = {
    収入: '#22c55e',
    支出: '#ef4444',
};

const LEGEND_PAYLOAD = Object.entries(BAR_COLORS).map(([name, color]) => ({
    value: name,
    type: 'square' as const,
    color,
}));

function buildChartData(transactions: Transaction[]): ChartEntry[] {
    const totalIncome = transactions
        .filter((t) => t.type === '収入')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === '支出')
        .reduce((sum, t) => sum + t.amount, 0);

    return [
        {name: '収入', value: totalIncome},
        {name: '支出', value: totalExpense},
    ];
}

function formatXAxis(value: number): string {
    return `¥${value.toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function IncomeExpenseBarChart({transactions}: Props) {
    const data = buildChartData(transactions);
    const isEmpty = data.every((d) => d.value === 0);

    if (isEmpty) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-32">
                <p className="text-gray-400 dark:text-gray-500">データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">収支比較</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{top: 5, right: 30, left: 20, bottom: 5}}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563"/>
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{fill: '#6B7280'}}
                        axisLine={{stroke: '#4B5563'}}
                        tickLine={{stroke: '#4B5563'}}
                    />
                    <XAxis
                        type="number"
                        tickFormatter={formatXAxis}
                        tick={{fill: '#6B7280'}}
                        axisLine={{stroke: '#4B5563'}}
                        tickLine={{stroke: '#4B5563'}}
                    />
                    <Tooltip
                        formatter={formatTooltipValue}
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            color: '#F9FAFB',
                            border: '1px solid #4B5563',
                        }}
                    />
                    <Legend
                        content={() => (
                            <div style={{display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px'}}>
                                {LEGEND_PAYLOAD.map((entry) => (
                                    <span key={entry.value} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '14px',
                                        color: '#6B7280'
                                    }}>
                                        <span style={{
                                            backgroundColor: entry.color,
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px'
                                        }}/>
                                        {entry.value}
                                    </span>
                                ))}
                            </div>
                        )}
                    />
                    <Bar dataKey="value" name="金額">
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={BAR_COLORS[entry.name] ?? '#8b5cf6'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
