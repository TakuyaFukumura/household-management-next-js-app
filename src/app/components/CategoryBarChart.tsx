'use client';

import React from 'react';
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import type {CategoryAggregation, SummaryDisplayMetric} from '@/lib/aggregation';
import {getRepresentativeValue} from '@/lib/aggregation';

interface Props {
    readonly categories: readonly CategoryAggregation[];
    readonly metric: SummaryDisplayMetric;
}

function formatCurrency(value: number): string {
    return `¥${Math.round(value).toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
    return typeof value === 'number' ? formatCurrency(value) : String(value ?? '');
}

export default function CategoryBarChart({categories, metric}: Readonly<Props>) {
    const data = [...categories]
        .map((category) => ({
            name: category.category,
            type: category.type,
            value: getRepresentativeValue(category, metric),
        }))
        .filter((category) => category.value > 0)
        .sort((a, b) => b.value - a.value);

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
                <p className="text-gray-400 dark:text-gray-500">データがありません</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">カテゴリ別代表値</h2>
            <ResponsiveContainer width="100%" height={Math.max(260, data.length * 40)}>
                <BarChart data={data} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563"/>
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        tick={{fill: '#6B7280'}}
                        axisLine={{stroke: '#4B5563'}}
                        tickLine={{stroke: '#4B5563'}}
                    />
                    <XAxis
                        type="number"
                        tickFormatter={formatCurrency}
                        tick={{fill: '#6B7280'}}
                        axisLine={{stroke: '#4B5563'}}
                        tickLine={{stroke: '#4B5563'}}
                    />
                    <Tooltip formatter={formatTooltipValue}/>
                    <Bar dataKey="value" name="金額">
                        {data.map((entry) => (
                            <Cell
                                key={`${entry.type}-${entry.name}`}
                                fill={entry.type === '収入' ? '#3b82f6' : '#f97316'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
