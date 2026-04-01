import React from 'react';
import {Transaction} from './CsvUploader';

interface Props {
    transactions: Transaction[];
}

export default function TransactionTable({transactions}: Props) {
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow text-sm">
                <caption className="text-left text-gray-700 font-semibold text-base p-4">収支一覧</caption>
                <thead className="bg-gray-100 text-gray-600">
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
                        <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-3">{t.date}</td>
                            <td className="px-4 py-3">{t.category}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    t.type === '収入' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {t.type}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">¥{t.amount.toLocaleString()}</td>
                            <td className="px-4 py-3 text-gray-500">{t.memo}</td>
                        </tr>
                    ))}
                    {sorted.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">データがありません</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
