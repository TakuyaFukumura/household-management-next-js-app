import React from 'react';
import type {RepresentativeStats, SummaryDisplayMetric} from '@/lib/aggregation';
import {getRepresentativeValue} from '@/lib/aggregation';

interface Props {
    readonly income: RepresentativeStats;
    readonly expense: RepresentativeStats;
    readonly balance: RepresentativeStats;
    readonly metric: SummaryDisplayMetric;
}

function formatCurrency(value: number): string {
    return `¥${Math.round(value).toLocaleString()}`;
}

export default function SummaryAggregationCards({income, expense, balance, metric}: Readonly<Props>) {
    const incomeValue = getRepresentativeValue(income, metric);
    const expenseValue = getRepresentativeValue(expense, metric);
    const balanceValue = getRepresentativeValue(balance, metric);
    const metricLabel = metric === 'trimmedMean' ? '外れ値除外後平均' : '中央値';

    const cards = [
        {label: '代表月間収入', value: incomeValue, color: 'text-blue-600 dark:text-blue-400'},
        {label: '代表月間支出', value: expenseValue, color: 'text-orange-600 dark:text-orange-400'},
        {
            label: '代表月間収支差額',
            value: balanceValue,
            color: balanceValue >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({label, value, color}) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>{formatCurrency(value)}</p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">主表示: {metricLabel}</p>
                </div>
            ))}
        </div>
    );
}
