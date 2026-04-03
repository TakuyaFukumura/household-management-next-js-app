/**
 * CSVアップロードページ（/upload）のテスト
 */
import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '@/app/upload/page';

// papaparseのモック
jest.mock('papaparse', () => ({
    parse: jest.fn((file: File, options: {complete: (results: {data: string[][], errors: {row?: number; message: string}[]}) => void}) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(Boolean).map((row) => row.split(','));
            options.complete({data: rows, errors: []});
        };
        reader.readAsText(file);
    }),
}));

// next/linkのモック
jest.mock('next/link', () => {
    const MockLink = ({href, children, className}: {href: string; children: React.ReactNode; className?: string}) => (
        <a href={href} className={className}>{children}</a>
    );
    MockLink.displayName = 'MockLink';
    return MockLink;
});

// Headerコンポーネントのモック
jest.mock('@/app/components/Header', () => {
    const MockHeader = () => <header data-testid="mock-header"><nav><a href="/">ホーム</a></nav></header>;
    MockHeader.displayName = 'MockHeader';
    return MockHeader;
});

// recharts のモック
jest.mock('recharts', () => ({
    PieChart: ({children}: {children: React.ReactNode}) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div/>,
    Cell: () => <div/>,
    Tooltip: () => <div/>,
    Legend: () => <div/>,
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
}));

function makeFile(content: string): File {
    return new File([content], 'test.csv', {type: 'text/csv'});
}

describe('UploadPage（CSVアップロードページ）', () => {
    it('ページタイトルが表示される', () => {
        render(<UploadPage/>);
        expect(screen.getByText('CSVアップロード')).toBeInTheDocument();
    });

    it('CSVアップローダーが表示される', () => {
        render(<UploadPage/>);
        expect(screen.getByRole('button', {name: 'CSVファイルをアップロード'})).toBeInTheDocument();
    });

    it('共通ヘッダーが表示される', () => {
        render(<UploadPage/>);
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });

    it('ページ説明文が表示される', () => {
        render(<UploadPage/>);
        expect(screen.getByText('CSV ファイルをアップロードして収支データを確認できます。')).toBeInTheDocument();
    });

    it('サンプルCSVダウンロードリンクが表示される', () => {
        render(<UploadPage/>);
        expect(screen.getByText('sample.csv をダウンロード')).toBeInTheDocument();
    });

    it('初期状態ではデータコンポーネントが表示されない', () => {
        render(<UploadPage/>);
        expect(screen.queryByText('合計収入')).not.toBeInTheDocument();
    });

    it('正常なCSVをアップロードするとデータが表示される', async () => {
        render(<UploadPage/>);

        const csv = '日付,カテゴリ,種別,金額,メモ\n2024-01-01,給与,収入,300000,1月分給与\n';
        const file = makeFile(csv);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {value: [file]});
        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText('合計収入')).toBeInTheDocument();
        });
    });

    it('バリデーションエラーのあるCSVをアップロードするとエラーが表示される', async () => {
        render(<UploadPage/>);

        const csv = '日付,カテゴリ,種別,金額,メモ\n2024-01-01,食料費,不明,5000,メモ\n';
        const file = makeFile(csv);
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        Object.defineProperty(input, 'files', {value: [file]});
        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText(/バリデーションエラー/)).toBeInTheDocument();
        });
    });
});
