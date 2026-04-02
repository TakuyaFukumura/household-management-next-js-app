'use client';

import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import type {BudgetEntry} from '@/lib/budget';
import type {Transaction} from '@/lib/csv';

interface Props {
    readonly budgetEntries: BudgetEntry[];
    readonly transactions: Transaction[];
}

interface BarChartEntry {
    name: string;
    value: number;
    color: string;
}

const BUDGET_COLOR = '#3b82f6';
const INCOME_ACTUAL_COLOR = '#22c55e';
const EXPENSE_ACTUAL_COLOR = '#ef4444';

const LEGEND_PAYLOAD = [
    {value: '予算', color: BUDGET_COLOR},
    {value: '実績', color: INCOME_ACTUAL_COLOR},
];

function buildChartData(budgetEntries: BudgetEntry[], transactions: Transaction[]): BarChartEntry[] {
    const budgetIncome = budgetEntries
        .filter((e) => e.type === '収入')
        .reduce((sum, e) => sum + e.amount, 0);

    const budgetExpense = budgetEntries
        .filter((e) => e.type === '支出')
        .reduce((sum, e) => sum + e.amount, 0);

    const actualIncome = transactions
        .filter((t) => t.type === '収入')
        .reduce((sum, t) => sum + t.amount, 0);

    const actualExpense = transactions
        .filter((t) => t.type === '支出')
        .reduce((sum, t) => sum + t.amount, 0);

    return [
        {name: '収入予算', value: budgetIncome, color: BUDGET_COLOR},
        {name: '収入実績', value: actualIncome, color: INCOME_ACTUAL_COLOR},
        {name: '支出予算', value: budgetExpense, color: BUDGET_COLOR},
        {name: '支出実績', value: actualExpense, color: EXPENSE_ACTUAL_COLOR},
    ];
}

function formatAxisValue(value: number): string {
    return `¥${value.toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function BudgetBarChart({budgetEntries, transactions}: Props) {
    const data = buildChartData(budgetEntries, transactions);
    const isEmpty = data.every((d) => d.value === 0);

    if (isEmpty) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 dark:text-gray-500">データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">収支比較（予算 vs 実績）</h2>
            <ResponsiveContainer width="100%" height={250}>
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
                        width={70}
                    />
                    <XAxis
                        type="number"
                        tickFormatter={formatAxisValue}
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
                                    <span key={entry.value} style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#6B7280'}}>
                                        <span style={{backgroundColor: entry.color, display: 'inline-block', width: '12px', height: '12px'}}/>
                                        {entry.value}
                                    </span>
                                ))}
                            </div>
                        )}
                    />
                    <Bar dataKey="value" name="金額">
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
