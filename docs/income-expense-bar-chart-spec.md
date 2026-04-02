# 収支比較棒グラフ 仕様書

## 1. 概要

本ドキュメントは、家計簿アプリへの収支比較棒グラフ追加に関する仕様を定義します。  
現在のアプリは支出割合を円グラフで表示していますが、  
本機能により単月の収入と支出を棒グラフで並べて比較できるようにします。

---

## 2. 要件

| No. | 要件 |
|-----|------|
| R-1 | 選択中の月の合計収入と合計支出を棒グラフで横並びに表示すること |
| R-2 | 収入バーと支出バーは色で区別できること（収入: 緑系、支出: 赤系） |
| R-3 | 各バーにカーソルを当てるとツールチップで金額（円）が表示されること |
| R-4 | Y 軸の単位は円（¥）とし、金額を読みやすい形式で表示すること |
| R-5 | データが存在しない場合は「データがありません」と表示すること |
| R-6 | ダークモードに対応すること |

---

## 3. UI 仕様

### 3.1 全体レイアウト

メインページ（`page.tsx`）の既存グリッドに `IncomeExpenseBarChart` を追加します。

**変更前:**

```
[ ヘッダー ]
[ MonthNavigator ]
[ SummaryCards ]
[ CategoryTable | ExpensePieChart ]
[ TransactionTable ]
```

**変更後:**

```
[ ヘッダー ]
[ MonthNavigator ]
[ SummaryCards ]
[ CategoryTable | ExpensePieChart ]
[ IncomeExpenseBarChart ]
[ TransactionTable ]
```

### 3.2 IncomeExpenseBarChart コンポーネント仕様

収支比較棒グラフはページ中段、`SummaryCards` と `TransactionTable` の間に配置します。

```
┌─────────────────────────────────────────────┐
│ 収支比較                                      │
│                                               │
│  ¥400,000 ─                                  │
│  ¥300,000 ─   ┌───┐                          │
│  ¥200,000 ─   │   │  ┌───┐                  │
│  ¥100,000 ─   │   │  │   │                  │
│       ¥0 ─────┴───┴──┴───┴──────            │
│              収入    支出                      │
│        ■ 収入  ■ 支出                         │
└─────────────────────────────────────────────┘
```

| 項目 | 仕様 |
|------|------|
| タイトル | 「収支比較」 |
| グラフ種別 | 縦棒グラフ（`BarChart`） |
| X 軸 | 「収入」「支出」の2項目 |
| Y 軸 | 金額（円）。最大値に応じて自動スケール |
| 収入バーの色 | 緑（`#22c55e`） |
| 支出バーの色 | 赤（`#ef4444`） |
| ツールチップ | ホバー時に `¥{金額}` 形式で金額を表示 |
| 凡例 | グラフ下部に「収入」「支出」の凡例を表示 |
| 高さ | 300px |
| 幅 | 親要素に対して 100%（`ResponsiveContainer`） |

---

## 4. 技術仕様

### 4.1 技術スタック

- **フレームワーク**: Next.js（App Router）
- **スタイリング**: Tailwind CSS 4
- **グラフライブラリ**: Recharts（既存と同様）
- **状態管理**: Props 受け取りのみ（内部状態なし）

### 4.2 使用する Recharts コンポーネント

| コンポーネント | 用途 |
|----------------|------|
| `ResponsiveContainer` | 親要素の幅に追従するコンテナ |
| `BarChart` | 棒グラフ本体 |
| `Bar` | 収入バー・支出バーそれぞれに使用 |
| `XAxis` | X 軸（「収入」「支出」ラベル） |
| `YAxis` | Y 軸（金額） |
| `CartesianGrid` | グリッド線 |
| `Tooltip` | ホバー時の金額ポップアップ |
| `Legend` | 凡例 |

### 4.3 グラフデータ構造

`IncomeExpenseBarChart` 内部で `transactions` を集計し、以下の形式のデータを生成します。

```typescript
interface ChartEntry {
  name: string;   // "収入" または "支出"
  value: number;  // 合計金額（円）
}
```

集計ロジック:

```typescript
function buildChartData(transactions: Transaction[]): ChartEntry[] {
  const totalIncome = transactions
    .filter((t) => t.type === '収入')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === '支出')
    .reduce((sum, t) => sum + t.amount, 0);

  return [
    { name: '収入', value: totalIncome },
    { name: '支出', value: totalExpense },
  ];
}
```

### 4.4 Y 軸フォーマット

Y 軸の目盛りラベルは `¥` を付けた数値で表示します。

```typescript
function formatYAxis(value: number): string {
  return `¥${value.toLocaleString()}`;
}
```

### 4.5 ツールチップフォーマット

```typescript
function formatTooltipValue(value: unknown): string {
  return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}
```

---

## 5. 実装対象ファイル

### 5.1 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/components/IncomeExpenseBarChart.tsx` | 収支比較棒グラフコンポーネント |

### 5.2 変更ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/page.tsx` | `IncomeExpenseBarChart` コンポーネントのインポートと配置追加 |

---

## 6. コンポーネント設計

### 6.1 `IncomeExpenseBarChart.tsx`

収入と支出の合計を棒グラフで比較表示するコンポーネントです。

```
Props
└─ transactions: Transaction[]  ← 表示対象の収支データ一覧

処理
├─ buildChartData(transactions) で収入・支出の合計を集計
└─ data が両方 0 の場合は「データがありません」を表示

レンダリング
└─ [ タイトル「収支比較」]
   [ BarChart (収入バー: 緑 / 支出バー: 赤) ]
```

設計例:

```tsx
'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Transaction } from '@/lib/csv';

interface Props {
  transactions: Transaction[];
}

interface ChartEntry {
  name: string;
  value: number;
}

function buildChartData(transactions: Transaction[]): ChartEntry[] {
  const totalIncome = transactions
    .filter((t) => t.type === '収入')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === '支出')
    .reduce((sum, t) => sum + t.amount, 0);

  return [
    { name: '収入', value: totalIncome },
    { name: '支出', value: totalExpense },
  ];
}

function formatYAxis(value: number): string {
  return `¥${value.toLocaleString()}`;
}

function formatTooltipValue(value: unknown): string {
  return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}

export default function IncomeExpenseBarChart({ transactions }: Props) {
  const data = buildChartData(transactions);
  const isEmpty = data.every((d) => d.value === 0);

  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-64">
        <p className="text-gray-400 dark:text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">収支比較</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={formatTooltipValue} />
          <Legend />
          <Bar dataKey="value" name="金額" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

> **注意:** 上記の設計例では収入・支出を1つの `Bar` で表現していますが、  
> 収入と支出をそれぞれ独立した色で視覚的に区別するため、  
> 実装時は `Cell` を用いて各バーに個別の色（収入: `#22c55e`、支出: `#ef4444`）を適用することを推奨します。

### 6.2 `page.tsx` の変更箇所

#### インポート追加

```typescript
import IncomeExpenseBarChart from './components/IncomeExpenseBarChart';
```

#### JSX への配置追加

`SummaryCards` と `TransactionTable` の間に配置します。

```tsx
<SummaryCards transactions={filteredTransactions} />

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CategoryTable transactions={filteredTransactions} />
  <ExpensePieChart transactions={filteredTransactions} />
</div>

<IncomeExpenseBarChart transactions={filteredTransactions} />

<TransactionTable transactions={filteredTransactions} />
```

---

## 7. 表示仕様（金額フォーマット）

金額は `toLocaleString()` を使用して3桁区切りで表示します。

| 値 | 表示 |
|----|------|
| `350000` | `¥350,000` |
| `0` | `¥0` |
| `1234567` | `¥1,234,567` |

---

## 8. 関連ファイル

- `src/app/page.tsx` - メインページ（コンポーネント配置の変更対象）
- `src/app/components/ExpensePieChart.tsx` - 支出割合円グラフ（実装参考）
- `src/app/components/SummaryCards.tsx` - サマリーカード（収入・支出集計の参考）
- `src/lib/csv.ts` - `Transaction` 型定義
