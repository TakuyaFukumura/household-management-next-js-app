'use client';

import React, {useState} from 'react';
import CsvUploader, {Transaction, ValidationError} from './components/CsvUploader';
import SummaryCards from './components/SummaryCards';
import TransactionTable from './components/TransactionTable';
import CategoryTable from './components/CategoryTable';
import ExpensePieChart from './components/ExpensePieChart';

export default function Home() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [errors, setErrors] = useState<ValidationError[]>([]);
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleDataLoaded = (txs: Transaction[], errs: ValidationError[]) => {
        setTransactions(txs);
        setErrors(errs);
        setHasLoaded(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">家計簿アプリ</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <CsvUploader onDataLoaded={handleDataLoaded}/>

                {errors.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-700 font-semibold mb-2">バリデーションエラー ({errors.length}件)</p>
                        <ul className="list-disc list-inside text-sm text-yellow-600 space-y-1">
                            {errors.map((e) => (
                                <li key={e.row}>{e.row}行目: {e.message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {!hasLoaded ? (
                    <div className="text-center py-16 text-gray-400 text-lg">
                        CSVファイルを読み込んでください
                    </div>
                ) : (
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
