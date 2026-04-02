/**
 * BudgetBarChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetBarChart from '@/app/components/BudgetBarChart';
import type {BudgetEntry} from '@/lib/budget';
import type {Transaction} from '@/lib/csv';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({children}: {children: React.ReactNode}) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({children}: {children: React.ReactNode}) => <div data-testid="bar">{children}</div>,
    Cell: () => <div/>,
    CartesianGrid: () => <div/>,
    XAxis: () => <div data-testid="x-axis"/>,
    YAxis: () => <div data-testid="y-axis"/>,
    Legend: ({content}: {content: () => React.ReactNode}) => <div data-testid="legend">{content()}</div>,
    Tooltip: () => <div data-testid="tooltip"/>,
}));

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '副業', type: '収入', amount: 50000},
    {category: '食料費', type: '支出', amount: 50000},
];

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 350000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 55000, memo: ''},
];

describe('BudgetBarChart', () => {
    describe('データありの場合', () => {
        it('グラフが表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('タイトルが表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByText('収支比較（予算 vs 実績）')).toBeInTheDocument();
        });

        it('凡例に予算・実績が表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByText('予算')).toBeInTheDocument();
            expect(screen.getByText('実績')).toBeInTheDocument();
        });
    });

    describe('データなしの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<BudgetBarChart budgetEntries={[]} transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });

        it('グラフが表示されない', () => {
            render(<BudgetBarChart budgetEntries={[]} transactions={[]}/>);
            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });
});
