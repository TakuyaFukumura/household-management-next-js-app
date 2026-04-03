'use client';

import React, {useEffect, useState} from 'react';
import Papa from 'papaparse';
import {Transaction, validateRow, ValidationError} from '@/lib/csv';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import CategoryTable from './components/CategoryTable';
import ExpensePieChart from './components/ExpensePieChart';
import IncomeExpenseBarChart from './components/IncomeExpenseBarChart';
import Header from './components/Header';
import MonthNavigator from './components/MonthNavigator';

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

    const filteredTransactions = transactions.filter(
        (t) => t.date.startsWith(selectedMonth)
    );

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
                        const txs: Transaction[] = [];
                        const errs: ValidationError[] = [];

                        for (const parseError of results.errors ?? []) {
                            errs.push({
                                row: (parseError.row ?? 0) + 1,
                                message: `CSVパースエラー: ${parseError.message}`,
                            });
                        }

                        for (let i = 1; i < rows.length; i++) {
                            const {transaction, error} = validateRow(rows[i], i + 1);
                            if (transaction) {
                                txs.push(transaction);
                            } else if (error) {
                                errs.push(error);
                            }
                        }

                        setTransactions(txs);
                        setErrors(errs);
                        if (txs.length > 0) {
                            const latestDate = txs.reduce(
                                (max, t) => (t.date > max ? t.date : max),
                                txs[0].date
                            );
                            setSelectedMonth(latestDate.slice(0, 7));
                        }
                        setHasLoaded(true);
                    },
                });
            })
            .catch((e: unknown) => {
                setFetchError(e instanceof Error ? e.message : 'CSVファイルの読み込みに失敗しました');
                setHasLoaded(true);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header/>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
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
                            {errors.map((e, index) => (
                                <li key={`${e.row}-${index}`}>{e.row}行目: {e.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasLoaded && !fetchError && (
                    <>
                        <MonthNavigator
                            selectedMonth={selectedMonth}
                            onMonthChange={setSelectedMonth}
                        />

                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-lg">
                                データがありません
                            </div>
                        ) : (
                            <>
                                <SummaryCards transactions={filteredTransactions}/>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <CategoryTable transactions={filteredTransactions}/>
                                    <ExpensePieChart transactions={filteredTransactions}/>
                                </div>

                                <IncomeExpenseBarChart transactions={filteredTransactions}/>

                                <TransactionTable transactions={filteredTransactions}/>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
