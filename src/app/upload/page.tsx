'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import CsvUploader from '../components/CsvUploader';
import {Transaction, ValidationError} from '@/lib/csv';
import SummaryCards from '../components/SummaryCards';
import TransactionTable from '../components/TransactionTable';
import CategoryTable from '../components/CategoryTable';
import ExpensePieChart from '../components/ExpensePieChart';
import DarkModeToggle from '../components/DarkModeToggle';

export default function UploadPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleDataLoaded = (txs: Transaction[], errs: ValidationError[]) => {
        setTransactions(txs);
        setErrors(errs);
        setHasLoaded(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <header className="bg-white dark:bg-gray-900 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">CSVアップロード</h1>
                    <div className="flex items-center gap-2">
                        <Link href="/" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
                            ホームへ戻る
                        </Link>
                        <DarkModeToggle/>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <CsvUploader onDataLoaded={handleDataLoaded}/>
                <p className="text-sm text-gray-400 text-center">
                    サンプルCSVファイル:{' '}
                    <a href="/sample.csv" download className="text-blue-500 dark:text-blue-300 hover:underline">
                        sample.csv をダウンロード
                    </a>
                </p>

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

                {hasLoaded && (
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
