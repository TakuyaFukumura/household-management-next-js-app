/**
 * TransactionTable コンポーネントのテスト
 */
import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionTable from '@/app/components/TransactionTable';
import {Transaction} from '@/app/components/CsvUploader';

const transactions: Transaction[] = [
    {date: '2024-01-01', category: '給与', type: '収入', amount: 300000, memo: '月給'},
    {date: '2024-01-10', category: '食料費', type: '支出', amount: 50000, memo: 'スーパー'},
    {date: '2024-01-05', category: '交通費', type: '支出', amount: 20000, memo: 'バス'},
];

describe('TransactionTable', () => {
    describe('基本的なレンダリング', () => {
        it('テーブルキャプションが表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('収支一覧')).toBeInTheDocument();
        });

        it('列ヘッダーが全て表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('日付')).toBeInTheDocument();
            expect(screen.getByText('カテゴリ')).toBeInTheDocument();
            expect(screen.getByText('種別')).toBeInTheDocument();
            expect(screen.getByText('金額')).toBeInTheDocument();
            expect(screen.getByText('メモ')).toBeInTheDocument();
        });

        it('th要素にscope属性が設定されている', () => {
            render(<TransactionTable transactions={transactions}/>);
            const headers = screen.getAllByRole('columnheader');
            headers.forEach((th) => {
                expect(th).toHaveAttribute('scope', 'col');
            });
        });
    });

    describe('データ表示', () => {
        it('全トランザクションが表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('給与')).toBeInTheDocument();
            expect(screen.getByText('食料費')).toBeInTheDocument();
            expect(screen.getByText('交通費')).toBeInTheDocument();
        });

        it('金額がフォーマットされて表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('¥300,000')).toBeInTheDocument();
        });

        it('メモが表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('月給')).toBeInTheDocument();
            expect(screen.getByText('スーパー')).toBeInTheDocument();
        });
    });

    describe('日付降順ソート', () => {
        it('最新の日付が先頭に来る', () => {
            render(<TransactionTable transactions={transactions}/>);
            const rows = screen.getAllByRole('row');
            // rows[0] = header, rows[1] = first data row
            expect(rows[1]).toHaveTextContent('10日');
        });
    });

    describe('日付表示形式', () => {
        it('日付列には日のみ「DD日」形式で表示される', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.getByText('10日')).toBeInTheDocument();
            expect(screen.getByText('5日')).toBeInTheDocument();
            expect(screen.getByText('1日')).toBeInTheDocument();
        });

        it('YYYY-MM-DD 形式の日付文字列がそのまま表示されない', () => {
            render(<TransactionTable transactions={transactions}/>);
            expect(screen.queryByText('2024-01-10')).not.toBeInTheDocument();
            expect(screen.queryByText('2024-01-05')).not.toBeInTheDocument();
            expect(screen.queryByText('2024-01-01')).not.toBeInTheDocument();
        });
    });

    describe('空データの場合', () => {
        it('「データがありません」が表示される', () => {
            render(<TransactionTable transactions={[]}/>);
            expect(screen.getByText('データがありません')).toBeInTheDocument();
        });
    });
});
