'use client';

import React from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,} from 'recharts';
import type {BudgetEntry} from '@/lib/budget';

interface Props {
    readonly budgetEntries: BudgetEntry[];
}

interface BarChartEntry {
    name: string;
    value: number;
    color: string;
}

const INCOME_COLOR = '#22c55e';
const EXPENSE_COLOR = '#ef4444';

interface ChartDataResult {
    chartData: BarChartEntry[];
    difference: number;
}

function buildChartData(budgetEntries: BudgetEntry[]): ChartDataResult {
    const budgetIncome = budgetEntries
        .filter((e) => e.type === '収入')
        .reduce((sum, e) => sum + e.amount, 0);

    const budgetExpense = budgetEntries
        .filter((e) => e.type === '支出')
        .reduce((sum, e) => sum + e.amount, 0);

    const difference = budgetIncome - budgetExpense;

    return {
        chartData: [
            {name: '収入', value: budgetIncome, color: INCOME_COLOR},
            {name: '支出', value: budgetExpense, color: EXPENSE_COLOR},
        ],
        difference,
    };
}

function getDifferenceColor(difference: number): string {
    if (difference > 0) return 'text-green-600 dark:text-green-400';
    if (difference < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
}

function formatAxisValue(value: number): string {
    return `¥${value.toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
    return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function BudgetBarChart({budgetEntries}: Props) {
    const {chartData, difference} = buildChartData(budgetEntries);
    const isEmpty = chartData.every((d) => d.value === 0);

    if (isEmpty) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 dark:text-gray-500">データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">収支予算</h2>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart
                    data={chartData}
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
                    <Bar dataKey="value" name="金額">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color}/>
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                差額:
                <span className={`ml-2 font-bold ${getDifferenceColor(difference)}`}>
                    {difference < 0
                        ? `-¥${Math.abs(difference).toLocaleString('ja-JP')}`
                        : `¥${difference.toLocaleString('ja-JP')}`}
                </span>
            </div>
        </div>
    );
}
