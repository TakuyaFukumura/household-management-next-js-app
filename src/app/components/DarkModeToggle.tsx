'use client';

import React, {useEffect, useState} from 'react';

export default function DarkModeToggle() {
    const [isMounted, setIsMounted] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const dark = saved === 'dark';
        setIsDark(dark);
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setIsMounted(true);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (!isMounted) return null;

    return (
        <button
            onClick={toggleTheme}
            aria-label={isDark ? 'ライトモードへ切替' : 'ダークモードへ切替'}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
            {isDark ? '🌙' : '☀️'}
        </button>
    );
}
