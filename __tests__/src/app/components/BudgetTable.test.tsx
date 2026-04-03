/**
 * BudgetTable コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetTable from '@/app/components/BudgetTable';
import type {BudgetEntry} from '@/lib/budget';
import type {Transaction} from '@/lib/csv';

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '食料費', type: '支出', amount: 50000},
];

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 350000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 55000, memo: ''},
];

describe('BudgetTable', () => {
    describe('基本的なレンダリング', () => {
        it('テーブルタイトルが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByText('予算設定')).toBeInTheDocument();
        });

        it('ヘッダーが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByText('カテゴリ')).toBeInTheDocument();
            expect(screen.getByText('種別')).toBeInTheDocument();
            expect(screen.getByText('予算金額')).toBeInTheDocument();
            expect(screen.getByText('実績金額')).toBeInTheDocument();
            expect(screen.getByText('差額')).toBeInTheDocument();
        });

        it('カテゴリが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries} transactions={transactions}/>);
            expect(screen.getByText('給与')).toBeInTheDocument();
            expect(screen.getByText('食料費')).toBeInTheDocument();
        });

        it('収入カテゴリが支出カテゴリより先に表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries} transactions={transactions}/>);
            const rows = screen.getAllByRole('row');
            const rowTexts = rows.map((r) => r.textContent ?? '');
            const incomeIndex = rowTexts.findIndex((t) => t.includes('給与'));
            const expenseIndex = rowTexts.findIndex((t) => t.includes('食料費'));
            expect(incomeIndex).toBeLessThan(expenseIndex);
        });
    });

    describe('差額計算', () => {
        it('収入が予算以上の場合は差額が緑色で表示される', () => {
            const sameBudgetEntries: BudgetEntry[] = [{category: '給与', type: '収入', amount: 350000}];
            const sameTxs: Transaction[] = [{date: '2024-01-01', category: '給与', type: '収入', amount: 350000, memo: ''}];
            render(<BudgetTable budgetEntries={sameBudgetEntries} transactions={sameTxs}/>);
            const diffCell = screen.getByText('¥0');
            expect(diffCell).toHaveClass('text-green-600');
        });

        it('支出が予算超過の場合は差額が赤色で表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries} transactions={transactions}/>);
            const diffCell = screen.getByText('+¥5,000');
            expect(diffCell).toHaveClass('text-red-600');
        });
    });

    describe('空データの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<BudgetTable budgetEntries={[]} transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });
    });
});
