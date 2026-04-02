/**
 * CSV読み込み・バリデーション共通ユーティリティ
 */

export interface Transaction {
    date: string;
    category: string;
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

    const amount = Number(amountStr);
    if (!Number.isInteger(amount) || amount <= 0) {
        return {transaction: null, error: {row: rowIndex, message: `金額が不正です: ${amountStr}`}};
    }

    return {
        transaction: {date, category, type, amount, memo: memo ?? ''},
        error: null,
    };
}
