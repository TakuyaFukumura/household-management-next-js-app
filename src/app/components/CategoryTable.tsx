import React from 'react';
import type {Transaction} from '@/lib/csv';

interface Props {
    readonly transactions: readonly Transaction[];
}

interface CategorySummary {
    category: string;
    total: number;
    percentage: number;
}

function buildCategorySummaries(transactions: readonly Transaction[]): CategorySummary[] {
    const expenses = transactions.filter((t) => t.type === '支出');
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const map = new Map<string, number>();
    for (const t of expenses) {
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    }

    return Array.from(map.entries())
        .map(([category, total]) => ({
            category,
            total,
            percentage: totalExpense > 0 ? (total / totalExpense) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);
}

export default function CategoryTable({transactions}: Readonly<Props>) {
    const summaries = buildCategorySummaries(transactions);

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow text-sm">
                <caption
                    className="text-left text-gray-700 dark:text-gray-200 font-semibold text-base p-4">カテゴリ別支出
                </caption>
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left">カテゴリ</th>
                    <th scope="col" className="px-4 py-3 text-right">合計金額</th>
                    <th scope="col" className="px-4 py-3 text-right">割合</th>
                </tr>
                </thead>
                <tbody>
                {summaries.map((s) => (
                    <tr key={s.category}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3">{s.category}</td>
                        <td className="px-4 py-3 text-right">¥{s.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{s.percentage.toFixed(1)}%</td>
                    </tr>
                ))}
                {summaries.length === 0 && (
                    <tr>
                        <td colSpan={3}
                            className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">データがありません
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
