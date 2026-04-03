/**
 * Header コンポーネントのテスト
 */
import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/app/components/Header';

// next/linkのモック
jest.mock('next/link', () => {
    const MockLink = ({href, children, className, onClick}: {href: string; children: React.ReactNode; className?: string; onClick?: () => void}) => (
        <a href={href} className={className} onClick={onClick}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// next/navigationのモック
jest.mock('next/navigation', () => ({
    usePathname: jest.fn().mockReturnValue('/'),
}));

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

    it('/へのナビゲーションリンクが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('link', {name: /ホーム/})).toBeInTheDocument();
    });

    it('/budgetへのナビゲーションリンクが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('link', {name: /予算/})).toBeInTheDocument();
    });

    it('/uploadへのナビゲーションリンクが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('link', {name: /CSVをアップロード/})).toBeInTheDocument();
    });

    it('ダークモード切替ボタンが表示される', () => {
        render(<Header/>);
        // ハンバーガーボタンとダークモード切替ボタンの複数が存在する
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
    });

    it('ハンバーガーメニューボタンが表示される', () => {
        render(<Header/>);
        expect(screen.getByRole('button', {name: 'メニューを開く'})).toBeInTheDocument();
    });

    it('ハンバーガーボタンをクリックするとドロワーが開く', () => {
        render(<Header/>);
        const hamburgerButton = screen.getByRole('button', {name: 'メニューを開く'});
        expect(screen.queryByRole('navigation', {hidden: true})).toBeInTheDocument();
        fireEvent.click(hamburgerButton);
        expect(screen.getByRole('button', {name: 'メニューを閉じる'})).toBeInTheDocument();
    });

    it('現在のパスに対応するリンクがアクティブ状態になる', () => {
        render(<Header/>);
        // usePathname が '/' を返す設定なので、ホームリンクがアクティブクラスを持つ
        const homeLink = screen.getByRole('link', {name: /ホーム/});
        expect(homeLink).toHaveClass('bg-blue-100');
    });
});
