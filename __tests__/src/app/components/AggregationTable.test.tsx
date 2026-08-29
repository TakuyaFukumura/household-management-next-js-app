import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import AggregationTable from '@/app/components/AggregationTable';
import type {CategoryAggregation} from '@/lib/aggregation';

const categories: CategoryAggregation[] = [
    {category: '未使用カテゴリ', type: '支出', monthCount: 12, median: 0, trimmedMean: 0, outlierCount: 0},
    {category: '特別費', type: '支出', monthCount: 12, median: 0, trimmedMean: 7960, outlierCount: 0},
];

describe('AggregationTable', () => {
    it('中央値と外れ値除外後平均がともに0円のカテゴリを表示しない', () => {
        render(<AggregationTable categories={categories} metric="median"/>);

        expect(screen.queryByText('未使用カテゴリ')).not.toBeInTheDocument();
        expect(screen.getByText('特別費')).toBeInTheDocument();
    });
});
