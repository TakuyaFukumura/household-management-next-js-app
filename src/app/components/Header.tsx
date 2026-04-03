import React from 'react';
import Link from 'next/link';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">家計簿アプリ</h1>
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
                        ホーム
                    </Link>
                    <Link href="/budget" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
                        予算
                    </Link>
                    <Link href="/upload" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
                        CSVをアップロード
                    </Link>
                    <DarkModeToggle/>
                </div>
            </div>
        </header>
    );
}
