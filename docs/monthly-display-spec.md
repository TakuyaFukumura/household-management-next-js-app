# 月別表示機能 仕様書

## 1. 概要

本ドキュメントは、家計簿アプリへの月別表示機能追加に関する仕様を定義します。  
現在のアプリはCSVに含まれる全期間のデータを一括表示していますが、  
本機能により特定の月を選択して収支データを月単位で確認できるようにします。

---

## 2. 要件

| No. | 要件 |
|-----|------|
| R-1 | 表示する月を選択できること |
| R-2 | 選択した月のデータのみが各コンポーネント（サマリー・テーブル・グラフ）に反映されること |
| R-3 | 月の移動は「前月」「翌月」ボタンで行えること |
| R-4 | 現在選択中の年月が画面上に「YYYY年MM月」形式で表示されること |
| R-5 | データが存在しない月を選択した場合は「データがありません」と表示すること |
| R-6 | 初期表示時は読み込んだデータの中で最も新しい月を選択状態にすること |

---

## 3. UI 仕様

### 3.1 全体レイアウト

メインページ（`page.tsx`）に月ナビゲーターを追加します。

**変更前:**

```
[ ヘッダー ]
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
[ TransactionTable ]
```

### 3.2 MonthNavigator コンポーネント仕様

月ナビゲーターはページ上部（ヘッダーの直下）に配置します。

```
| ◀ 前月 |  2025年04月  | 翌月 ▶ |
```

| 項目 | 仕様 |
|------|------|
| 配置 | SummaryCards の直上、ページ中央寄せ |
| 前月ボタン | `◀` アイコン付きテキスト、クリックで1か月前に移動 |
| 翌月ボタン | `▶` アイコン付きテキスト、クリックで1か月後に移動 |
| 年月表示 | 現在選択中の年月を「YYYY年MM月」形式で表示 |
| ボタン形状 | 角丸ボタン（`rounded`） |
| ホバー時 | 背景色を変化させてインタラクティブ感を演出 |

---

## 4. 技術仕様

### 4.1 技術スタック

- **フレームワーク**: Next.js（App Router）
- **スタイリング**: Tailwind CSS 4
- **状態管理**: React `useState`
- **日付処理**: JavaScriptの標準 `Date` オブジェクトおよび文字列操作

### 4.2 月フィルタリングロジック

`Transaction` の `date` フィールドは `YYYY-MM-DD` 形式の文字列です。  
選択中の年月（例: `"2025-04"`）と `date` の先頭7文字を比較してフィルタリングします。

```
filteredTransactions = transactions.filter(
  (t) => t.date.startsWith(selectedMonth)
)
```

`selectedMonth` の形式: `"YYYY-MM"`（例: `"2025-04"`）

### 4.3 初期月の決定ロジック

```
CSVデータ読み込み完了
  └─ transactions が空か？
       ├─ Yes → 現在の年月（今月）を初期値とする
       └─ No  → transactions の date を降順ソートし、最も新しい月（先頭7文字）を初期値とする
```

### 4.4 月移動ロジック

`selectedMonth`（`"YYYY-MM"` 形式）に対して、JavaScriptの `Date` オブジェクトを利用して月を加減算します。

```
前月移動:
  selectedMonth = "YYYY-MM"
  → new Date(YYYY, MM - 1 - 1) → "YYYY-MM" に変換

翌月移動:
  selectedMonth = "YYYY-MM"
  → new Date(YYYY, MM - 1 + 1) → "YYYY-MM" に変換
```

年跨ぎ（例: 2025-01 → 2024-12、2025-12 → 2026-01）は `Date` オブジェクトが自動的に処理します。

---

## 5. 実装対象ファイル

### 5.1 新規作成ファイル

| ファイルパス | 説明 |
|-------------|------|
| `src/app/components/MonthNavigator.tsx` | 月ナビゲーターコンポーネント |

### 5.2 変更ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/page.tsx` | 選択月の状態管理追加、月フィルタリング処理追加、`MonthNavigator` コンポーネントの組み込み |

---

## 6. コンポーネント設計

### 6.1 `MonthNavigator.tsx`

月の表示と前月・翌月への移動ボタンを提供するコンポーネントです。

```
Props
├─ selectedMonth: string   ← 現在選択中の月（"YYYY-MM" 形式）
├─ onPrevMonth: () => void ← 前月ボタンクリック時のコールバック
└─ onNextMonth: () => void ← 翌月ボタンクリック時のコールバック

レンダリング
└─ [ ◀ 前月 ] [ YYYY年MM月 ] [ 翌月 ▶ ]
```

### 6.2 `page.tsx` の変更箇所

#### 追加する State

`selectedMonth` の初期値は現在の年月（今月）とします。  
これにより、CSVデータ読み込み完了前でも `startsWith(selectedMonth)` が意図しない全件マッチを起こさず、  
かつ `MonthNavigator` が即座に有効な年月を表示できます。

```typescript
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
```

#### 初期月の設定

`transactions` が確定した（`hasLoaded` が `true` になった）タイミングで `selectedMonth` を設定します。  
`transactions` が空の場合は今月のまま維持します。

```typescript
useEffect(() => {
  if (!hasLoaded) return;
  if (transactions.length === 0) {
    setSelectedMonth(getCurrentMonth());
    return;
  }
  const latest = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))[0].date
    .slice(0, 7);
  setSelectedMonth(latest);
}, [hasLoaded, transactions]);
```

#### 月フィルタリング

```typescript
const filteredTransactions = transactions.filter(
  (t) => t.date.startsWith(selectedMonth)
);
```

#### 月移動ハンドラー

`selectedMonth` が有効な `"YYYY-MM"` 形式でない場合（初期化前など）はフォールバックとして今月を設定します。  
また、`MonthNavigator` 側でも `selectedMonth` が空文字のときはボタンを `disabled` にするか、  
`page.tsx` の初期値を今月にすることで未設定状態をなくす方針とします（後者を推奨）。

```typescript
function handlePrevMonth() {
  if (!selectedMonth) {
    setSelectedMonth(getCurrentMonth());
    return;
  }
  const [year, month] = selectedMonth.split('-').map(Number);
  const d = new Date(year, month - 2);
  setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
}

function handleNextMonth() {
  if (!selectedMonth) {
    setSelectedMonth(getCurrentMonth());
    return;
  }
  const [year, month] = selectedMonth.split('-').map(Number);
  const d = new Date(year, month);
  setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
}
```

#### 既存コンポーネントへの適用

`transactions` の代わりに `filteredTransactions` を既存の各コンポーネントに渡します。

```tsx
<MonthNavigator
  selectedMonth={selectedMonth}
  onPrevMonth={handlePrevMonth}
  onNextMonth={handleNextMonth}
/>
<SummaryCards transactions={filteredTransactions} />
<CategoryTable transactions={filteredTransactions} />
<ExpensePieChart transactions={filteredTransactions} />
<TransactionTable transactions={filteredTransactions} />
```

---

## 7. 表示仕様（年月フォーマット）

`selectedMonth`（`"YYYY-MM"` 形式）を画面表示用の「YYYY年MM月」形式へ変換します。

```typescript
function formatMonth(ym: string): string {
  const [year, month] = ym.split('-');
  return `${year}年${month}月`;
}
```

例:
- `"2025-04"` → `"2025年04月"`
- `"2024-12"` → `"2024年12月"`

---

## 8. 関連ファイル

- `src/app/page.tsx` - メインページ（月フィルタリング・状態管理の変更対象）
- `src/app/components/SummaryCards.tsx` - サマリーカード（変更なし、受け取る `transactions` が変わる）
- `src/app/components/TransactionTable.tsx` - 収支一覧テーブル（変更なし、受け取る `transactions` が変わる）
- `src/app/components/CategoryTable.tsx` - カテゴリ別支出テーブル（変更なし、受け取る `transactions` が変わる）
- `src/app/components/ExpensePieChart.tsx` - 支出割合グラフ（変更なし、受け取る `transactions` が変わる）
