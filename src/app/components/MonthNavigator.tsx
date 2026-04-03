'use client';

import React, {useEffect, useState} from 'react';

interface MonthNavigatorProps {
    selectedMonth: string;
    onMonthChange: (selectedMonth: string) => void;
}

export default function MonthNavigator({selectedMonth, onMonthChange}: MonthNavigatorProps) {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const yearNum = parseInt(yearStr, 10);
    const [yearInput, setYearInput] = useState(yearStr);
    const [monthInput, setMonthInput] = useState(monthStr);

    useEffect(() => {
        setYearInput(yearStr);
        setMonthInput(monthStr);
    }, [yearStr, monthStr]);

    const YEAR_RANGE = 10;
    const yearOptions = Array.from({length: YEAR_RANGE * 2 + 1}, (_, i) => yearNum - YEAR_RANGE + i);
    const monthOptions = Array.from({length: 12}, (_, i) => i + 1);

    function handlePrevMonth() {
        const [y, m] = selectedMonth.split('-').map(Number);
        const d = new Date(y, m - 2);
        onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    function handleNextMonth() {
        const [y, m] = selectedMonth.split('-').map(Number);
        const d = new Date(y, m);
        onMonthChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    function commitYear(value: string) {
        const trimmed = value.trim();
        if (trimmed === '' || !/^\d+$/.test(trimmed)) {
            setYearInput(yearStr);
            return;
        }
        const num = parseInt(trimmed, 10);
        if (num < 1000 || num > 9999) {
            setYearInput(yearStr);
            return;
        }
        onMonthChange(`${String(num)}-${monthStr}`);
    }

    function commitMonth(value: string) {
        const trimmed = value.trim();
        if (trimmed === '' || !/^\d+$/.test(trimmed)) {
            setMonthInput(monthStr);
            return;
        }
        const num = parseInt(trimmed, 10);
        if (num < 1 || num > 12) {
            setMonthInput(monthStr);
            return;
        }
        onMonthChange(`${yearStr}-${String(num).padStart(2, '0')}`);
    }

    const buttonClass =
        'px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium';
    const inputClass =
        'text-center px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-lg font-semibold';
    const labelClass = 'text-lg font-semibold text-gray-800 dark:text-gray-100';

    return (
        <div className="flex items-center justify-center gap-4">
            <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="前月"
                className={buttonClass}
            >
                ◀
            </button>

            <div className="flex items-center gap-1">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    aria-label="年"
                    value={yearInput}
                    onChange={(e) => setYearInput(e.target.value)}
                    onBlur={(e) => commitYear(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            commitYear((e.target as HTMLInputElement).value);
                        }
                    }}
                    list="month-navigator-year-list"
                    className={`${inputClass} w-20`}
                />
                <datalist id="month-navigator-year-list">
                    {yearOptions.map((y) => (
                        <option key={y} value={String(y)}>
                            {y}年
                        </option>
                    ))}
                </datalist>
                <span className={labelClass}>年</span>

                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{1,2}"
                    aria-label="月"
                    value={monthInput}
                    onChange={(e) => setMonthInput(e.target.value)}
                    onBlur={(e) => commitMonth(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            commitMonth((e.target as HTMLInputElement).value);
                        }
                    }}
                    list="month-navigator-month-list"
                    className={`${inputClass} w-14`}
                />
                <datalist id="month-navigator-month-list">
                    {monthOptions.map((m) => (
                        <option key={m} value={String(m)}>
                            {String(m).padStart(2, '0')}月
                        </option>
                    ))}
                </datalist>
                <span className={labelClass}>月</span>
            </div>

            <button
                type="button"
                onClick={handleNextMonth}
                aria-label="翌月"
                className={buttonClass}
            >
                ▶
            </button>
        </div>
    );
}
