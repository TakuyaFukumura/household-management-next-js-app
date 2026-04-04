'use client';

import React, {useEffect, useId, useRef, useState} from 'react';

interface MonthNavigatorProps {
    selectedMonth: string;
    onMonthChange: (selectedMonth: string) => void;
}

export default function MonthNavigator({selectedMonth, onMonthChange}: MonthNavigatorProps) {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const yearNum = parseInt(yearStr, 10);
    const [yearInput, setYearInput] = useState(yearStr);
    const [monthInput, setMonthInput] = useState(monthStr);
    const [isYearOptionsOpen, setIsYearOptionsOpen] = useState(false);
    const [isMonthOptionsOpen, setIsMonthOptionsOpen] = useState(false);
    const yearListId = useId();
    const monthListId = useId();
    const yearFieldRef = useRef<HTMLDivElement>(null);
    const monthFieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setYearInput(yearStr);
        setMonthInput(monthStr);
    }, [yearStr, monthStr]);

    useEffect(() => {
        function handlePointerDown(event: MouseEvent) {
            const target = event.target as Node;

            if (!yearFieldRef.current?.contains(target)) {
                setIsYearOptionsOpen(false);
            }

            if (!monthFieldRef.current?.contains(target)) {
                setIsMonthOptionsOpen(false);
            }
        }

        document.addEventListener('mousedown', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
        };
    }, []);

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
        setIsYearOptionsOpen(false);
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
        setIsMonthOptionsOpen(false);
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
        'text-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-lg font-semibold pr-8';
    const labelClass = 'text-lg font-semibold text-gray-800 dark:text-gray-100';
    const optionListClass =
        'absolute top-full left-0 z-10 mt-1 max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800';
    const optionButtonClass =
        'block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700';

    function selectYear(year: number) {
        setYearInput(String(year));
        setIsYearOptionsOpen(false);
        onMonthChange(`${String(year)}-${monthStr}`);
    }

    function selectMonth(month: number) {
        setMonthInput(String(month).padStart(2, '0'));
        setIsMonthOptionsOpen(false);
        onMonthChange(`${yearStr}-${String(month).padStart(2, '0')}`);
    }

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
                <div ref={yearFieldRef} className="relative">
                    <input
                        type="text"
                        role="combobox"
                        inputMode="numeric"
                        pattern="[0-9]{4}"
                        aria-label="年"
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                        aria-expanded={isYearOptionsOpen}
                        aria-controls={yearListId}
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        onFocus={() => setIsYearOptionsOpen(true)}
                        onClick={() => setIsYearOptionsOpen(true)}
                        onBlur={(e) => commitYear(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                commitYear((e.target as HTMLInputElement).value);
                            }
                        }}
                        className={`${inputClass} w-24 md:w-28`}
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400"
                    >
                        ▼
                    </span>
                    {isYearOptionsOpen && (
                        <ul
                            id={yearListId}
                            role="listbox"
                            aria-label="年候補"
                            className={`${optionListClass} w-24 md:w-28`}
                        >
                            {yearOptions.map((y) => (
                                <li key={y}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={String(y) === yearStr}
                                        className={optionButtonClass}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectYear(y);
                                        }}
                                    >
                                        {y}年
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <span className={labelClass}>年</span>

                <div ref={monthFieldRef} className="relative">
                    <input
                        type="text"
                        role="combobox"
                        inputMode="numeric"
                        pattern="[0-9]{1,2}"
                        aria-label="月"
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                        aria-expanded={isMonthOptionsOpen}
                        aria-controls={monthListId}
                        value={monthInput}
                        onChange={(e) => setMonthInput(e.target.value)}
                        onFocus={() => setIsMonthOptionsOpen(true)}
                        onClick={() => setIsMonthOptionsOpen(true)}
                        onBlur={(e) => commitMonth(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                commitMonth((e.target as HTMLInputElement).value);
                            }
                        }}
                        className={`${inputClass} w-20`}
                    />
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400"
                    >
                        ▼
                    </span>
                    {isMonthOptionsOpen && (
                        <ul
                            id={monthListId}
                            role="listbox"
                            aria-label="月候補"
                            className={`${optionListClass} w-20`}
                        >
                            {monthOptions.map((m) => (
                                <li key={m}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={String(m).padStart(2, '0') === monthStr}
                                        className={optionButtonClass}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            selectMonth(m);
                                        }}
                                    >
                                        {String(m).padStart(2, '0')}月
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
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
