'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

const NAV_LINKS = [
    { href: '/', label: '🏠 ホーム' },
    { href: '/budget', label: '💰 予算' },
    { href: '/upload', label: '📂 CSVをアップロード' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* ハンバーガーボタン（md 未満でのみ表示） */}
                <button
                    type="button"
                    className="md:hidden mr-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label={menuOpen ? 'メニューを閉じる' : 'メニューを開く'}
                    aria-expanded={menuOpen}
                    aria-controls="mobile-menu"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">家計簿アプリ</h1>

                {/* PC 向けナビゲーション（md 以上でのみ表示） */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                pathname === href
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                    <DarkModeToggle />
                </nav>

                {/* スマホ向け：ダークモードトグルは常に右端に表示 */}
                <div className="md:hidden">
                    <DarkModeToggle />
                </div>
            </div>

            {/* スマホ向けドロワーメニュー */}
            {menuOpen && (
                <nav id="mobile-menu" className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-col gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                pathname === href
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
