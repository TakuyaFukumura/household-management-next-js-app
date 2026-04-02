/**
 * CSV読み込み・バリデーション共通ユーティリティ
 */

import {ExpenseCategory, EXPENSE_CATEGORIES, IncomeCategory, INCOME_CATEGORIES} from './constants';

export interface Transaction {
    date: string;
    category: IncomeCategory | ExpenseCategory;
    type: '収入' | '支出';
    amount: number;
    memo: string;
}

export interface ValidationError {
    row: number;
    message: string;
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

    const validCategories: readonly string[] = type === '収入' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!validCategories.includes(category)) {
        return {transaction: null, error: {row: rowIndex, message: `カテゴリが不正です: ${category}`}};
    }

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount <= 0) {
        return {transaction: null, error: {row: rowIndex, message: `金額が不正です: ${amountStr}`}};
    }

    return {
        transaction: {date, category: category as IncomeCategory | ExpenseCategory, type, amount, memo: memo ?? ''},
        error: null,
    };
}
