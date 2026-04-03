'use client';

import React, {useEffect, useState} from 'react';
import Papa from 'papaparse';
import {BudgetEntry, BudgetValidationError, validateBudgetRow} from '@/lib/budget';
import {Transaction, ValidationError, validateRow} from '@/lib/csv';
import Header from '@/app/components/Header';
import MonthNavigator from '@/app/components/MonthNavigator';
import BudgetSummaryCards from '@/app/components/BudgetSummaryCards';
import BudgetPieChart from '@/app/components/BudgetPieChart';
import BudgetBarChart from '@/app/components/BudgetBarChart';
import BudgetTable from '@/app/components/BudgetTable';

function getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function BudgetPage() {
    const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);
    const [budgetErrors, setBudgetErrors] = useState<BudgetValidationError[]>([]);
    const [budgetFetchError, setBudgetFetchError] = useState<string | null>(null);
    const [budgetLoaded, setBudgetLoaded] = useState(false);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionErrors, setTransactionErrors] = useState<ValidationError[]>([]);
    const [transactionFetchError, setTransactionFetchError] = useState<string | null>(null);
    const [transactionLoaded, setTransactionLoaded] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

    function handlePrevMonth() {
        const [year, month] = selectedMonth.split('-').map(Number);
        const d = new Date(year, month - 2);
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    function handleNextMonth() {
        const [year, month] = selectedMonth.split('-').map(Number);
        const d = new Date(year, month);
        setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const filteredTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

    useEffect(() => {
        fetch('/data/budget.csv')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`予算CSVファイルの取得に失敗しました: ${res.status}`);
                }
                return res.text();
            })
            .then((csvText) => {
                Papa.parse<string[]>(csvText, {
                    skipEmptyLines: true,
                    complete: (results) => {
                        const rows = results.data;
                        const entries: BudgetEntry[] = [];
                        const errs: BudgetValidationError[] = [];

                        for (const parseError of results.errors ?? []) {
                            errs.push({
                                row: (parseError.row ?? 0) + 1,
                                message: `CSVパースエラー: ${parseError.message}`,
                            });
                        }

                        for (let i = 1; i < rows.length; i++) {
                            const {entry, error} = validateBudgetRow(rows[i], i + 1);
                            if (entry) {
                                entries.push(entry);
                            } else if (error) {
                                errs.push(error);
                            }
                        }

                        setBudgetEntries(entries);
                        setBudgetErrors(errs);
                        setBudgetLoaded(true);
                    },
                });
            })
            .catch((e: unknown) => {
                setBudgetFetchError(e instanceof Error ? e.message : '予算CSVファイルの読み込みに失敗しました');
                setBudgetLoaded(true);
            });
    }, []);

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
                        setTransactionErrors(errs);
                        if (txs.length > 0) {
                            const latestDate = txs.reduce(
                                (max, t) => (t.date > max ? t.date : max),
                                txs[0].date
                            );
                            setSelectedMonth(latestDate.slice(0, 7));
                        }
                        setTransactionLoaded(true);
                    },
                });
            })
            .catch((e: unknown) => {
                setTransactionFetchError(e instanceof Error ? e.message : 'CSVファイルの読み込みに失敗しました');
                setTransactionLoaded(true);
            });
    }, []);

    const hasLoaded = budgetLoaded && transactionLoaded;
    const allErrors = [...budgetErrors, ...transactionErrors];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header/>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {!hasLoaded && (
                    <div className="text-center py-16 text-gray-400 text-lg">
                        データを読み込み中...
                    </div>
                )}

                {budgetFetchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-semibold">{budgetFetchError}</p>
                    </div>
                )}

                {transactionFetchError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 font-semibold">{transactionFetchError}</p>
                    </div>
                )}

                {allErrors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 font-semibold mb-2">バリデーションエラー ({allErrors.length}件)</p>
                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                            {allErrors.map((e, index) => (
                                <li key={`${e.row}-${index}`}>{e.row}行目: {e.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {hasLoaded && !budgetFetchError && (
                    <>
                        {budgetEntries.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-lg">
                                データがありません
                            </div>
                        ) : (
                            <>
                                <BudgetSummaryCards budgetEntries={budgetEntries}/>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <BudgetPieChart budgetEntries={budgetEntries}/>
                                    <BudgetBarChart budgetEntries={budgetEntries}/>
                                </div>

                                <MonthNavigator
                                    selectedMonth={selectedMonth}
                                    onPrevMonth={handlePrevMonth}
                                    onNextMonth={handleNextMonth}
                                />

                                {transactionFetchError ? (
                                    <div className="text-center py-8 text-gray-400 text-sm">
                                        実績データを取得できませんでした
                                    </div>
                                ) : (
                                    <BudgetTable budgetEntries={budgetEntries} transactions={filteredTransactions}/>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
