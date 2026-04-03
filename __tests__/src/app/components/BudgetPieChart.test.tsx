/**
 * BudgetPieChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetPieChart from '@/app/components/BudgetPieChart';
import type {BudgetEntry} from '@/lib/budget';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: {children: React.ReactNode}) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({children}: {children: React.ReactNode}) => <div data-testid="pie-chart">{children}</div>,
    Pie: ({children}: {children: React.ReactNode}) => <div data-testid="pie">{children}</div>,
    Cell: () => <div/>,
    Label: () => <div/>,
    Tooltip: () => <div data-testid="tooltip"/>,
    Sector: () => <div/>,
}));

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '食料費', type: '支出', amount: 50000},
    {category: '住宅費', type: '支出', amount: 80000},
];

describe('BudgetPieChart', () => {
    describe('データありの場合', () => {
        it('グラフが表示される', () => {
            render(<BudgetPieChart budgetEntries={budgetEntries}/>);
            expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
        });

        it('タイトルが表示される', () => {
            render(<BudgetPieChart budgetEntries={budgetEntries}/>);
            expect(screen.getByText('支出予算の割合')).toBeInTheDocument();
        });
    });

    describe('支出データなしの場合', () => {
        it('「データがありません」が表示される', () => {
            const incomeOnly: BudgetEntry[] = [{category: '給与', type: '収入', amount: 350000}];
            render(<BudgetPieChart budgetEntries={incomeOnly}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });

        it('グラフが表示されない', () => {
            render(<BudgetPieChart budgetEntries={[]}/>);
            expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument();
        });
    });
});
