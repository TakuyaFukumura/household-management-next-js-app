/**
 * CategoryTable コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import CategoryTable from '@/app/components/CategoryTable';
import {Transaction} from '@/app/components/CsvUploader';

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
    {date: '2024-01-05', category: '食料費', type: '支出', amount: 50000, memo: ''},
    {date: '2024-01-06', category: '食料費', type: '支出', amount: 10000, memo: ''},
    {date: '2024-01-10', category: '交通費', type: '支出', amount: 20000, memo: ''},
];

describe('CategoryTable', () => {
    describe('基本的なレンダリング', () => {
        it('テーブルキャプションが表示される', () => {
            render(<CategoryTable transactions={transactions}/>);
            expect(screen.getByText('カテゴリ別支出')).toBeInTheDocument();
        });

        it('列ヘッダーが全て表示される', () => {
            render(<CategoryTable transactions={transactions}/>);
            expect(screen.getByText('カテゴリ')).toBeInTheDocument();
            expect(screen.getByText('合計金額')).toBeInTheDocument();
            expect(screen.getByText('割合')).toBeInTheDocument();
        });

        it('th要素にscope属性が設定されている', () => {
            render(<CategoryTable transactions={transactions}/>);
            const headers = screen.getAllByRole('columnheader');
            headers.forEach((th) => {
                expect(th).toHaveAttribute('scope', 'col');
            });
        });
    });

    describe('データ集計', () => {
        it('支出カテゴリのみが集計される（収入は除外）', () => {
            render(<CategoryTable transactions={transactions}/>);
            expect(screen.queryByText('給与')).not.toBeInTheDocument();
            expect(screen.getByText('食料費')).toBeInTheDocument();
            expect(screen.getByText('交通費')).toBeInTheDocument();
        });

        it('同カテゴリの支出が合算される', () => {
            render(<CategoryTable transactions={transactions}/>);
            expect(screen.getByText('¥60,000')).toBeInTheDocument();
        });

        it('割合が正しく計算される', () => {
            render(<CategoryTable transactions={transactions}/>);
            // 食費: 60000/80000 = 75.0%, 交通費: 20000/80000 = 25.0%
            expect(screen.getByText('75.0%')).toBeInTheDocument();
            expect(screen.getByText('25.0%')).toBeInTheDocument();
        });
    });

    describe('降順ソート', () => {
        it('合計金額が高い順に表示される', () => {
            render(<CategoryTable transactions={transactions}/>);
            const rows = screen.getAllByRole('row');
            // rows[0] = header, rows[1] = first data row (食料費 60000), rows[2] = 交通費 20000
            expect(rows[1]).toHaveTextContent('食料費');
            expect(rows[2]).toHaveTextContent('交通費');
        });
    });

    describe('空データの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<CategoryTable transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });
    });
});
