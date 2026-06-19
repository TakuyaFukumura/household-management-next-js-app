'use client';

import React, {useEffect, useMemo, useState} from 'react';
import Papa from 'papaparse';
import Header from '@/app/components/Header';
import AggregationTable from '@/app/components/AggregationTable';
import CategoryBarChart from '@/app/components/CategoryBarChart';
import SummaryAggregationCards from '@/app/components/SummaryAggregationCards';
import SummaryExpensePieChart from '@/app/components/SummaryExpensePieChart';
import {
    aggregateTransactions,
    formatMonthLabel,
    type SummaryDisplayMetric,
    type SummaryPeriod,
    type SummaryTypeFilter,
} from '@/lib/aggregation';
import {type Transaction, validateRow, type ValidationError} from '@/lib/csv';

const PERIOD_OPTIONS: ReadonlyArray<{value: SummaryPeriod; label: string}> = [
    {value: 3, label: '直近3か月'},
    {value: 6, label: '直近6か月'},
    {value: 12, label: '直近12か月'},
    {value: 'all', label: '全期間'},
];

const TYPE_OPTIONS: ReadonlyArray<{value: SummaryTypeFilter; label: string}> = [
    {value: 'all', label: '両方'},
    {value: 'expense', label: '支出'},
    {value: 'income', label: '収入'},
];

const METRIC_OPTIONS: ReadonlyArray<{value: SummaryDisplayMetric; label: string}> = [
    {value: 'median', label: '中央値'},
    {value: 'trimmedMean', label: '外れ値除外後平均'},
];

export default function SummaryPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [period, setPeriod] = useState<SummaryPeriod>(12);
    const [typeFilter, setTypeFilter] = useState<SummaryTypeFilter>('all');
    const [metric, setMetric] = useState<SummaryDisplayMetric>('median');

    useEffect(() => {
        fetch('/data/household.csv')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`CSVファイルの取得に失敗しました: ${res.status}`);
                }
                return res.text();
            })
            .then((csvText) => {
                Papa.parse<string[]>(csvText, {
                    skipEmptyLines: true,
                    complete: (results) => {
                        const rows = results.data;
                        const parsedTransactions: Transaction[] = [];
                        const parsedErrors: ValidationError[] = [];

                        for (const parseError of results.errors ?? []) {
                            parsedErrors.push({
                                row: (parseError.row ?? 0) + 1,
                                message: `CSVパースエラー: ${parseError.message}`,
                            });
                        }

                        for (let index = 1; index < rows.length; index++) {
                            const {transaction, error} = validateRow(rows[index], index + 1);
                            if (transaction) {
                                parsedTransactions.push(transaction);
                            } else if (error) {
                                parsedErrors.push(error);
                            }
                        }

                        setTransactions(parsedTransactions);
                        setErrors(parsedErrors);
                        setHasLoaded(true);
                    },
                });
            })
            .catch((error: unknown) => {
                setFetchError(error instanceof Error ? error.message : 'CSVファイルの読み込みに失敗しました');
                setHasLoaded(true);
            });
    }, []);

    const aggregation = useMemo(() => aggregateTransactions(transactions, {period, typeFilter}), [transactions, period, typeFilter]);
    const rangeLabel = aggregation.months.length === 0
        ? null
        : `${formatMonthLabel(aggregation.months[0])}〜${formatMonthLabel(aggregation.months[aggregation.months.length - 1])}`;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header/>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <section className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">集計ページ</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        複数月の実績からカテゴリごとの代表値を確認できます。
                    </p>
                    {rangeLabel && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            対象期間: {rangeLabel}（{aggregation.months.length}か月）
                        </p>
                    )}
                </section>

                {!hasLoaded && (
                    <div className="text-center py-16 text-gray-400 text-lg">
                        データを読み込み中...
                    </div>
                )}

                {fetchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-semibold">{fetchError}</p>
                    </div>
                )}

                {errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 font-semibold mb-2">バリデーションエラー ({errors.length}件)</p>
                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                            {errors.map((error, index) => (
                                <li key={`${error.row}-${index}`}>{error.row}行目: {error.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasLoaded && !fetchError && (
                    <>
                        <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                <span className="block mb-2 font-medium">集計期間</span>
                                <select
                                    aria-label="集計期間"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                                    value={String(period)}
                                    onChange={(event) => {
                                        const nextValue = event.target.value;
                                        setPeriod(nextValue === 'all' ? 'all' : Number(nextValue) as SummaryPeriod);
                                    }}
                                >
                                    {PERIOD_OPTIONS.map((option) => (
                                        <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                <span className="block mb-2 font-medium">対象種別</span>
                                <select
                                    aria-label="対象種別"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                                    value={typeFilter}
                                    onChange={(event) => setTypeFilter(event.target.value as SummaryTypeFilter)}
                                >
                                    {TYPE_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </label>

                            <label className="text-sm text-gray-700 dark:text-gray-200">
                                <span className="block mb-2 font-medium">主表示</span>
                                <select
                                    aria-label="主表示"
                                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2"
                                    value={metric}
                                    onChange={(event) => setMetric(event.target.value as SummaryDisplayMetric)}
                                >
                                    {METRIC_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </label>
                        </section>

                        {transactions.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-lg">
                                データがありません
                            </div>
                        ) : (
                            <>
                                <SummaryAggregationCards
                                    income={aggregation.income}
                                    expense={aggregation.expense}
                                    balance={aggregation.balance}
                                    metric={metric}
                                />

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <CategoryBarChart categories={aggregation.categories} metric={metric}/>
                                    <SummaryExpensePieChart categories={aggregation.expenseCategories} metric={metric}/>
                                </div>

                                <AggregationTable categories={aggregation.categories} metric={metric}/>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
