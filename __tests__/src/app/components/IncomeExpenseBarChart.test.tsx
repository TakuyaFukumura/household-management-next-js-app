/**
 * IncomeExpenseBarChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import IncomeExpenseBarChart from '@/app/components/IncomeExpenseBarChart';
import {Transaction} from '@/app/components/CsvUploader';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({children}: {children: React.ReactNode}) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({children}: {children: React.ReactNode}) => <div data-testid="bar">{children}</div>,
    Cell: () => <div/>,
    CartesianGrid: () => <div/>,
    XAxis: () => <div data-testid="x-axis"/>,
    YAxis: () => <div data-testid="y-axis"/>,
    Legend: () => <div data-testid="legend"/>,
    Tooltip: () => <div data-testid="tooltip"/>,
}));

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 350000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 120000, memo: ''},
    {date: '2024-01-10', category: '交通費', type: '支出', amount: 100000, memo: ''},
];

describe('IncomeExpenseBarChart', () => {
    describe('データありの場合', () => {
        it('グラフが表示される', () => {
            render(<IncomeExpenseBarChart transactions={transactions}/>);
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('タイトルが表示される', () => {
            render(<IncomeExpenseBarChart transactions={transactions}/>);
            expect(screen.getByText('収支比較')).toBeInTheDocument();
        });

        it('ResponsiveContainer が表示される', () => {
            render(<IncomeExpenseBarChart transactions={transactions}/>);
            expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
        });
    });

    describe('データなしの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<IncomeExpenseBarChart transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });

        it('グラフが表示されない', () => {
            render(<IncomeExpenseBarChart transactions={[]}/>);
            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });

    describe('収入のみの場合', () => {
        it('グラフが表示される', () => {
            const incomeOnly: Transaction[] = [
                {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
            ];
            render(<IncomeExpenseBarChart transactions={incomeOnly}/>);
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });

    describe('支出のみの場合', () => {
        it('グラフが表示される', () => {
            const expenseOnly: Transaction[] = [
                {date: '2024-01-05', category: '食料費', type: '支出', amount: 50000, memo: ''},
            ];
            render(<IncomeExpenseBarChart transactions={expenseOnly}/>);
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });
    });
});
