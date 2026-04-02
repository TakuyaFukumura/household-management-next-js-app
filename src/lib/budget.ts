/**
 * 予算データの型定義・バリデーション関数
 */

import {EXPENSE_CATEGORIES, INCOME_CATEGORIES} from './constants';
import type {ExpenseCategory, IncomeCategory} from './constants';

export type BudgetEntry =
    | {category: IncomeCategory; type: '収入'; amount: number}
    | {category: ExpenseCategory; type: '支出'; amount: number};

export interface BudgetValidationError {
    row: number;
    message: string;
}

function isIncomeCategory(category: string): category is IncomeCategory {
    return (INCOME_CATEGORIES as readonly string[]).includes(category);
}

function isExpenseCategory(category: string): category is ExpenseCategory {
    return (EXPENSE_CATEGORIES as readonly string[]).includes(category);
}

export function validateBudgetRow(
    row: string[],
    rowIndex: number,
): {entry: BudgetEntry | null; error: BudgetValidationError | null} {
    if (row.length !== 3) {
        return {entry: null, error: {row: rowIndex, message: `カラム数が不正です: ${row.length}列（3列固定）`}};
    }

    const [category, type, amountStr] = row;

    if (!category || !type || !amountStr) {
        return {entry: null, error: {row: rowIndex, message: '必須フィールドが不足しています'}};
    }

    if (type !== '収入' && type !== '支出') {
        return {entry: null, error: {row: rowIndex, message: `種別が不正です: ${type}`}};
    }

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount < 1) {
        return {entry: null, error: {row: rowIndex, message: `予算金額が不正です: ${amountStr}`}};
    }

    if (type === '収入') {
        if (!isIncomeCategory(category)) {
            return {
                entry: null,
                error: {
                    row: rowIndex,
                    message: `収入カテゴリが不正です: ${category}（許可されているカテゴリ: ${INCOME_CATEGORIES.join(', ')}）`,
                },
            };
        }
        return {entry: {category, type, amount}, error: null};
    } else {
        if (!isExpenseCategory(category)) {
            return {
                entry: null,
                error: {
                    row: rowIndex,
                    message: `支出カテゴリが不正です: ${category}（許可されているカテゴリ: ${EXPENSE_CATEGORIES.join(', ')}）`,
                },
            };
        }
        return {entry: {category, type, amount}, error: null};
    }
}
