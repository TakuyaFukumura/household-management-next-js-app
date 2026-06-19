import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryPage from '@/app/summary/page';

jest.mock('papaparse', () => ({
    parse: jest.fn((text: string, options: {
        skipEmptyLines?: boolean;
        complete: (results: { data: string[][]; errors: { row?: number; message: string }[] }) => void
    }) => {
        const rows = text.split('\n').filter(Boolean).map((row) => row.split(','));
        options.complete({data: rows, errors: []});
    }),
}));

jest.mock('@/app/components/Header', () => {
    const MockHeader = () => <header data-testid="mock-header">header</header>;
    MockHeader.displayName = 'MockHeader';
    return MockHeader;
});

jest.mock('recharts', () => ({
    PieChart: ({children}: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({children}: { children?: React.ReactNode }) => <div>{children}</div>,
    Cell: () => <div/>,
    Tooltip: () => <div/>,
    Legend: () => <div/>,
    Label: () => <div/>,
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({children}: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({children}: { children?: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => <div/>,
    XAxis: () => <div/>,
    YAxis: () => <div/>,
    Sector: () => <div/>,
}));

const SAMPLE_CSV = [
    '日付,カテゴリ,種別,金額,メモ',
    '2025-01-01,給与,収入,300000,1月分給与',
    '2025-01-05,食料費,支出,10000,スーパー',
    '2025-02-01,給与,収入,300000,2月分給与',
    '2025-02-05,食料費,支出,12000,スーパー',
    '2025-03-01,給与,収入,300000,3月分給与',
    '2025-03-05,食料費,支出,11000,スーパー',
    '2025-04-01,給与,収入,300000,4月分給与',
    '2025-04-05,食料費,支出,9000,スーパー',
    '2025-05-01,給与,収入,300000,5月分給与',
    '2025-05-05,食料費,支出,100000,臨時出費',
].join('\n');

const flushPromises = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe('SummaryPage（集計ページ）', () => {
    beforeEach(() => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            text: () => Promise.resolve(SAMPLE_CSV),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('集計条件と代表月間カードを表示する', async () => {
        await act(async () => {
            render(<SummaryPage/>);
            await flushPromises();
        });

        expect(screen.getByText('集計ページ')).toBeInTheDocument();
        expect(screen.getByLabelText('集計期間')).toHaveValue('12');
        expect(screen.getByLabelText('対象種別')).toHaveValue('all');
        expect(screen.getByLabelText('主表示')).toHaveValue('median');
        expect(screen.getByText('代表月間収入')).toBeInTheDocument();
        expect(screen.getByText('代表月間支出')).toBeInTheDocument();
        expect(screen.getByText('代表月間収支差額')).toBeInTheDocument();
    });

    it('主表示を切り替えると外れ値除外後平均ベースの金額を表示する', async () => {
        await act(async () => {
            render(<SummaryPage/>);
            await flushPromises();
        });

        fireEvent.change(screen.getByLabelText('主表示'), {target: {value: 'trimmedMean'}});

        expect(screen.getAllByText('¥10,500').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/主表示: 外れ値除外後平均/)).toHaveLength(3);
    });
});
