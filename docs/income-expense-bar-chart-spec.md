# 収支比較棒グラフ 仕様書

## 1. 概要

本ドキュメントは、家計簿アプリへの収支比較棒グラフ追加に関する仕様を定義します。  
現在のアプリは支出割合を円グラフで表示していますが、  
本機能により単月の収入と支出を**横棒グラフ**で比較できるようにします。

---

## 2. 要件

| No. | 要件 |
|-----|------|
| R-1 | 選択中の月の合計収入と合計支出を横棒グラフで表示すること |
| R-2 | 収入バーと支出バーは色で区別できること（収入: 緑系 `#22c55e`、支出: 赤系 `#ef4444`） |
| R-3 | 各バーにカーソルを当てるとツールチップで金額（円）が表示されること |
| R-4 | X 軸の単位は円（¥）とし、金額を読みやすい形式で表示すること |
| R-5 | データが存在しない場合は「データがありません」と表示すること |
| R-6 | ダークモードに対応すること。特に `dark:bg-gray-800` 上でも十分なコントラストを確保するため、Recharts の軸ラベル/目盛り/グリッド/ツールチップについてはダークモード時に明示的に色を指定すること（例: 軸目盛りは `tick={{ fill: '#E5E7EB' }}`、軸線・グリッド線は `stroke="#4B5563"`、ツールチップは `contentStyle={{ backgroundColor: '#1F2937', color: '#F9FAFB', border: '1px solid #4B5563' }}`） |

---

## 3. UI 仕様

### 3.1 全体レイアウト

メインページ（`page.tsx`）の既存グリッドに `IncomeExpenseBarChart` を追加します。

> **注意:** 下記「変更前」は現時点（`MonthNavigator` 未実装）の `page.tsx` の構成です。  
> 将来、月別フィルタ機能（`MonthNavigator`）が実装された場合は、`transactions` を `filteredTransactions` に置き換えてください。

**変更前（現状）:**

```
[ ヘッダー ]
[ SummaryCards ]
[ CategoryTable | ExpensePieChart ]
[ TransactionTable ]
```

**変更後:**

```
[ ヘッダー ]
[ SummaryCards ]
[ CategoryTable | ExpensePieChart ]
[ IncomeExpenseBarChart ]
[ TransactionTable ]
```

### 3.2 IncomeExpenseBarChart コンポーネント仕様

収支比較棒グラフはページ中段、`CategoryTable | ExpensePieChart` と `TransactionTable` の間に配置します。

```
┌──────────────────────────────────────────────┐
│ 収支比較                                        │
│                                                │
│ 収入 │■■■■■■■■■■■■■■■■■■■■ ¥350,000           │
│      │                                        │
│ 支出 │■■■■■■■■■■■■■■ ¥220,000                 │
│      │                                        │
│      ¥0    ¥100,000  ¥200,000  ¥300,000       │
│                                                │
│   ■ 収入  ■ 支出                               │
└──────────────────────────────────────────────┘
```

| 項目 | 仕様 |
|------|------|
| タイトル | 「収支比較」 |
| グラフ種別 | 横棒グラフ（`BarChart layout="vertical"`） |
| Y 軸 | カテゴリ軸。「収入」「支出」のラベルを表示 |
| X 軸 | 金額軸（円）。最大値に応じて自動スケール |
| 収入バーの色 | 緑（`#22c55e`） |
| 支出バーの色 | 赤（`#ef4444`） |
| ツールチップ | ホバー時に `¥{金額}` 形式で金額を表示 |
| 凡例 | グラフ下部に「収入」「支出」の2項目を表示（`Legend` の `payload` プロパティで明示指定） |
| 高さ | 200px |
| 幅 | 親要素に対して 100%（`ResponsiveContainer`） |

---

## 4. 技術仕様

### 4.1 技術スタック

- **フレームワーク**: Next.js（App Router）
- **スタイリング**: Tailwind CSS 4
- **グラフライブラリ**: Recharts（既存と同様）
- **状態管理**: Props 受け取りのみ（内部状態なし）

### 4.2 使用する Recharts コンポーネント

横棒グラフは `BarChart` に `layout="vertical"` を指定し、Y 軸をカテゴリ軸、X 軸を数値軸として使用します。  
各バーは1本の `Bar` コンポーネントに `Cell` を組み合わせて、収入・支出それぞれに個別の色を適用します。

| コンポーネント | 用途 |
|----------------|------|
| `ResponsiveContainer` | 親要素の幅に追従するコンテナ |
| `BarChart` | 棒グラフ本体（`layout="vertical"` で横棒グラフ化） |
| `Bar` | バー（単一。`Cell` と組み合わせて収入/支出を色分け） |
| `Cell` | バーごとの塗りつぶし色を指定（収入: `#22c55e`、支出: `#ef4444`） |
| `XAxis` | 数値軸（金額）。`type="number"` を指定 |
| `YAxis` | カテゴリ軸（「収入」「支出」）。`type="category"` かつ `dataKey="name"` を指定 |
| `CartesianGrid` | グリッド線 |
| `Tooltip` | ホバー時の金額ポップアップ |
| `Legend` | 凡例（`payload` プロパティで「収入」「支出」を明示指定） |

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

### 4.4 X 軸フォーマット（金額軸）

X 軸の目盛りラベルは `¥` を付けた数値で表示します。

```typescript
function formatXAxis(value: number): string {
  return `¥${value.toLocaleString()}`;
}
```

### 4.5 ツールチップフォーマット

```typescript
function formatTooltipValue(value: unknown): string {
  return typeof value === 'number' ? `¥${value.toLocaleString()}` : String(value ?? '');
}
```

### 4.6 凡例の指定方法

`Cell` による色分けでは `Legend` が自動的に「収入」「支出」の2項目を生成しないため、  
`Legend` の `payload` プロパティを使ってラベルと色を明示的に指定します。

```tsx
<Legend
  payload={[
    { value: '収入', type: 'square', color: '#22c55e' },
    { value: '支出', type: 'square', color: '#ef4444' },
  ]}
/>
```

### 4.7 ダークモード対応

`dark:bg-gray-800` の背景上でも視認性を確保するため、Recharts の各要素に色を明示指定します。

| 要素 | ライトモード | ダークモード |
|------|-------------|-------------|
| 軸目盛り文字色 | デフォルト（`#666`） | `#E5E7EB`（Tailwind `gray-200`） |
| 軸線・グリッド線色 | デフォルト | `#4B5563`（Tailwind `gray-600`） |
| ツールチップ背景色 | デフォルト（白） | `#1F2937`（Tailwind `gray-800`） |
| ツールチップ文字色 | デフォルト（黒） | `#F9FAFB`（Tailwind `gray-50`） |
| ツールチップ枠線色 | デフォルト | `#4B5563`（Tailwind `gray-600`） |

ダークモードの検出には、`document.documentElement.classList.contains('dark')` を使用するか、  
`useDarkMode` カスタムフックを導入して動的に色を切り替えます。  
または、ライト/ダーク両方に馴染む中間色（グレー系）を固定値として使用する方法もあります。

---

## 5. 実装対象ファイル

### 5.1 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/components/IncomeExpenseBarChart.tsx` | 収支比較横棒グラフコンポーネント |

### 5.2 変更ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/page.tsx` | `IncomeExpenseBarChart` コンポーネントのインポートと配置追加 |

---

## 6. コンポーネント設計

### 6.1 `IncomeExpenseBarChart.tsx`

収入と支出の合計を横棒グラフで比較表示するコンポーネントです。

```
Props
└─ transactions: Transaction[]  ← 表示対象の収支データ一覧

処理
├─ buildChartData(transactions) で収入・支出の合計を集計
└─ data が両方 0 の場合は「データがありません」を表示

レンダリング
└─ [ タイトル「収支比較」]
   [ BarChart layout="vertical" (収入バー: 緑 / 支出バー: 赤) ]
```

設計例:

```tsx
'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Transaction } from './CsvUploader';

interface Props {
  transactions: Transaction[];
}

interface ChartEntry {
  name: string;
  value: number;
}

const BAR_COLORS: Record<string, string> = {
  収入: '#22c55e',
  支出: '#ef4444',
};

const LEGEND_PAYLOAD = [
  { value: '収入', type: 'square' as const, color: '#22c55e' },
  { value: '支出', type: 'square' as const, color: '#ef4444' },
];

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

function formatXAxis(value: number): string {
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-center h-32">
        <p className="text-gray-400 dark:text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-gray-700 dark:text-gray-200 font-semibold text-base mb-4">収支比較</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#E5E7EB' }}
            axisLine={{ stroke: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
          />
          <XAxis
            type="number"
            tickFormatter={formatXAxis}
            tick={{ fill: '#E5E7EB' }}
            axisLine={{ stroke: '#4B5563' }}
            tickLine={{ stroke: '#4B5563' }}
          />
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: '#1F2937',
              color: '#F9FAFB',
              border: '1px solid #4B5563',
            }}
          />
          <Legend payload={LEGEND_PAYLOAD} />
          <Bar dataKey="value" name="金額">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={BAR_COLORS[entry.name] ?? '#8b5cf6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

> **`Transaction` 型のインポート元について:**  
> 既存コンポーネント（`SummaryCards.tsx`、`ExpensePieChart.tsx` 等）との一貫性を保つため、  
> `Transaction` 型は `@/lib/csv` ではなく `./CsvUploader` からインポートしてください。  
> `CsvUploader` は `@/lib/csv` の型を再エクスポートしています。

### 6.2 `page.tsx` の変更箇所

#### インポート追加

```typescript
import IncomeExpenseBarChart from './components/IncomeExpenseBarChart';
```

#### JSX への配置追加

`CategoryTable | ExpensePieChart` グリッドと `TransactionTable` の間に配置します。

```tsx
<SummaryCards transactions={transactions} />

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CategoryTable transactions={transactions} />
  <ExpensePieChart transactions={transactions} />
</div>

<IncomeExpenseBarChart transactions={transactions} />

<TransactionTable transactions={transactions} />
```

> **月別フィルタ機能（`MonthNavigator`）実装後の対応:**  
> 月別フィルタが実装された場合は、`transactions` を `filteredTransactions` に置き換えてください。

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
- `src/app/components/CsvUploader.tsx` - `Transaction` 型の再エクスポート元
- `src/lib/csv.ts` - `Transaction` 型定義
