# Changelog

このプロジェクトのすべての変更はこのファイルに記録されます。

フォーマットは [Keep a Changelog](https://keepachangelog.com/ja/1.0.0/) に基づいており、
このプロジェクトは [Semantic Versioning](https://semver.org/lang/ja/) に従っています。

## [Unreleased]

### 変更

- ここに書く

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
