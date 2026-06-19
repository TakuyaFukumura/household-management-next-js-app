import {EXPENSE_CATEGORIES, INCOME_CATEGORIES} from './constants';
import type {Transaction} from './csv';

export type SummaryPeriod = 3 | 6 | 12 | 'all';
export type SummaryDisplayMetric = 'median' | 'trimmedMean';
export type SummaryTypeFilter = 'all' | 'income' | 'expense';

export interface RepresentativeStats {
    monthCount: number;
    median: number;
    trimmedMean: number;
    outlierCount: number;
}

export interface CategoryAggregation extends RepresentativeStats {
    category: string;
    type: Transaction['type'];
}

export interface SummaryAggregationResult {
    months: string[];
    income: RepresentativeStats;
    expense: RepresentativeStats;
    balance: RepresentativeStats;
    categories: CategoryAggregation[];
    expenseCategories: CategoryAggregation[];
}

export interface SummaryAggregationOptions {
    period: SummaryPeriod;
    typeFilter: SummaryTypeFilter;
}

function getMonthKey(date: string): string {
    return date.slice(0, 7);
}

function compareMonthKeys(a: string, b: string): number {
    return a.localeCompare(b);
}

function addMonths(monthKey: string, offset: number): string {
    const [yearText, monthText] = monthKey.split('-');
    const date = new Date(Number(yearText), Number(monthText) - 1 + offset, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function listMonths(startMonth: string, endMonth: string): string[] {
    const months: string[] = [];

    for (let month = startMonth; compareMonthKeys(month, endMonth) <= 0; month = addMonths(month, 1)) {
        months.push(month);
    }

    return months;
}

function sum(values: readonly number[]): number {
    return values.reduce((total, value) => total + value, 0);
}

function mean(values: readonly number[]): number {
    return values.length === 0 ? 0 : sum(values) / values.length;
}

export function calculateMedian(values: readonly number[]): number {
    if (values.length === 0) {
        return 0;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function calculateQuartile(sortedValues: readonly number[], percentile: number): number {
    if (sortedValues.length === 1) {
        return sortedValues[0];
    }

    const index = (sortedValues.length - 1) * percentile;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);

    if (lowerIndex === upperIndex) {
        return sortedValues[lowerIndex];
    }

    const weight = index - lowerIndex;
    return sortedValues[lowerIndex] + (sortedValues[upperIndex] - sortedValues[lowerIndex]) * weight;
}

export function calculateRepresentativeStats(values: readonly number[]): RepresentativeStats {
    if (values.length === 0) {
        return {
            monthCount: 0,
            median: 0,
            trimmedMean: 0,
            outlierCount: 0,
        };
    }

    const median = calculateMedian(values);
    const nonZeroValues = values.filter((value) => value !== 0).sort((a, b) => a - b);

    if (values.length < 4 || nonZeroValues.length < 4) {
        return {
            monthCount: values.length,
            median,
            trimmedMean: mean(values),
            outlierCount: 0,
        };
    }

    const q1 = calculateQuartile(nonZeroValues, 0.25);
    const q3 = calculateQuartile(nonZeroValues, 0.75);
    const iqr = q3 - q1;

    if (iqr === 0) {
        return {
            monthCount: values.length,
            median,
            trimmedMean: mean(values),
            outlierCount: 0,
        };
    }

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const filteredNonZeroValues = nonZeroValues.filter((value) => value >= lowerBound && value <= upperBound);
    const outlierCount = nonZeroValues.length - filteredNonZeroValues.length;

    if (outlierCount === 0) {
        return {
            monthCount: values.length,
            median,
            trimmedMean: mean(values),
            outlierCount: 0,
        };
    }

    const filteredValues = values.filter((value) => value === 0 || (value >= lowerBound && value <= upperBound));
    const valuesForMean = filteredValues.length === 0 ? values : filteredValues;

    return {
        monthCount: values.length,
        median,
        trimmedMean: mean(valuesForMean),
        outlierCount,
    };
}

function getSelectedMonths(transactions: readonly Transaction[], period: SummaryPeriod): string[] {
    if (transactions.length === 0) {
        return [];
    }

    const months = transactions.map((transaction) => getMonthKey(transaction.date)).sort(compareMonthKeys);
    const earliestMonth = months[0];
    const latestMonth = months[months.length - 1];
    const allMonths = listMonths(earliestMonth, latestMonth);

    if (period === 'all' || allMonths.length <= period) {
        return allMonths;
    }

    return allMonths.slice(-period);
}

function getSelectedCategories(typeFilter: SummaryTypeFilter): CategoryAggregation['type'][] {
    if (typeFilter === 'income') {
        return ['収入'];
    }

    if (typeFilter === 'expense') {
        return ['支出'];
    }

    return ['収入', '支出'];
}

function buildMonthlyTotals(transactions: readonly Transaction[], months: readonly string[], type: Transaction['type'], category?: string): number[] {
    return months.map((month) => transactions
        .filter((transaction) => {
            if (getMonthKey(transaction.date) !== month || transaction.type !== type) {
                return false;
            }

            return category ? transaction.category === category : true;
        })
        .reduce((total, transaction) => total + transaction.amount, 0));
}

export function getRepresentativeValue(stats: RepresentativeStats, metric: SummaryDisplayMetric): number {
    return metric === 'trimmedMean' ? stats.trimmedMean : stats.median;
}

export function formatMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    return `${year}年${month}月`;
}

export function aggregateTransactions(
    transactions: readonly Transaction[],
    options: SummaryAggregationOptions,
): SummaryAggregationResult {
    const months = getSelectedMonths(transactions, options.period);
    const incomeTotals = buildMonthlyTotals(transactions, months, '収入');
    const expenseTotals = buildMonthlyTotals(transactions, months, '支出');
    const balanceTotals = months.map((_, index) => incomeTotals[index] - expenseTotals[index]);
    const selectedTypes = getSelectedCategories(options.typeFilter);

    const categories = selectedTypes.flatMap((type) => {
        const categoryNames = type === '収入' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

        return categoryNames.map((category) => ({
            category,
            type,
            ...calculateRepresentativeStats(buildMonthlyTotals(transactions, months, type, category)),
        }));
    });

    return {
        months,
        income: calculateRepresentativeStats(incomeTotals),
        expense: calculateRepresentativeStats(expenseTotals),
        balance: calculateRepresentativeStats(balanceTotals),
        categories,
        expenseCategories: categories.filter((category) => category.type === '支出'),
    };
}
