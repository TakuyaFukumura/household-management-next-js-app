/**
 * ExpensePieChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpensePieChart from '@/app/components/ExpensePieChart';
import {Transaction} from '@/app/components/CsvUploader';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => <div
        data-testid="responsive-container">{children}</div>,
    PieChart: ({children}: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({data}: { data: { name: string; value: number }[] }) => (
        <div data-testid="pie">
            {data.map((entry) => (
                <span key={entry.name} data-testid={`pie-entry-${entry.name}`}>{entry.name}</span>
            ))}
        </div>
    ),
    Cell: () => <div/>,
    Label: () => <div data-testid="label"/>,
    Tooltip: () => <div data-testid="tooltip"/>,
    Sector: () => <div data-testid="sector"/>,
}));

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 50000, memo: ''},
    {date: '2024-01-10', category: '交通費', type: '支出', amount: 20000, memo: ''},
];

describe('ExpensePieChart', () => {
    describe('データありの場合', () => {
        it('グラフが表示される', () => {
            render(<ExpensePieChart transactions={transactions}/>);
            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        });

        it('支出カテゴリがグラフに表示される', () => {
            render(<ExpensePieChart transactions={transactions}/>);
            expect(screen.getByTestId('pie-entry-食料費')).toBeInTheDocument();
            expect(screen.getByTestId('pie-entry-交通費')).toBeInTheDocument();
        });

        it('収入カテゴリはグラフに表示されない', () => {
            render(<ExpensePieChart transactions={transactions}/>);
            expect(screen.queryByTestId('pie-entry-給与')).not.toBeInTheDocument();
        });

        it('タイトルが表示される', () => {
            render(<ExpensePieChart transactions={transactions}/>);
            expect(screen.getByText('支出割合')).toBeInTheDocument();
        });

        it('凡例が表示される', () => {
            render(<ExpensePieChart transactions={transactions}/>);
            expect(screen.getByRole('list')).toBeInTheDocument();
        });
    });

    describe('データなしの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<ExpensePieChart transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });

        it('グラフが表示されない', () => {
            render(<ExpensePieChart transactions={[]}/>);
            expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
        });
    });

    describe('収入のみの場合', () => {
        it('「データがありません」が表示される', () => {
            const incomeOnly: Transaction[] = [
                {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
            ];
            render(<ExpensePieChart transactions={incomeOnly}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });
    });

    describe('小スライス集約の場合', () => {
        it('3%未満のカテゴリは「その他」に集約される', () => {
            // 食料費: 97000 (97%), 交通費: 3000 (3%) → 交通費は MIN_PERCENTAGE=3 以上なので集約されない
            // 食料費: 98000 (98%), 交通費: 1000 (1%) → 交通費は 3% 未満なので「その他」に集約される
            const manyCategories: Transaction[] = [
                {date: '2024-01-01', category: '食料費', type: '支出', amount: 98000, memo: ''},
                {date: '2024-01-02', category: '交通費', type: '支出', amount: 1000, memo: ''},
            ];
            render(<ExpensePieChart transactions={manyCategories}/>);
            expect(screen.queryByTestId('pie-entry-交通費')).not.toBeInTheDocument();
            expect(screen.getByTestId('pie-entry-その他')).toBeInTheDocument();
        });

        it('3%以上のカテゴリは集約されない', () => {
            const transactions2: Transaction[] = [
                {date: '2024-01-01', category: '食料費', type: '支出', amount: 50000, memo: ''},
                {date: '2024-01-02', category: '交通費', type: '支出', amount: 20000, memo: ''},
            ];
            render(<ExpensePieChart transactions={transactions2}/>);
            expect(screen.getByTestId('pie-entry-食料費')).toBeInTheDocument();
            expect(screen.getByTestId('pie-entry-交通費')).toBeInTheDocument();
        });
    });
});
