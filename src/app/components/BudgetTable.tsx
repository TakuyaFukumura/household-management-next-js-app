import React from 'react';
import type {BudgetEntry} from '@/lib/budget';
import type {Transaction} from '@/lib/csv';

interface Props {
    readonly budgetEntries: BudgetEntry[];
    readonly transactions: Transaction[];
}

interface TableRow {
    category: string;
    type: '収入' | '支出';
    budget: number;
    actual: number;
    diff: number;
}

function buildTableRows(budgetEntries: BudgetEntry[], transactions: Transaction[]): TableRow[] {
    const actualMap = new Map<string, number>();
    for (const t of transactions) {
        actualMap.set(t.category, (actualMap.get(t.category) ?? 0) + t.amount);
    }

    return budgetEntries.map((e) => {
        const actual = actualMap.get(e.category) ?? 0;
        const diff = e.type === '収入' ? actual - e.amount : e.amount - actual;
        return {
            category: e.category,
            type: e.type,
            budget: e.amount,
            actual,
            diff,
        };
    });
}

function getDiffColor(row: TableRow): string {
    if (row.type === '収入') {
        return row.actual >= row.budget
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    } else {
        return row.actual <= row.budget
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400';
    }
}

function formatDiff(diff: number): string {
    if (diff > 0) return `+¥${diff.toLocaleString()}`;
    if (diff < 0) return `-¥${Math.abs(diff).toLocaleString()}`;
    return '¥0';
}

export default function BudgetTable({budgetEntries, transactions}: Props) {
    const rows = buildTableRows(budgetEntries, transactions);
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
                        <th scope="col" className="px-4 py-3 text-right">実績金額</th>
                        <th scope="col" className="px-4 py-3 text-right">差額</th>
                    </tr>
                </thead>
                <tbody>
                    {orderedRows.map((row) => (
                        <tr key={row.category} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3">{row.category}</td>
                            <td className="px-4 py-3">{row.type}</td>
                            <td className="px-4 py-3 text-right">¥{row.budget.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right">¥{row.actual.toLocaleString()}</td>
                            <td className={`px-4 py-3 text-right ${getDiffColor(row)}`}>
                                {formatDiff(row.diff)}
                            </td>
                        </tr>
                    ))}
                    {orderedRows.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">データがありません</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
