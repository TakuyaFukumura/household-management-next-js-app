import React from 'react';
import type {BudgetEntry} from '@/lib/budget';

interface Props {
    readonly budgetEntries: BudgetEntry[];
}

export default function BudgetSummaryCards({budgetEntries}: Props) {
    const totalIncome = budgetEntries
        .filter((e) => e.type === '収入')
        .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = budgetEntries
        .filter((e) => e.type === '支出')
        .reduce((sum, e) => sum + e.amount, 0);

    const cards = [
        {label: '想定収入', value: totalIncome, color: 'text-green-600 dark:text-green-400'},
        {label: '想定支出', value: totalExpense, color: 'text-red-600 dark:text-red-400'},
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cards.map(({label, value, color}) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>
                        ¥{value.toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
