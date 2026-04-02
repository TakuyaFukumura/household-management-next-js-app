/**
 * CSV共通ユーティリティ（src/lib/csv.ts）のテスト
 */
import {validateRow} from '@/lib/csv';

describe('validateRow', () => {
    describe('正常系', () => {
        it('支出の行を正しくパースできる', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '5000', 'スーパー'], 2);
            expect(result.error).toBeNull();
            expect(result.transaction).toEqual({
                date: '2024-01-05',
                category: '食料費',
                type: '支出',
                amount: 5000,
                memo: 'スーパー',
            });
        });

        it('収入の行を正しくパースできる', () => {
            const result = validateRow(['2024-01-01', '給与', '収入', '300000', '1月分給与'], 2);
            expect(result.error).toBeNull();
            expect(result.transaction).toEqual({
                date: '2024-01-01',
                category: '給与',
                type: '収入',
                amount: 300000,
                memo: '1月分給与',
            });
        });

        it('メモが空欄の行を正しくパースできる', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '5000', ''], 2);
            expect(result.error).toBeNull();
            expect(result.transaction?.memo).toBe('');
        });

        it('メモが未定義の場合は空文字列になる', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '5000'], 2);
            expect(result.error).toBeNull();
            expect(result.transaction?.memo).toBe('');
        });
    });

    describe('異常系', () => {
        it('必須フィールドが不足している場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出'], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toBe('必須フィールドが不足しています');
            expect(result.error?.row).toBe(2);
        });

        it('日付の形式が不正な場合はエラーを返す', () => {
            const result = validateRow(['2024/01/05', '食料費', '支出', '5000', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('日付の形式が不正です');
        });

        it('種別が収入・支出以外の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '不明', '5000', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('種別が不正です');
        });

        it('収入種別で収入カテゴリ以外の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '収入', '5000', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('カテゴリが不正です');
        });

        it('支出種別で支出カテゴリ以外の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '給与', '支出', '5000', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('カテゴリが不正です');
        });

        it('金額が0の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '0', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('金額が不正です');
        });

        it('金額が負の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '-100', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('金額が不正です');
        });

        it('金額が小数の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', '5000.5', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('金額が不正です');
        });

        it('金額が文字列の場合はエラーを返す', () => {
            const result = validateRow(['2024-01-05', '食料費', '支出', 'abc', ''], 2);
            expect(result.transaction).toBeNull();
            expect(result.error?.message).toContain('金額が不正です');
        });
    });
});
