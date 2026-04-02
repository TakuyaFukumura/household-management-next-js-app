/**
 * CSV読み込み・バリデーション共通ユーティリティ
 */

import {ExpenseCategory, EXPENSE_CATEGORIES, IncomeCategory, INCOME_CATEGORIES} from './constants';

export type Transaction =
    | {date: string; category: IncomeCategory; type: '収入'; amount: number; memo: string}
    | {date: string; category: ExpenseCategory; type: '支出'; amount: number; memo: string};

export interface ValidationError {
    row: number;
    message: string;
}

function isIncomeCategory(category: string): category is IncomeCategory {
    return (INCOME_CATEGORIES as readonly string[]).includes(category);
}

function isExpenseCategory(category: string): category is ExpenseCategory {
    return (EXPENSE_CATEGORIES as readonly string[]).includes(category);
}

export function validateRow(row: string[], rowIndex: number): {transaction: Transaction | null; error: ValidationError | null} {
    const [date, category, type, amountStr, memo] = row;

    if (!date || !category || !type || !amountStr) {
        return {transaction: null, error: {row: rowIndex, message: '必須フィールドが不足しています'}};
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return {transaction: null, error: {row: rowIndex, message: `日付の形式が不正です: ${date}`}};
    }

    if (type !== '収入' && type !== '支出') {
        return {transaction: null, error: {row: rowIndex, message: `種別が不正です: ${type}`}};
    }

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount <= 0) {
        return {transaction: null, error: {row: rowIndex, message: `金額が不正です: ${amountStr}`}};
    }

    if (type === '収入') {
        if (!isIncomeCategory(category)) {
            return {
                transaction: null,
                error: {
                    row: rowIndex,
                    message: `収入カテゴリが不正です: ${category}。許可されているカテゴリ: ${INCOME_CATEGORIES.join(', ')}`,
                },
            };
        }
        return {transaction: {date, category, type, amount, memo: memo ?? ''}, error: null};
    } else {
        if (!isExpenseCategory(category)) {
            return {
                transaction: null,
                error: {
                    row: rowIndex,
                    message: `支出カテゴリが不正です: ${category}。許可されているカテゴリ: ${EXPENSE_CATEGORIES.join(', ')}`,
                },
            };
        }
        return {transaction: {date, category, type, amount, memo: memo ?? ''}, error: null};
    }
}
