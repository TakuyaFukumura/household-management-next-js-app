import React from 'react';
import {Transaction} from './CsvUploader';

interface Props {
    transactions: Transaction[];
}

export default function SummaryCards({transactions}: Props) {
    const totalIncome = transactions
        .filter((t) => t.type === '収入')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter((t) => t.type === '支出')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    const cards = [
        {label: '合計収入', value: totalIncome, color: 'text-green-600'},
        {label: '合計支出', value: totalExpense, color: 'text-red-600'},
        {label: '収支差額', value: balance, color: balance >= 0 ? 'text-blue-600' : 'text-orange-600'},
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map(({label, value, color}) => (
                <div key={label} className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500 text-sm">{label}</p>
                    <p className={`text-2xl font-bold mt-1 ${color}`}>
                        ¥{value.toLocaleString()}
                    </p>
                </div>
            ))}
        </div>
    );
}
