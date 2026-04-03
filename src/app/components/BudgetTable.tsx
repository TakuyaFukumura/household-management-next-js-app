import React from 'react';
import type {BudgetEntry} from '@/lib/budget';

interface Props {
    readonly budgetEntries: BudgetEntry[];
}

interface TableRow {
    category: string;
    type: '収入' | '支出';
    budget: number;
}

function buildTableRows(budgetEntries: BudgetEntry[]): TableRow[] {
    return budgetEntries.map((e) => ({
        category: e.category,
        type: e.type,
        budget: e.amount,
    }));
}

export default function BudgetTable({budgetEntries}: Props) {
    const rows = buildTableRows(budgetEntries);
    const incomeRows = rows.filter((r) => r.type === '収入');
    const expenseRows = rows.filter((r) => r.type === '支出');
    const orderedRows = [...incomeRows, ...expenseRows];

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow text-sm">
                <caption className="text-left text-gray-700 dark:text-gray-200 font-semibold text-base p-4">予算設定</caption>
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left">カテゴリ</th>
                        <th scope="col" className="px-4 py-3 text-left">種別</th>
                        <th scope="col" className="px-4 py-3 text-right">予算金額</th>
                    </tr>
                </thead>
                <tbody>
                    {orderedRows.map((row) => (
                        <tr key={row.category} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">{row.category}</td>
                            <td className="px-4 py-3">{row.type}</td>
                            <td className="px-4 py-3 text-right">¥{row.budget.toLocaleString()}</td>
                        </tr>
                    ))}
                    {orderedRows.length === 0 && (
                        <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">データがありません</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
