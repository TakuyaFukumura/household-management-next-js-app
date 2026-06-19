import React from 'react';
import type {CategoryAggregation, SummaryDisplayMetric} from '@/lib/aggregation';
import {getRepresentativeValue} from '@/lib/aggregation';

interface Props {
    readonly categories: readonly CategoryAggregation[];
    readonly metric: SummaryDisplayMetric;
}

function formatCurrency(value: number): string {
    return `¥${Math.round(value).toLocaleString()}`;
}

export default function AggregationTable({categories, metric}: Readonly<Props>) {
    const sortedCategories = [...categories].sort(
        (a, b) => getRepresentativeValue(b, metric) - getRepresentativeValue(a, metric),
    );
    const metricLabel = metric === 'trimmedMean' ? '外れ値除外後平均' : '中央値';

    return (
        <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 dark:text-gray-200 rounded-lg shadow text-sm">
                <caption className="text-left text-gray-700 dark:text-gray-200 font-semibold text-base p-4">
                    カテゴリ別代表値
                </caption>
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <tr>
                    <th scope="col" className="px-4 py-3 text-left">カテゴリ</th>
                    <th scope="col" className="px-4 py-3 text-left">種別</th>
                    <th scope="col" className="px-4 py-3 text-right">{metricLabel}</th>
                    <th scope="col" className="px-4 py-3 text-right">中央値</th>
                    <th scope="col" className="px-4 py-3 text-right">外れ値除外後平均</th>
                    <th scope="col" className="px-4 py-3 text-right">対象月数</th>
                    <th scope="col" className="px-4 py-3 text-right">外れ値除外件数</th>
                </tr>
                </thead>
                <tbody>
                {sortedCategories.map((category) => (
                    <tr
                        key={`${category.type}-${category.category}`}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <td className="px-4 py-3">{category.category}</td>
                        <td className="px-4 py-3">{category.type}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrency(getRepresentativeValue(category, metric))}
                        </td>
                        <td className="px-4 py-3 text-right">{formatCurrency(category.median)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(category.trimmedMean)}</td>
                        <td className="px-4 py-3 text-right">{category.monthCount}</td>
                        <td className="px-4 py-3 text-right">{category.outlierCount}</td>
                    </tr>
                ))}
                {sortedCategories.length === 0 && (
                    <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500">
                            データがありません
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}
