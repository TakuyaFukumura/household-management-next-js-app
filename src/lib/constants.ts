/** 収入カテゴリの一覧 */
export const INCOME_CATEGORIES = ['給与', '副業'] as const;

/** 支出カテゴリの一覧 */
export const EXPENSE_CATEGORIES = [
    '食料費',
    '住宅費',
    '光熱費',
    '通信費',
    '交通費',
    '日用品',
    '医療費',
    '娯楽費',
    '投資額',
    '保険料',
    '特別費',
    '交際費',
    '美容費',
    '教養費',
    'その他',
] as const;

/** 収入カテゴリの型 */
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];

/** 支出カテゴリの型 */
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
