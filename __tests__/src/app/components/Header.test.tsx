/**
 * Header コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/app/components/Header';

// next/linkのモック
jest.mock('next/link', () => {
    const MockLink = ({href, children, className}: {href: string; children: React.ReactNode; className?: string}) => (
        <a href={href} className={className}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// DarkModeToggleのモック
jest.mock('@/app/components/DarkModeToggle', () => {
    const MockDarkModeToggle = () => <button>☀️</button>;
    MockDarkModeToggle.displayName = 'MockDarkModeToggle';
    return MockDarkModeToggle;
});

describe('Header', () => {
    it('アプリタイトルが表示される', () => {
        render(<Header/>);
        expect(screen.getByText('家計簿アプリ')).toBeInTheDocument();
    });

    it('/uploadへのナビゲーションリンクが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('link', {name: 'CSVをアップロード'})).toBeInTheDocument();
    });

    it('ダークモード切替ボタンが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
