# 収支予算欄における差額表示の仕様

## 概要

収支予算欄（`BudgetBarChart` コンポーネント）に、収入予算と支出予算の差額を数値として表示する機能を追加する。

---

## 現状

### 対象コンポーネント

- **ファイル:** `src/app/components/BudgetBarChart.tsx`
- **表示場所:** 収支予算ページ（`/budget`）の右カラム

### 現在の表示内容

収入と支出をそれぞれ横棒グラフで視覚的に比較できるが、差額の数値は表示されていない。

```
┌──────────────────────────────────────┐
│ 収支予算                              │
│                                      │
│  収入 ████████████████████████       │
│  支出 ████████████████               │
│       ¥0   ¥60,000 ¥120,000 ...     │
└──────────────────────────────────────┘
```

---

## 課題

- 棒グラフを目視で比較することはできるが、収入と支出の差額が数値として把握しづらい。
- 差額がプラス（黒字）かマイナス（赤字）かを直感的に判断するには、グラフの読み取りが必要で利便性が低い。

---

## 改善内容

収支予算欄のグラフの下部に、収入予算と支出予算の差額（収入 − 支出）を数値として表示する。

### 表示仕様

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| 表示ラベル | 「差額」                                                |
| 計算式     | `差額 = 収入予算合計 − 支出予算合計`                   |
| 数値フォーマット | 既存グラフと同じく半角の円記号付き（例: `¥50,000`、`-¥10,000`）。`value < 0 ? \`-¥\${Math.abs(value).toLocaleString('ja-JP')}\` : \`¥\${value.toLocaleString('ja-JP')}\`` のように、`toLocaleString('ja-JP')` に円記号を明示的に付与する |
| 黒字時の色 | 緑系（例: `text-green-600 dark:text-green-400`）        |
| 赤字時の色 | 赤系（例: `text-red-600 dark:text-red-400`）            |
| ゼロ時の色 | グレー系（例: `text-gray-600 dark:text-gray-400`）      |
| 表示位置   | 棒グラフの下部（グラフエリアの外側）                    |

### イメージ

```
┌──────────────────────────────────────┐
│ 収支予算                              │
│                                      │
│  収入 ████████████████████████       │
│  支出 ████████████████               │
│       ¥0   ¥60,000 ¥120,000 ...     │
│                                      │
│  差額: ¥50,000                       │  ← 追加
└──────────────────────────────────────┘
```

---

## 実装方針

### 変更対象ファイル

| ファイル                                          | 変更種別 | 内容                                     |
| ------------------------------------------------- | -------- | ---------------------------------------- |
| `src/app/components/BudgetBarChart.tsx`           | 修正     | 差額の計算と表示ロジックを追加           |

### 実装詳細

#### 1. 差額の計算

`budgetIncome` / `budgetExpense` は `buildChartData` 関数内のローカル変数のため、コンポーネント側から直接参照するのではなく、`buildChartData` の戻り値に収入合計・支出合計・差額を含めて利用する。

```typescript
function buildChartData(budgetEntries: BudgetEntry[]) {
    const budgetIncome = budgetEntries
        .filter((e) => e.type === '収入')
        .reduce((sum, e) => sum + e.amount, 0);

    const budgetExpense = budgetEntries
        .filter((e) => e.type === '支出')
        .reduce((sum, e) => sum + e.amount, 0);

    const difference = budgetIncome - budgetExpense;

    return {
        chartData: [
            {name: '収入', value: budgetIncome, color: INCOME_COLOR},
            {name: '支出', value: budgetExpense, color: EXPENSE_COLOR},
        ],
        difference,
    };
}

const {chartData, difference} = buildChartData(budgetEntries);
```

#### 2. 差額の色付け

差額の正負に応じてテキストカラーを動的に変更する。

```typescript
function getDifferenceColor(difference: number): string {
    if (difference > 0) return 'text-green-600 dark:text-green-400';
    if (difference < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
}
```

#### 3. 差額の表示

グラフコンポーネントの `ResponsiveContainer` の下に差額表示エリアを追加する。

既存グラフと表記を合わせ、`toLocaleString('ja-JP')` に半角の円記号を明示的に付与する（例: 黒字 `¥50,000`、赤字 `-¥10,000`）。

```tsx
<div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
    差額:
    <span className={`ml-2 font-bold ${getDifferenceColor(difference)}`}>
        {difference < 0
            ? `-¥${Math.abs(difference).toLocaleString('ja-JP')}`
            : `¥${difference.toLocaleString('ja-JP')}`}
    </span>
</div>
```

### 変更スコープ

- `BudgetBarChart.tsx` のみを修正すれば対応可能。
- `BudgetSummaryCards.tsx` や `BudgetTable.tsx` への変更は不要。
- データ取得ロジック（`src/lib/budget.ts`）への変更は不要。

---

## 注意事項

- 差額表示は収支予算欄（`/budget` ページ）のみが対象であり、ホームページ（`/`）の `IncomeExpenseBarChart` は変更しない。
- 既存のグラフ表示・ツールチップ・軸のフォーマットには影響を与えないようにする。
- データが空（`isEmpty === true`）の場合は差額表示も行わない（既存の空状態UIをそのまま維持する）。

---

## 関連ファイル

| ファイル                                          | 役割                                         |
| ------------------------------------------------- | -------------------------------------------- |
| `src/app/components/BudgetBarChart.tsx`           | 収支予算棒グラフ（改修対象）                 |
| `src/app/components/BudgetSummaryCards.tsx`       | 収入予算・支出予算のサマリーカード           |
| `src/app/budget/page.tsx`                         | 収支予算ページ                               |
| `src/lib/budget.ts`                               | `BudgetEntry` 型定義・バリデーションロジック |
| `public/data/budget.csv`                          | 予算データ（CSVファイル）                    |
