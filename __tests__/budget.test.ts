/**
 * 予算データユーティリティ（src/lib/budget.ts）のテスト
 */
import {validateBudgetRow} from '@/lib/budget';

describe('validateBudgetRow', () => {
    describe('正常系', () => {
        it('収入の行を正しくパースできる', () => {
            const result = validateBudgetRow(['給与', '収入', '350000'], 2);
            expect(result.error).toBeNull();
            expect(result.entry).toEqual({
                category: '給与',
                type: '収入',
                amount: 350000,
            });
        });

        it('支出の行を正しくパースできる', () => {
            const result = validateBudgetRow(['食料費', '支出', '50000'], 2);
            expect(result.error).toBeNull();
            expect(result.entry).toEqual({
                category: '食料費',
                type: '支出',
                amount: 50000,
            });
        });
    });

    describe('異常系', () => {
        it('カラム数が3未満の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('カラム数が不正です');
        });

        it('カラム数が3より多い場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入', '350000', '余分'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('カラム数が不正です');
        });

        it('必須フィールドが空の場合はエラーを返す', () => {
            const result = validateBudgetRow(['', '収入', '350000'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toBe('必須フィールドが不足しています');
        });

        it('種別が収入・支出以外の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '不明', '350000'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('種別が不正です');
        });

        it('予算金額が0の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入', '0'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('予算金額が不正です');
        });

        it('予算金額が負の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入', '-1000'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('予算金額が不正です');
        });

        it('予算金額が小数の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入', '350000.5'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('予算金額が不正です');
        });

        it('予算金額が文字列の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '収入', 'abc'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('予算金額が不正です');
        });

        it('収入種別で収入カテゴリ以外の場合はエラーを返す', () => {
            const result = validateBudgetRow(['食料費', '収入', '350000'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('収入カテゴリが不正です');
        });

        it('支出種別で支出カテゴリ以外の場合はエラーを返す', () => {
            const result = validateBudgetRow(['給与', '支出', '50000'], 2);
            expect(result.entry).toBeNull();
            expect(result.error?.message).toContain('支出カテゴリが不正です');
        });

        it('エラー時にrow番号が正しく設定される', () => {
            const result = validateBudgetRow(['給与', '収入'], 5);
            expect(result.error?.row).toBe(5);
        });
    });
});
