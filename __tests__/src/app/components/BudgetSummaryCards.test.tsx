/**
 * BudgetSummaryCards コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetSummaryCards from '@/app/components/BudgetSummaryCards';
import type {BudgetEntry} from '@/lib/budget';

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '副業', type: '収入', amount: 50000},
    {category: '食料費', type: '支出', amount: 50000},
    {category: '住宅費', type: '支出', amount: 80000},
];

describe('BudgetSummaryCards', () => {
    describe('基本的なレンダリング', () => {
        it('想定収入カードが表示される', () => {
            render(<BudgetSummaryCards budgetEntries={budgetEntries}/>);
            expect(screen.getByText('想定収入')).toBeInTheDocument();
        });

        it('想定支出カードが表示される', () => {
            render(<BudgetSummaryCards budgetEntries={budgetEntries}/>);
            expect(screen.getByText('想定支出')).toBeInTheDocument();
        });
    });

    describe('金額計算', () => {
        it('収入予算合計が正しく計算される', () => {
            render(<BudgetSummaryCards budgetEntries={budgetEntries}/>);
            expect(screen.getByText('¥400,000')).toBeInTheDocument();
        });

        it('支出予算合計が正しく計算される', () => {
            render(<BudgetSummaryCards budgetEntries={budgetEntries}/>);
            expect(screen.getByText('¥130,000')).toBeInTheDocument();
        });
    });

    describe('空データの場合', () => {
        it('全て¥0が表示される', () => {
            render(<BudgetSummaryCards budgetEntries={[]}/>);
            const zeros = screen.getAllByText('¥0');
            expect(zeros).toHaveLength(2);
        });
    });
});
