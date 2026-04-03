'use client';

import React, {useCallback, useRef, useState} from 'react';
import Papa from 'papaparse';
import {Transaction, validateRow, ValidationError} from '@/lib/csv';

export type {Transaction, ValidationError};

interface Props {
    onDataLoaded: (transactions: Transaction[], errors: ValidationError[]) => void;
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
