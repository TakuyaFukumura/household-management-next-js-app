/**
 * BudgetTable コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetTable from '@/app/components/BudgetTable';
import type {BudgetEntry} from '@/lib/budget';

const budgetEntries: BudgetEntry[] = [
    {category: '給与', type: '収入', amount: 350000},
    {category: '食料費', type: '支出', amount: 50000},
];

describe('BudgetTable', () => {
    describe('基本的なレンダリング', () => {
        it('テーブルタイトルが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries}/>);
            expect(screen.getByText('予算設定')).toBeInTheDocument();
        });

        it('ヘッダーが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries}/>);
            expect(screen.getByText('カテゴリ')).toBeInTheDocument();
            expect(screen.getByText('種別')).toBeInTheDocument();
            expect(screen.getByText('予算金額')).toBeInTheDocument();
            expect(screen.queryByText('実績金額')).not.toBeInTheDocument();
            expect(screen.queryByText('差額')).not.toBeInTheDocument();
        });

        it('カテゴリが表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries}/>);
            expect(screen.getByText('給与')).toBeInTheDocument();
            expect(screen.getByText('食料費')).toBeInTheDocument();
        });

        it('収入カテゴリが支出カテゴリより先に表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries}/>);
            const rows = screen.getAllByRole('row');
            const rowTexts = rows.map((r) => r.textContent ?? '');
            const incomeIndex = rowTexts.findIndex((t) => t.includes('給与'));
            const expenseIndex = rowTexts.findIndex((t) => t.includes('食料費'));
            expect(incomeIndex).toBeLessThan(expenseIndex);
        });

        it('予算金額が表示される', () => {
            render(<BudgetTable budgetEntries={budgetEntries}/>);
            expect(screen.getByText('¥350,000')).toBeInTheDocument();
            expect(screen.getByText('¥50,000')).toBeInTheDocument();
        });
    });

    describe('空データの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<BudgetTable budgetEntries={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });
    });
});
