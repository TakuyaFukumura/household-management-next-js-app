# Changelog

このプロジェクトのすべての変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [Unreleased]

### 追加

- `src/lib/csv.ts`: `Transaction`・`ValidationError`インターフェースおよび`validateRow()`関数を共通ユーティリティとして切り出し
- `public/data/household.csv`: アプリ内デフォルトデータCSVファイル（自動読み込み用）
- `src/app/upload/page.tsx`: CSVアップロード専用ページ（`/upload`）

### 変更

- `src/app/page.tsx`: ページ表示時に`fetch`で`/data/household.csv`を自動読み込みするよう変更。CSVアップローダーUIを削除し、`/upload`ページへのナビゲーションリンクを追加
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
