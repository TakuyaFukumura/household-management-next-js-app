/**
 * BudgetBarChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetBarChart from '@/app/components/BudgetBarChart';
import type {BudgetEntry} from '@/lib/budget';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({children}: {children: React.ReactNode}) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({children}: {children: React.ReactNode}) => <div data-testid="bar">{children}</div>,
    Cell: () => <div/>,
    CartesianGrid: () => <div/>,
    XAxis: () => <div data-testid="x-axis"/>,
    YAxis: () => <div data-testid="y-axis"/>,
    Tooltip: () => <div data-testid="tooltip"/>,
}));

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '副業', type: '収入', amount: 50000},
    {category: '食料費', type: '支出', amount: 50000},
];

describe('BudgetBarChart', () => {
    describe('データありの場合', () => {
        it('グラフが表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries}/>);
            expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
        });

        it('タイトルが表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries}/>);
            expect(screen.getByText('収支予算')).toBeInTheDocument();
        });
    });

    describe('データなしの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<BudgetBarChart budgetEntries={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });

        it('グラフが表示されない', () => {
            render(<BudgetBarChart budgetEntries={[]}/>);
            expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument();
        });
    });
});
