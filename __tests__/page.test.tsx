/**
 * メインページ（/）のテスト
 * - 自動読み込み動作をfetchモックで検証する
 */
import React from 'react';
import {act, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// papaparseのモック
jest.mock('papaparse', () => ({
    parse: jest.fn((text: string, options: {skipEmptyLines?: boolean; complete: (results: {data: string[][]; errors: {row?: number; message: string}[]}) => void}) => {
        const rows = text.split('\n').filter(Boolean).map((row) => row.split(','));
        options.complete({data: rows, errors: []});
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

// recharts のモック
jest.mock('recharts', () => ({
    PieChart: ({children}: {children: React.ReactNode}) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div/>,
    Cell: () => <div/>,
    Tooltip: () => <div/>,
    Legend: () => <div/>,
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
    BarChart: ({children}: {children: React.ReactNode}) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => <div/>,
    CartesianGrid: () => <div/>,
    XAxis: () => <div/>,
    YAxis: () => <div/>,
}));

const SAMPLE_CSV = [
    '日付,カテゴリ,種別,金額,メモ',
    '2024-01-01,給与,収入,300000,1月分給与',
    '2024-01-05,食料費,支出,5000,スーパー',
].join('\n');

/** すべての保留中のPromiseをフラッシュするヘルパー */
const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('Home（メインページ）', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('初期表示でローディングメッセージが表示される', () => {
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
        render(<Home/>);
        expect(screen.getByText('データを読み込み中...')).toBeInTheDocument();
    });

    it('CSVを正常に読み込んだ後にデータが表示される', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(SAMPLE_CSV),
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByText('合計収入')).toBeInTheDocument();
        expect(screen.getByText('合計支出')).toBeInTheDocument();
        expect(screen.getByText('収支差額')).toBeInTheDocument();
    });

    it('fetchが失敗した場合にエラーメッセージが表示される', async () => {
        (global.fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    it('HTTPエラーレスポンスの場合にエラーメッセージが表示される', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            status: 404,
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByText(/CSVファイルの取得に失敗しました/)).toBeInTheDocument();
    });

    it('/uploadへのナビゲーションリンクが表示される', () => {
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
        render(<Home/>);
        expect(screen.getByRole('link', {name: 'CSVをアップロード'})).toBeInTheDocument();
    });

    it('バリデーションエラーがある場合はエラー一覧が表示される', async () => {
        const csvWithError = [
            '日付,カテゴリ,種別,金額,メモ',
            '2024-01-05,食料費,不明,5000,スーパー',
        ].join('\n');

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(csvWithError),
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByText(/バリデーションエラー/)).toBeInTheDocument();
    });

    it('CSVを正常に読み込んだ後に月ナビゲーターが表示される', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(SAMPLE_CSV),
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByRole('button', {name: /前月/})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /翌月/})).toBeInTheDocument();
    });

    it('CSV読み込み後に最新月（2024年01月）が初期表示される', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(SAMPLE_CSV),
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        expect(screen.getByText('2024年01月')).toBeInTheDocument();
    });

    it('データが存在しない月を選択した場合「データがありません」が表示される', async () => {
        // SAMPLE_CSV のデータは 2024-01 のみなので、初期月が 2024-01 に設定される
        // その後「翌月」ボタンで 2024-02 に移動するとデータなし表示になる
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(SAMPLE_CSV),
        });

        await act(async () => {
            render(<Home/>);
            await flushPromises();
        });

        const nextButton = screen.getByRole('button', {name: /翌月/});
        await act(async () => {
            nextButton.click();
        });

        expect(screen.getByText('データがありません')).toBeInTheDocument();
    });
});
