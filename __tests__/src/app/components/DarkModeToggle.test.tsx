/**
 * DarkModeToggle コンポーネントのテスト
 */
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import DarkModeToggle from '@/app/components/DarkModeToggle';

describe('DarkModeToggle', () => {
    beforeEach(() => {
        localStorage.clear();
        (localStorage.getItem as jest.Mock).mockClear();
        (localStorage.setItem as jest.Mock).mockClear();
        document.documentElement.classList.remove('dark');
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.documentElement.classList.remove('dark');
    });

    it('初期表示でライトモードのアイコン（☀️）が表示される', () => {
        render(<DarkModeToggle/>);
        expect(screen.getByRole('button')).toHaveTextContent('☀️');
    });

    it('localStorageに"dark"が保存されている場合はダークモードアイコン（🌙）が表示される', () => {
        localStorage.setItem('theme', 'dark');
        render(<DarkModeToggle/>);
        expect(screen.getByRole('button')).toHaveTextContent('🌙');
    });

    it('ボタンをクリックするとダークモードへ切り替わる', () => {
        render(<DarkModeToggle/>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(button).toHaveTextContent('🌙');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('ダークモード時にボタンをクリックするとライトモードへ切り替わる', () => {
        localStorage.setItem('theme', 'dark');
        render(<DarkModeToggle/>);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(button).toHaveTextContent('☀️');
        expect(document.documentElement.classList.contains('dark')).toBe(false);
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('ライトモード時のaria-labelが正しい', () => {
        render(<DarkModeToggle/>);
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ダークモードへ切替');
    });

    it('ダークモード時のaria-labelが正しい', () => {
        localStorage.setItem('theme', 'dark');
        render(<DarkModeToggle/>);
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ライトモードへ切替');
    });
});
