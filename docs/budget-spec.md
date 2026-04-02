# 予算画面 仕様書

## 1. 概要

本ドキュメントは、家計簿アプリへの予算画面追加に関する仕様を定義します。  
現在のアプリは実績データの確認のみに対応していますが、本機能により理想の家計簿（予算）を設定し、  
実績との比較を視覚的に確認できるようにします。

予算データは内部の CSV ファイル（`public/data/budget.csv`）で管理し、  
割合円グラフおよび収支横棒グラフを使って予算の配分・達成状況を可視化します。  
予算画面への導線は共通ヘッダーに追加します。

---

## 2. 要件

| No. | 要件 |
|-----|------|
| R-1 | 収入の予算金額を設定・表示できること |
| R-2 | 支出カテゴリごとに予算金額を設定・表示できること |
| R-3 | 予算設定値は `public/data/budget.csv` で管理すること |
| R-4 | 支出カテゴリ別の予算配分を割合円グラフで表示すること |
| R-5 | 収入・支出の予算合計と実績合計を収支横棒グラフで比較表示すること |
| R-6 | 予算画面への導線を共通ヘッダーに設けること |
| R-7 | ダークモードに対応すること |
| R-8 | データが存在しない場合は「データがありません」と表示すること |

---

## 3. 予算 CSV ファイル仕様

### 3.1 ファイルパス

```
public/data/budget.csv
```

### 3.2 フォーマット

ヘッダー行と各カテゴリの予算金額をカンマ区切りで記載します。

```
カテゴリ,種別,予算金額
給与,収入,350000
副業,収入,50000
食料費,支出,50000
住宅費,支出,80000
光熱費,支出,10000
通信費,支出,6000
交通費,支出,8000
日用品,支出,10000
医療費,支出,5000
娯楽費,支出,10000
投資額,支出,30000
保険料,支出,15000
特別費,支出,10000
交際費,支出,8000
美容費,支出,5000
教養費,支出,5000
その他,支出,3000
```

### 3.3 カラム定義

| カラム名 | 型 | 説明 |
|----------|----|------|
| カテゴリ | string | `src/lib/constants.ts` の `INCOME_CATEGORIES` または `EXPENSE_CATEGORIES` に定義されたカテゴリ名 |
| 種別 | string | `収入` または `支出` の固定値 |
| 予算金額 | number | 月あたりの予算金額（円）。正の整数 |

### 3.4 バリデーション規則

- ヘッダー行を除く各行はカラム数が正確に 3 であること（過不足はエラー）
- `カテゴリ` は `INCOME_CATEGORIES` または `EXPENSE_CATEGORIES` のいずれかに含まれること
- `種別` は `収入` または `支出` であること
- `予算金額` は正の整数であること

---

## 4. UI 仕様

### 4.1 全体レイアウト

予算画面は `/budget` という独立したページとして実装します。

```
[ ヘッダー（共通・予算へのリンクあり）]
[ 予算サマリーカード（収入予算合計・支出予算合計） ]
[ 支出予算割合円グラフ | 収支比較横棒グラフ（予算 vs 実績） ]
[ 予算設定テーブル ]
```

### 4.2 ヘッダーへの導線追加

共通ヘッダー（`Header.tsx`）に予算画面へのナビゲーションリンクを追加します。  
既存の「CSV をアップロード」リンクと同じスタイルで追加します。

**変更前:**

```
家計簿アプリ              [ CSVをアップロード ] [ 🌙 ]
```

**変更後:**

```
家計簿アプリ    [ ホーム ] [ 予算 ] [ CSVをアップロード ] [ 🌙 ]
```

| 項目 | 仕様 |
|------|------|
| リンクテキスト | 「予算」 |
| リンク先 | `/budget` |
| スタイル | `text-sm text-blue-500 dark:text-blue-300 hover:underline`（既存リンクと統一） |

### 4.3 予算サマリーカード

予算画面上部に収入予算合計と支出予算合計を数値で表示します。

```
┌──────────────────────┐  ┌──────────────────────┐
│ 収入予算              │  │ 支出予算              │
│ ¥400,000             │  │ ¥255,000             │
└──────────────────────┘  └──────────────────────┘
```

| 項目 | 仕様 |
|------|------|
| 収入予算カード | 収入カテゴリの予算金額合計を緑色で表示 |
| 支出予算カード | 支出カテゴリの予算金額合計を赤色で表示 |
| 金額フォーマット | `¥{金額.toLocaleString()}` 形式（3桁区切り） |

### 4.4 支出予算割合円グラフ

支出カテゴリごとの予算金額配分をドーナツ型の割合円グラフで表示します。

```
┌──────────────────────────────────────────────┐
│ 支出予算の割合                                 │
│                                               │
│          ██████                               │
│        ██      ██    ■ 住宅費：¥80,000（31.4%）│
│       █ 合計    █    ■ 食料費：¥50,000（19.6%）│
│       █¥255,000 █    ■ 投資額：¥30,000（11.8%）│
│        ██      ██    ■ 保険料：¥15,000（5.9%） │
│          ██████      ■ その他 ...              │
│                                               │
└──────────────────────────────────────────────┘
```

| 項目 | 仕様 |
|------|------|
| グラフ種別 | ドーナツ型円グラフ（`innerRadius` 指定） |
| 中央ラベル | 支出予算合計金額（`¥{合計金額}` 形式） |
| スライス順序 | 予算金額の降順 |
| 凡例 | カテゴリ名・金額・割合をカスタム凡例で表示 |
| 小スライス集約 | 割合 3% 未満のカテゴリは「その他」に集約 |

### 4.5 収支比較横棒グラフ（予算 vs 実績）

収入・支出それぞれについて、予算金額と実績金額を横棒グラフで並べて比較表示します。

```
┌──────────────────────────────────────────────┐
│ 収支比較（予算 vs 実績）                        │
│                                               │
│ 収入予算 │■■■■■■■■■■■■■■■■■■■■ ¥400,000      │
│ 収入実績 │■■■■■■■■■■■■■■■■■■■ ¥380,000       │
│          │                                   │
│ 支出予算 │■■■■■■■■■■■■■■■■ ¥255,000          │
│ 支出実績 │■■■■■■■■■■■■■■■■■■ ¥290,000        │
│          │                                   │
│         ¥0   ¥100,000  ¥200,000  ¥400,000    │
│                                               │
│  ■ 予算  ■ 実績                               │
└──────────────────────────────────────────────┘
```

| 項目 | 仕様 |
|------|------|
| グラフ種別 | 横棒グラフ（`BarChart layout="vertical"`） |
| Y 軸 | 「収入予算」「収入実績」「支出予算」「支出実績」の4行 |
| X 軸 | 金額軸（円）。最大値に応じて自動スケール |
| 予算バーの色 | 青（`#3b82f6`） |
| 実績バーの色（収入） | 緑（`#22c55e`） |
| 実績バーの色（支出） | 赤（`#ef4444`） |
| ツールチップ | ホバー時に `¥{金額}` 形式で金額を表示 |
| 凡例 | グラフ下部に「予算」「実績」の2項目を表示 |

### 4.6 予算設定テーブル

全カテゴリの予算金額・実績金額・差額を一覧表示します。

```
┌────────────┬────────┬───────────┬───────────┬───────────┐
│ カテゴリ   │ 種別   │ 予算金額  │ 実績金額  │ 差額      │
├────────────┼────────┼───────────┼───────────┼───────────┤
│ 給与       │ 収入   │ ¥350,000  │ ¥350,000  │ ¥0        │
│ 副業       │ 収入   │ ¥50,000   │ ¥30,000   │ -¥20,000  │
│ 食料費     │ 支出   │ ¥50,000   │ ¥55,000   │ +¥5,000   │
│ 住宅費     │ 支出   │ ¥80,000   │ ¥80,000   │ ¥0        │
│ …          │ …      │ …         │ …         │ …         │
└────────────┴────────┴───────────┴───────────┴───────────┘
```

| 項目 | 仕様 |
|------|------|
| 差額の色 | 収入: 実績 < 予算なら赤、収入 >= 予算なら緑。支出: 実績 > 予算なら赤、実績 <= 予算なら緑 |
| 金額フォーマット | `¥{金額.toLocaleString()}` 形式（3桁区切り） |
| 行の並び順 | 収入カテゴリを先に表示し、続いて支出カテゴリを表示 |

---

## 5. 技術仕様

### 5.1 技術スタック

- **フレームワーク**: Next.js（App Router）
- **スタイリング**: Tailwind CSS 4
- **グラフライブラリ**: Recharts（既存と同様）
- **データ取得**: `fetch('/data/budget.csv')` + PapaParse（既存と同様）

### 5.2 予算データの型定義

```typescript
// src/lib/budget.ts（新規作成）

import type {ExpenseCategory, IncomeCategory} from './constants';

export type BudgetEntry =
    | {category: IncomeCategory;  type: '収入'; amount: number}
    | {category: ExpenseCategory; type: '支出'; amount: number};

export interface BudgetValidationError {
    row: number;
    message: string;
}
```

### 5.3 予算 CSV パース・バリデーションロジック

```typescript
// src/lib/budget.ts（続き）

import {EXPENSE_CATEGORIES, INCOME_CATEGORIES} from './constants';

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
    // 正の整数のみ許可（0 および負の値は不正とする）
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
```

### 5.4 使用する Recharts コンポーネント

#### 支出予算割合円グラフ

| コンポーネント | 用途 |
|----------------|------|
| `ResponsiveContainer` | 親要素の幅に追従するコンテナ |
| `PieChart` | 円グラフ本体 |
| `Pie` | 各スライス（`innerRadius` 指定でドーナツ型） |
| `Cell` | スライスごとの塗りつぶし色 |
| `Tooltip` | ホバー時の金額ポップアップ |
| `Legend` | カスタム凡例（金額・割合付き） |
| `Label` | 中央に合計金額を表示 |

#### 収支比較横棒グラフ

| コンポーネント | 用途 |
|----------------|------|
| `ResponsiveContainer` | 親要素の幅に追従するコンテナ |
| `BarChart` | 棒グラフ本体（`layout="vertical"` で横棒グラフ化） |
| `Bar` | バー（予算・実績それぞれ1本） |
| `Cell` | バーごとの塗りつぶし色 |
| `XAxis` | 数値軸（金額）。`type="number"` を指定 |
| `YAxis` | カテゴリ軸。`type="category"` かつ `dataKey="name"` を指定 |
| `CartesianGrid` | グリッド線 |
| `Tooltip` | ホバー時の金額ポップアップ |
| `Legend` | 凡例（`payload` プロパティで明示指定） |

### 5.5 グラフデータ構造

#### 割合円グラフ用

```typescript
interface PieChartEntry {
    name: string;   // 支出カテゴリ名
    value: number;  // 予算金額（円）
    percentage: number; // 全支出予算合計に対する割合（%）
}
```

#### 収支比較横棒グラフ用

```typescript
interface BarChartEntry {
    name: string;   // "収入予算" | "収入実績" | "支出予算" | "支出実績"
    value: number;  // 金額（円）
}
```

### 5.6 ダークモード対応

既存の `IncomeExpenseBarChart` と同様に、Recharts の各要素に色を明示指定します。

| 要素 | ライトモード | ダークモード |
|------|-------------|-------------|
| 軸目盛り文字色 | デフォルト（`#666`） | `#E5E7EB`（Tailwind `gray-200`） |
| 軸線・グリッド線色 | デフォルト | `#4B5563`（Tailwind `gray-600`） |
| ツールチップ背景色 | デフォルト（白） | `#1F2937`（Tailwind `gray-800`） |
| ツールチップ文字色 | デフォルト（黒） | `#F9FAFB`（Tailwind `gray-50`） |
| ツールチップ枠線色 | デフォルト | `#4B5563`（Tailwind `gray-600`） |

---

## 6. 実装対象ファイル

### 6.1 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `public/data/budget.csv` | 予算設定 CSV ファイル |
| `src/lib/budget.ts` | 予算データの型定義・バリデーション関数 |
| `src/app/budget/page.tsx` | 予算画面のメインページ |
| `src/app/components/BudgetSummaryCards.tsx` | 収入・支出の予算合計サマリーカード |
| `src/app/components/BudgetPieChart.tsx` | 支出予算割合円グラフ |
| `src/app/components/BudgetBarChart.tsx` | 収支比較横棒グラフ（予算 vs 実績） |
| `src/app/components/BudgetTable.tsx` | 予算設定テーブル（カテゴリ別予算・実績・差額） |

### 6.2 変更ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/components/Header.tsx` | 「予算」ページへのナビゲーションリンク追加 |

---

## 7. コンポーネント設計

### 7.1 `src/lib/budget.ts`

予算データの型定義、CSV バリデーション、集計ユーティリティ関数を提供するモジュールです。

```
エクスポート
├─ BudgetEntry 型（収入/支出の予算エントリ）
├─ BudgetValidationError 型
└─ validateBudgetRow(row, rowIndex) 関数
```

### 7.2 `src/app/budget/page.tsx`

予算画面全体を管理するメインページコンポーネントです。

```
処理
├─ useEffect: fetch('/data/budget.csv') で予算 CSV を読み込み
├─ useEffect: fetch('/data/household.csv') で実績 CSV を読み込み（既存の page.tsx と同様）
└─ 読み込んだデータを各子コンポーネントに渡す

レンダリング
└─ [ Header ]
   [ BudgetSummaryCards（budgetEntries） ]
   [ BudgetPieChart（budgetEntries） | BudgetBarChart（budgetEntries, transactions） ]
   [ BudgetTable（budgetEntries, transactions） ]
```

### 7.3 `BudgetSummaryCards.tsx`

```
Props
└─ budgetEntries: BudgetEntry[]

処理
└─ 収入カテゴリの予算合計・支出カテゴリの予算合計を算出

レンダリング
└─ [ 収入予算カード ] [ 支出予算カード ]
```

### 7.4 `BudgetPieChart.tsx`

```
Props
└─ budgetEntries: BudgetEntry[]

処理
├─ 支出カテゴリのエントリのみ抽出
├─ 全支出予算合計に対する各カテゴリの割合を算出
├─ 予算金額の降順にソート
└─ 割合 3% 未満のカテゴリを「その他」に集約

レンダリング
└─ [ タイトル「支出予算の割合」]
   [ PieChart（ドーナツ型・中央に合計金額表示） ]
   [ カスタム凡例（カテゴリ名・金額・割合） ]
```

### 7.5 `BudgetBarChart.tsx`

```
Props
├─ budgetEntries: BudgetEntry[]
└─ transactions: Transaction[]

処理
├─ 収入・支出それぞれの予算合計を算出
└─ 収入・支出それぞれの実績合計を算出（transactions から集計）

レンダリング
└─ [ タイトル「収支比較（予算 vs 実績）」]
   [ BarChart layout="vertical"（予算: 青 / 収入実績: 緑 / 支出実績: 赤） ]
```

### 7.6 `BudgetTable.tsx`

```
Props
├─ budgetEntries: BudgetEntry[]
└─ transactions: Transaction[]

処理
├─ 各カテゴリの実績金額を transactions から集計
└─ 差額（予算 - 実績）を算出

レンダリング
└─ [ テーブル（カテゴリ・種別・予算金額・実績金額・差額） ]
   ※ 差額の文字色は超過(赤)/達成(緑)で切り替え
```

### 7.7 `Header.tsx` の変更箇所

#### 変更前

```tsx
<div className="flex items-center gap-2">
    <Link href="/upload" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
        CSVをアップロード
    </Link>
    <DarkModeToggle/>
</div>
```

#### 変更後

```tsx
<div className="flex items-center gap-2">
    <Link href="/" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
        ホーム
    </Link>
    <Link href="/budget" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
        予算
    </Link>
    <Link href="/upload" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
        CSVをアップロード
    </Link>
    <DarkModeToggle/>
</div>
```

---

## 8. 優先度と実装順序

| 優先度 | 実装項目 | 理由 |
|--------|----------|------|
| 高 | `public/data/budget.csv` の作成 | すべての機能の基盤となるデータファイル |
| 高 | `src/lib/budget.ts` の作成 | 型定義とバリデーションロジック。ページ実装の前提 |
| 高 | `src/app/budget/page.tsx` の作成 | 予算画面の骨格。データ取得ロジックを実装 |
| 高 | `Header.tsx` への「予算」リンク追加 | ユーザーが予算画面に到達するための導線 |
| 中 | `BudgetSummaryCards.tsx` の作成 | 全体感を示す数値サマリー |
| 中 | `BudgetPieChart.tsx` の作成 | 支出予算の配分を視覚化 |
| 中 | `BudgetBarChart.tsx` の作成 | 予算と実績の比較を視覚化 |
| 低 | `BudgetTable.tsx` の作成 | 詳細データの確認用テーブル |

---

## 9. 関連ファイル

- `src/app/components/Header.tsx` - 共通ヘッダー（変更対象：予算リンク追加）
- `src/app/page.tsx` - ホーム画面（実績データ取得ロジックの参考）
- `src/app/components/ExpensePieChart.tsx` - 支出割合円グラフ（実装参考）
- `src/app/components/CategoryTable.tsx` - カテゴリ別支出テーブル（実装参考）
- `src/lib/csv.ts` - 実績データの型定義・バリデーション（`budget.ts` 実装の参考）
- `src/lib/constants.ts` - カテゴリ定数定義（予算バリデーションで使用）
- `public/data/household.csv` - 実績データ CSV（予算画面でも参照）
