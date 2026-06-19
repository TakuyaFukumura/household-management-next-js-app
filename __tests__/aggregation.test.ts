import {aggregateTransactions, calculateRepresentativeStats} from '@/lib/aggregation';
import type {Transaction} from '@/lib/csv';

describe('calculateRepresentativeStats', () => {
    it('非0円データのIQR判定で外れ値を除外し、0円の月は平均計算に残す', () => {
        const stats = calculateRepresentativeStats([0, 0, 100, 110, 120, 130, 1000]);

        expect(stats.monthCount).toBe(7);
        expect(stats.median).toBe(110);
        expect(stats.outlierCount).toBe(1);
        expect(stats.trimmedMean).toBeCloseTo((0 + 0 + 100 + 110 + 120 + 130) / 6, 5);
    });

    it('対象月数または非0件数が不足する場合は外れ値除外を行わない', () => {
        const stats = calculateRepresentativeStats([0, 100, 200, 10000]);

        expect(stats.outlierCount).toBe(0);
        expect(stats.trimmedMean).toBe((0 + 100 + 200 + 10000) / 4);
    });
});

describe('aggregateTransactions', () => {
    const transactions: Transaction[] = [
        {date: '2025-01-01', category: '給与', type: '収入', amount: 300000, memo: ''},
        {date: '2025-01-05', category: '食料費', type: '支出', amount: 10000, memo: ''},
        {date: '2025-02-01', category: '給与', type: '収入', amount: 300000, memo: ''},
        {date: '2025-02-05', category: '食料費', type: '支出', amount: 12000, memo: ''},
        {date: '2025-03-01', category: '給与', type: '収入', amount: 300000, memo: ''},
        {date: '2025-03-05', category: '食料費', type: '支出', amount: 11000, memo: ''},
        {date: '2025-04-01', category: '給与', type: '収入', amount: 300000, memo: ''},
        {date: '2025-04-05', category: '食料費', type: '支出', amount: 9000, memo: ''},
        {date: '2025-05-01', category: '給与', type: '収入', amount: 300000, memo: ''},
        {date: '2025-05-05', category: '食料費', type: '支出', amount: 100000, memo: ''},
        {date: '2025-05-10', category: '副業', type: '収入', amount: 50000, memo: ''},
    ];

    it('カテゴリごとの月次合計から代表値を集計する', () => {
        const result = aggregateTransactions(transactions, {period: 'all', typeFilter: 'expense'});
        const food = result.categories.find((category) => category.category === '食料費');

        expect(result.months).toEqual(['2025-01', '2025-02', '2025-03', '2025-04', '2025-05']);
        expect(food).toEqual(expect.objectContaining({
            category: '食料費',
            type: '支出',
            monthCount: 5,
            median: 11000,
            outlierCount: 1,
        }));
        expect(food?.trimmedMean).toBe(10500);
    });

    it('収支差額は月次差額系列から直接計算する', () => {
        const result = aggregateTransactions(transactions, {period: 'all', typeFilter: 'all'});

        expect(result.balance.median).toBe(289000);
        expect(result.balance.trimmedMean).toBe(289500);
    });
});
