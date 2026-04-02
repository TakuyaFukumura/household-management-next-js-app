/**
 * SummaryCards コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryCards from '@/app/components/SummaryCards';
import {Transaction} from '@/app/components/CsvUploader';

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 50000, memo: ''},
    {date: '2024-01-10', category: '交通費', type: '支出', amount: 20000, memo: ''},
];

describe('SummaryCards', () => {
    describe('基本的なレンダリング', () => {
        it('合計収入カードが表示される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('合計収入')).toBeInTheDocument();
        });

        it('合計支出カードが表示される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('合計支出')).toBeInTheDocument();
        });

        it('収支差額カードが表示される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('収支差額')).toBeInTheDocument();
        });
    });

    describe('金額計算', () => {
        it('合計収入が正しく計算される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('¥300,000')).toBeInTheDocument();
        });

        it('合計支出が正しく計算される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('¥70,000')).toBeInTheDocument();
        });

        it('収支差額が正しく計算される', () => {
            render(<SummaryCards transactions={transactions}/>);
            expect(screen.getByText('¥230,000')).toBeInTheDocument();
        });
    });

    describe('空データの場合', () => {
        it('全て¥0が表示される', () => {
            render(<SummaryCards transactions={[]}/>);
            const zeros = screen.getAllByText('¥0');
            expect(zeros).toHaveLength(3);
        });
    });
});
