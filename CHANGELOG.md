# Changelog

このプロジェクトのすべての変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [Unreleased]

## [0.11.0] - 2026-04-03

### 変更

- `src/app/components/Header.tsx`: 共通ヘッダーの改善
    - `'use client'` ディレクティブを追加し、`usePathname()` および `useState` フックを使用
    - ナビゲーションリンクをピル型（角丸）ボタン風スタイル（アイコン付き）に変更
    - `usePathname()` を使用して現在のページに対応するリンクをアクティブ状態として強調表示
    - 画面幅 `md`（768px）未満でハンバーガーメニューボタンを表示し、タップでドロワーが開閉するモバイル対応を追加
    - ハンバーガーボタンはヘッダー左端に配置
    - ドロワー内のリンクをクリックした際にドロワーを閉じる処理を追加
- `src/app/upload/page.tsx`: CSV アップロード画面のヘッダーを統一
    - ページ内の独自ヘッダー実装を削除し、共通の `Header` コンポーネントに置き換え
    - ページ本体（`<main>` 内）に画面タイトル（「CSVアップロード」）と説明文を追加
- `package.json`: バージョンを `0.10.0` から `0.11.0` に更新

### 削除

- `docs/header-improvement-spec.md`: 実装完了のため削除

### 変更

- `src/app/components/ExpensePieChart.tsx`: 支出割合グラフの改善
    - 凡例を `ResponsiveContainer` 外の独立した `<ul>` リストとして描画するよう変更し、カテゴリ数が多い場合のグラフ見切れを解消
    - グラフ本体の高さを `350px` から `260px` に調整
    - `aggregateSmallSlices` 関数の早期 return を排除し、すべての分岐で金額降順ソートを適用するようリファクタリング
    - 配色を彩度の高い原色系 8 色から落ち着いたトーンの 15 色パレット（Tableau カラーパレット準拠）へ変更
- `package.json`: バージョンを `0.9.0` から `0.10.0` に更新

### 削除

- `docs/expense-pie-chart-spec.md`: 実装完了のため削除

## [0.9.0] - 2026-04-02

### 追加

- `public/data/budget.csv`: 予算設定 CSV ファイルを新規作成（収入・支出カテゴリの月次予算金額を定義）
- `src/lib/budget.ts`: 予算データの型定義（`BudgetEntry`・`BudgetValidationError`）およびバリデーション関数（
  `validateBudgetRow`）を新規作成
- `src/app/budget/page.tsx`: 予算画面（`/budget`）を新規作成。予算 CSV・実績 CSV の読み込みと各コンポーネントへのデータ提供
- `src/app/components/BudgetSummaryCards.tsx`: 収入予算合計・支出予算合計のサマリーカードコンポーネントを新規作成
- `src/app/components/BudgetPieChart.tsx`: 支出カテゴリ別予算配分のドーナツ型円グラフコンポーネントを新規作成（3%
  未満スライスの「その他」集約・カスタム凡例付き）
- `src/app/components/BudgetBarChart.tsx`: 収入予算・収入実績・支出予算・支出実績を4行で比較する横棒グラフコンポーネントを新規作成
- `src/app/components/BudgetTable.tsx`: カテゴリ別に予算金額・実績金額・差額を一覧表示するテーブルコンポーネントを新規作成（差額の超過/達成を色で表示）

### 変更

- `src/app/components/Header.tsx`: 「ホーム」（`/`）および「予算」（`/budget`）へのナビゲーションリンクを追加
- `package.json`: バージョンを `0.8.0` から `0.9.0` に更新

### 削除

- `docs/budget-spec.md`: 実装完了のため削除

## [0.8.0] - 2026-04-02

### 変更

- `src/app/components/ExpensePieChart.tsx`: 支出割合円グラフの視認性改善
    - スライスを支出割合の降順にソートして表示
    - ドーナツグラフへ変更し、中央に合計金額を表示
    - カスタム凡例（カテゴリ名・金額・割合）を追加し、スライス上のラベルを廃止
    - 割合 3% 未満のカテゴリを「その他」に集約してラベル重なりを防止
    - ホバー時にスライスをハイライト表示
    - データ変化時のアニメーションを有効化
- `package.json`: バージョンを `0.7.0` から `0.8.0` に更新

### 削除

- `docs/expense-pie-chart-improvement-spec.md`: 実装完了のため削除

## [0.7.0] - 2026-04-02

### 追加

- `src/app/components/IncomeExpenseBarChart.tsx`: 収支比較横棒グラフコンポーネントを新規作成。選択中の月の合計収入と合計支出を横棒グラフで比較表示。ダークモード対応済み

### 変更

- `src/app/page.tsx`: `IncomeExpenseBarChart` コンポーネントのインポートと配置追加（`CategoryTable | ExpensePieChart` と
  `TransactionTable` の間）
- `package.json`: バージョンを `0.6.0` から `0.7.0` に更新

### 削除

- `docs/income-expense-bar-chart-spec.md`: 実装完了のため削除

## [0.6.0] - 2026-04-02

### 追加

- `src/app/components/MonthNavigator.tsx`: 月ナビゲーターコンポーネントを新規作成。前月・翌月ボタンによる月移動と「YYYY年MM月」形式の年月表示を提供

### 変更

- `src/app/page.tsx`: 月別表示機能を追加。選択月の状態管理（`selectedMonth`）、月フィルタリング処理、`MonthNavigator`
  コンポーネントの組み込み、データが存在しない月の「データがありません」表示

### 削除

- `docs/monthly-display-spec.md`: 実装完了のため削除

## [0.5.0] - 2026-04-02

### 追加

- `src/lib/constants.ts`: 収入・支出カテゴリ定数（`INCOME_CATEGORIES`、`EXPENSE_CATEGORIES`）および型（`IncomeCategory`、
  `ExpenseCategory`）を定義するファイルを新規作成

### 変更

- `src/lib/csv.ts`: `Transaction` の `category` フィールドの型を `string` から `IncomeCategory | ExpenseCategory` に変更
- `public/sample.csv`: 新規カテゴリ（住宅費・投資額・保険料・特別費・交際費・美容費・教養費・その他）を含むサンプルデータに更新。既存カテゴリの名称変更（食費→食料費、娯楽→娯楽費）を反映
- `public/data/household.csv`: 同上

### 削除

- `docs/category-spec.md`: 実装完了のため削除

## [0.4.0] - 2026-04-02

### 追加

- `src/app/components/DarkModeToggle.tsx`: ダークモード切替ボタンコンポーネントを新規作成。`localStorage`にテーマを保存し、
  `<html>` 要素への `dark` クラス付与を管理
- `src/app/components/Header.tsx`: ヘッダーコンポーネントを新規作成。アプリタイトル・CSVアップロードリンク・ダークモード切替ボタンを含む

### 変更

- `src/app/page.tsx`: インラインヘッダーを `Header` コンポーネントへ置き換え。ページ背景にダークモード対応カラー（
  `dark:bg-gray-950`）を追加

### 削除

- `docs/dark-mode-spec.md`: 実装完了のため削除

## [0.3.0] - 2026-04-02

### 追加

- `src/lib/csv.ts`: `Transaction`・`ValidationError`インターフェースおよび`validateRow()`関数を共通ユーティリティとして切り出し
- `public/data/household.csv`: アプリ内デフォルトデータCSVファイル（自動読み込み用）
- `src/app/upload/page.tsx`: CSVアップロード専用ページ（`/upload`）

### 変更

- `src/app/page.tsx`: ページ表示時に`fetch`で`/data/household.csv`を自動読み込みするよう変更。CSVアップローダーUIを削除し、
  `/upload`ページへのナビゲーションリンクを追加
- `src/app/components/CsvUploader.tsx`: `Transaction`・`ValidationError`・`validateRow`を`src/lib/csv.ts`から参照するよう変更

### 削除

- `docs/data-loading-method-change.md`: 実装完了のため削除

## [0.2.0] - 2025-01-01

### 追加

- 家計簿機能を実装
- `CsvUploader` コンポーネント: CSVファイルのドラッグ&ドロップまたはクリックでのアップロード、Papa Parseによる解析、バリデーション
- `SummaryCards` コンポーネント: 合計収入・合計支出・収支差額のサマリーカード表示
- `TransactionTable` コンポーネント: 収支一覧テーブル（日付降順ソート、アクセシビリティ対応）
- `CategoryTable` コンポーネント: カテゴリ別支出一覧テーブル（合計金額降順ソート、アクセシビリティ対応）
- `ExpensePieChart` コンポーネント: Rechartsを使った支出割合円グラフ
- 各コンポーネントのテストファイルを追加

### 削除

- `lib/database.ts`: SQLiteデータベース連携を削除
- `src/app/api/message/route.ts`: メッセージAPIルートを削除
- `src/app/components/DarkModeProvider.tsx`: ダークモードプロバイダーを削除
- `src/app/components/Header.tsx`: 旧ヘッダーコンポーネントを削除
- `__tests__/lib/database.test.ts`: データベーステストを削除
- `__tests__/src/app/components/DarkModeProvider.test.tsx`: ダークモードテストを削除
- `__tests__/src/app/components/Header.test.tsx`: ヘッダーテストを削除
- `docs/household-budget-spec.md`: 仕様書を削除
