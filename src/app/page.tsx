'use client';

import React, {useEffect, useState} from 'react';
import Papa from 'papaparse';
import {Transaction, ValidationError, validateRow} from '@/lib/csv';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import CategoryTable from './components/CategoryTable';
import ExpensePieChart from './components/ExpensePieChart';
import Header from './components/Header';

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

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
                        <SummaryCards transactions={transactions}/>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <CategoryTable transactions={transactions}/>
                            <ExpensePieChart transactions={transactions}/>
                        </div>

                        <TransactionTable transactions={transactions}/>
                    </>
                )}
            </main>
        </div>
    );
}
