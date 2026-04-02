'use client';

import React from 'react';
import {Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip} from 'recharts';
import {Transaction} from './CsvUploader';

interface Props {
    transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

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

    return Array.from(map.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
    }));
}

function renderCustomLabel({name, percent}: {name?: string; percent?: number}) {
    return `${name ?? ''} (${((percent ?? 0) * 100).toFixed(1)}%)`;
}

function formatTooltipValue(value: unknown) {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function ExpensePieChart({transactions}: Props) {
    const data = buildChartData(transactions);

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
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        dataKey="value"
                        label={renderCustomLabel}
                        labelLine={true}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                        ))}
                    </Pie>
                    <Tooltip formatter={formatTooltipValue}/>
                    <Legend/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
