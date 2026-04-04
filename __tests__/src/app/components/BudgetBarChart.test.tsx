/**
 * BudgetBarChart コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetBarChart from '@/app/components/BudgetBarChart';
import type {BudgetEntry} from '@/lib/budget';

jest.mock('recharts', () => ({
    ResponsiveContainer: ({children}: { children: React.ReactNode }) => <div
        data-testid="responsive-container">{children}</div>,
    BarChart: ({children}: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({children}: { children: React.ReactNode }) => <div data-testid="bar">{children}</div>,
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

        it('差額ラベルが表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries}/>);
            expect(screen.getByText('差額:')).toBeInTheDocument();
        });

        it('黒字の場合、差額が緑色で表示される', () => {
            render(<BudgetBarChart budgetEntries={budgetEntries}/>);
            // 収入400000 - 支出50000 = 350000（黒字）
            const differenceSpan = screen.getByText('¥350,000');
            expect(differenceSpan).toHaveClass('text-green-600');
        });

        it('赤字の場合、差額が赤色で表示される', () => {
            const deficitEntries: BudgetEntry[] = [
                {category: '給与', type: '収入', amount: 30000},
                {category: '食料費', type: '支出', amount: 50000},
            ];
            render(<BudgetBarChart budgetEntries={deficitEntries}/>);
            // 収入30000 - 支出50000 = -20000（赤字）
            const differenceSpan = screen.getByText('-¥20,000');
            expect(differenceSpan).toHaveClass('text-red-600');
        });

        it('差額がゼロの場合、グレーで表示される', () => {
            const breakEvenEntries: BudgetEntry[] = [
                {category: '給与', type: '収入', amount: 50000},
                {category: '食料費', type: '支出', amount: 50000},
            ];
            render(<BudgetBarChart budgetEntries={breakEvenEntries}/>);
            // 収入50000 - 支出50000 = 0
            const differenceSpan = screen.getByText('¥0');
            expect(differenceSpan).toHaveClass('text-gray-600');
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

        it('差額ラベルが表示されない', () => {
            render(<BudgetBarChart budgetEntries={[]}/>);
            expect(screen.queryByText('差額:')).not.toBeInTheDocument();
        });
    });
});
