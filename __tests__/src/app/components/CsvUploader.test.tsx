/**
 * CsvUploader コンポーネントのテスト
 */
import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import CsvUploader from '@/app/components/CsvUploader';

jest.mock('papaparse', () => ({
    parse: jest.fn((file: File, options: {complete: (results: {data: string[][]}) => void}) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split('\n').filter(Boolean).map((row) => row.split(','));
            options.complete({data: rows});
        };
        reader.readAsText(file);
    }),
}));

function makeFile(content: string): File {
    return new File([content], 'test.csv', {type: 'text/csv'});
}

describe('CsvUploader', () => {
    describe('基本的なレンダリング', () => {
        it('アップロードエリアが表示される', () => {
            render(<CsvUploader onDataLoaded={jest.fn()}/>);
            expect(screen.getByText('CSVファイルをドロップ、またはクリックして選択')).toBeInTheDocument();
        });

        it('フォーマット説明が表示される', () => {
            render(<CsvUploader onDataLoaded={jest.fn()}/>);
            expect(screen.getByText('フォーマット: 日付,カテゴリ,種別,金額,メモ')).toBeInTheDocument();
        });

        it('aria-labelが設定されている', () => {
            render(<CsvUploader onDataLoaded={jest.fn()}/>);
            expect(screen.getByRole('button', {name: 'CSVファイルをアップロード'})).toBeInTheDocument();
        });
    });

    describe('ファイルの解析', () => {
        it('正常なCSVファイルをパースしてコールバックを呼ぶ', async () => {
            const onDataLoaded = jest.fn();
            render(<CsvUploader onDataLoaded={onDataLoaded}/>);

            const csv = 'date,category,type,amount,memo\n2024-01-01,食費,支出,5000,スーパー\n';
            const file = makeFile(csv);
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;

            Object.defineProperty(input, 'files', {value: [file]});
            fireEvent.change(input);

            await waitFor(() => {
                expect(onDataLoaded).toHaveBeenCalled();
            });

            const [transactions, errors] = onDataLoaded.mock.calls[0];
            expect(transactions).toHaveLength(1);
            expect(transactions[0]).toMatchObject({
                date: '2024-01-01',
                category: '食費',
                type: '支出',
                amount: 5000,
                memo: 'スーパー',
            });
            expect(errors).toHaveLength(0);
        });

        it('不正な行をスキップしてエラーを返す', async () => {
            const onDataLoaded = jest.fn();
            render(<CsvUploader onDataLoaded={onDataLoaded}/>);

            const csv = 'date,category,type,amount,memo\n2024-01-01,食費,不明,5000,メモ\n';
            const file = makeFile(csv);
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;

            Object.defineProperty(input, 'files', {value: [file]});
            fireEvent.change(input);

            await waitFor(() => {
                expect(onDataLoaded).toHaveBeenCalled();
            });

            const [transactions, errors] = onDataLoaded.mock.calls[0];
            expect(transactions).toHaveLength(0);
            expect(errors).toHaveLength(1);
            expect(errors[0].row).toBe(2);
        });
    });

    describe('ドラッグ&ドロップ', () => {
        it('ドラッグオーバー時にスタイルが変わる', () => {
            render(<CsvUploader onDataLoaded={jest.fn()}/>);
            const dropArea = screen.getByRole('button', {name: 'CSVファイルをアップロード'});

            fireEvent.dragOver(dropArea);
            expect(dropArea.className).toContain('border-blue-500');

            fireEvent.dragLeave(dropArea);
            expect(dropArea.className).not.toContain('border-blue-500');
        });
    });
});
