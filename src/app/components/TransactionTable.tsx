import React from 'react';
import type {Transaction} from '@/lib/csv';

interface Props {
    readonly transactions: readonly Transaction[];
}

const typeBadgeClass = (type: string) =>
    type === '収入'
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
        : 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';

export default function TransactionTable({transactions}: Readonly<Props>) {
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow text-sm">
                <caption className="text-left text-gray-700 dark:text-gray-200 font-semibold text-base p-4">収支一覧
                </caption>
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left">日付</th>
                    <th scope="col" className="px-4 py-3 text-left">カテゴリ</th>
                    <th scope="col" className="px-4 py-3 text-left">種別</th>
                    <th scope="col" className="px-4 py-3 text-right">金額</th>
                    <th scope="col" className="px-4 py-3 text-left">メモ</th>
                </tr>
                </thead>
                <tbody>
                {sorted.map((t, i) => (
                    <tr
                        key={`${i}-${t.date}-${t.category}-${t.type}-${t.amount}-${t.memo}`}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <td className="px-4 py-3">{`${t.date.slice(8, 10)}日`}</td>
                        <td className="px-4 py-3">{t.category}</td>
                        <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${typeBadgeClass(t.type)}`}>
                                    {t.type}
                                </span>
                        </td>
                        <td className="px-4 py-3 text-right">¥{t.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.memo}</td>
                    </tr>
                ))}
                {sorted.length === 0 && (
                    <tr>
                        <td colSpan={5}
                            className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">データがありません
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
