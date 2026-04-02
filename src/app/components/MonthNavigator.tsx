'use client';

import React from 'react';

interface MonthNavigatorProps {
    selectedMonth: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

function formatMonth(ym: string): string {
    const [year, month] = ym.split('-');
    return `${year}年${month}月`;
}

export default function MonthNavigator({selectedMonth, onPrevMonth, onNextMonth}: MonthNavigatorProps) {
    return (
        <div className="flex items-center justify-center gap-4">
            <button
                onClick={onPrevMonth}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
            >
                ◀ 前月
            </button>
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100 min-w-32 text-center">
                {formatMonth(selectedMonth)}
            </span>
            <button
                onClick={onNextMonth}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
            >
                翌月 ▶
            </button>
        </div>
    );
}
