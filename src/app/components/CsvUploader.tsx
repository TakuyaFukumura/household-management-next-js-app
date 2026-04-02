'use client';

import React, {useCallback, useRef, useState} from 'react';
import Papa from 'papaparse';

export interface Transaction {
    date: string;
    category: string;
    type: '収入' | '支出';
    amount: number;
    memo: string;
}

export interface ValidationError {
    row: number;
    message: string;
}

interface Props {
    onDataLoaded: (transactions: Transaction[], errors: ValidationError[]) => void;
}

function validateRow(row: string[], rowIndex: number): {transaction: Transaction | null; error: ValidationError | null} {
    const [date, category, type, amountStr, memo] = row;

    if (!date || !category || !type || !amountStr) {
        return {transaction: null, error: {row: rowIndex, message: '必須フィールドが不足しています'}};
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return {transaction: null, error: {row: rowIndex, message: `日付の形式が不正です: ${date}`}};
    }

    if (type !== '収入' && type !== '支出') {
        return {transaction: null, error: {row: rowIndex, message: `種別が不正です: ${type}`}};
    }

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount <= 0) {
        return {transaction: null, error: {row: rowIndex, message: `金額が不正です: ${amountStr}`}};
    }

    return {
        transaction: {date, category, type, amount, memo: memo ?? ''},
        error: null,
    };
}

export default function CsvUploader({onDataLoaded}: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback((file: File) => {
        Papa.parse<string[]>(file, {
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;
                const transactions: Transaction[] = [];
                const errors: ValidationError[] = [];

                // CSVパースエラーをバリデーションエラーとして追加
                for (const parseError of results.errors ?? []) {
                    errors.push({
                        row: (parseError.row ?? 0) + 1,
                        message: `CSVパースエラー: ${parseError.message}`,
                    });
                }

                // Skip header row (index 0)
                for (let i = 1; i < rows.length; i++) {
                    const {transaction, error} = validateRow(rows[i], i + 1);
                    if (transaction) {
                        transactions.push(transaction);
                    } else if (error) {
                        errors.push(error);
                    }
                }

                onDataLoaded(transactions, errors);
            },
        });
    }, [onDataLoaded]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
            onDataLoaded([], [{row: 0, message: 'CSVファイルのみアップロードできます'}]);
            return;
        }
        processFile(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="CSVファイルをアップロード"
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current?.click();
                }
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
                aria-hidden="true"
            />
            <p className="text-gray-600 text-lg">CSVファイルをドロップ、またはクリックして選択</p>
            <p className="text-gray-400 text-sm mt-2">フォーマット: 日付,カテゴリ,種別,金額,メモ</p>
        </div>
    );
}
