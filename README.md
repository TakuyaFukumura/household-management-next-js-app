# household-management-next-js-app

Next.jsを使ったCSVベースの家計簿アプリケーションです。
CSVファイルから収支データを読み込み、サマリーカード・カテゴリ別集計・円グラフ・一覧テーブルで収支を可視化します。

## 技術スタック

- **Next.js 16.2.2** - React フレームワーク（App Routerを使用）
- **React 19.2.4** - ユーザーインターフェース構築
- **TypeScript** - 型安全性
- **Tailwind CSS 4** - スタイリング
- **PapaParse** - CSVファイルの解析
- **Recharts** - グラフ描画（円グラフ）
- **ESLint** - コード品質管理

## 機能

- ホーム画面でデフォルトCSV（`public/data/household.csv`）を自動読み込みして収支を表示
- 月ナビゲーター：前月・翌月ボタンで表示月を切り替え、選択中の月の収支データのみを表示
- サマリーカード：合計収入・合計支出・収支差額を表示
- カテゴリ別支出一覧テーブル（合計金額降順）
- 支出割合ドーナツグラフ（Rechartsを使用、3%未満のカテゴリは「その他」に集約）
- 収支比較横棒グラフ：選択中の月の合計収入と合計支出を横棒グラフで比較表示
- 収支一覧テーブル（日付降順）
- CSVアップロード画面（`/upload`）でユーザー独自のCSVファイルをドラッグ&ドロップまたはクリックでアップロード
- 予算画面（`/budget`）でデフォルト予算CSV（`public/data/budget.csv`）を自動読み込みして予算を可視化
    - 予算サマリーカード：収入予算合計・支出予算合計を表示
    - 予算配分ドーナツグラフ：支出カテゴリ別の予算配分を表示
    - 予算横棒グラフ：収入予算・支出予算を横棒グラフで表示
    - 予算テーブル：カテゴリ別に予算金額を一覧表示
- CSVバリデーション：形式不正・カテゴリ不正などのエラーを行単位で表示
- ダークモード対応（手動切替機能付き）
    - ライトモードとダークモードの2つのモードを手動で切り替え可能
    - ユーザーの選択はローカルストレージに保存され、ページ再読み込み時も維持されます
- レスポンシブデザイン対応

## CSVフォーマット

### 収支CSV（`public/data/household.csv`）

CSVファイルの1行目はヘッダー行として読み飛ばされます。
2行目以降が収支データとして解析されます。

| 列 | 項目 | 形式 | 必須 |
|---|---|---|---|
| 1 | 日付 | `YYYY-MM-DD` | ○ |
| 2 | カテゴリ | 下記参照 | ○ |
| 3 | 種別 | `収入` または `支出` | ○ |
| 4 | 金額 | 正の整数 | ○ |
| 5 | メモ | 任意文字列 | |

**収入カテゴリ:** `給与`、`副業`

**支出カテゴリ:** `食料費`、`住宅費`、`光熱費`、`通信費`、`交通費`、`日用品`、`医療費`、`娯楽費`、`投資額`、`保険料`、`特別費`、`交際費`、`美容費`、`教養費`、`その他`

サンプルCSVファイルは `public/sample.csv` を参照してください。

### 予算CSV（`public/data/budget.csv`）

CSVファイルの1行目はヘッダー行として読み飛ばされます。
2行目以降が予算データとして解析されます。

| 列 | 項目 | 形式 | 必須 |
|---|---|---|---|
| 1 | カテゴリ | 下記参照 | ○ |
| 2 | 種別 | `収入` または `支出` | ○ |
| 3 | 予算金額 | 正の整数 | ○ |

収入・支出カテゴリは収支CSVと同じです。

## 始め方

### 前提条件

- Node.js 20.x以上
- npm、yarn、またはpnpm

### インストール

1. リポジトリをクローン：
    ```bash
    git clone https://github.com/TakuyaFukumura/household-management-next-js-app.git
    ```
    ```bash
    cd household-management-next-js-app
    ```

2. 依存関係をインストール：
    ```bash
    npm install
    ```
   または
    ```bash
    yarn install
    ```
   または
    ```bash
    pnpm install
    ```

### 開発サーバーの起動

```bash
npm run dev
```

または

```bash
yarn dev
```

または

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて
アプリケーションを確認してください。

### ビルドと本番デプロイ

本番用にアプリケーションをビルドする：

```bash
npm run build
```

```bash
npm start
```

または

```bash
yarn build
```

```bash
yarn start
```

または

```bash
pnpm build
```

```bash
pnpm start
```

## プロジェクト構造

```
├── public/
│   ├── data/
│   │   ├── budget.csv           # デフォルト予算データCSV
│   │   └── household.csv        # デフォルト収支データCSV
│   └── sample.csv               # サンプルCSVファイル
├── src/
│   ├── app/
│   │   ├── budget/
│   │   │   └── page.tsx         # 予算ページ（/budget）
│   │   ├── components/          # Reactコンポーネント
│   │   │   ├── BudgetBarChart.tsx       # 予算横棒グラフ
│   │   │   ├── BudgetPieChart.tsx       # 予算配分ドーナツグラフ
│   │   │   ├── BudgetSummaryCards.tsx   # 予算サマリーカード
│   │   │   ├── BudgetTable.tsx          # 予算テーブル
│   │   │   ├── CategoryTable.tsx        # カテゴリ別支出一覧テーブル
│   │   │   ├── CsvUploader.tsx          # CSVアップローダー
│   │   │   ├── DarkModeToggle.tsx       # ダークモード切替ボタン
│   │   │   ├── ExpensePieChart.tsx      # 支出割合ドーナツグラフ
│   │   │   ├── Header.tsx               # ヘッダーコンポーネント
│   │   │   ├── IncomeExpenseBarChart.tsx # 収支比較横棒グラフ
│   │   │   ├── MonthNavigator.tsx       # 月ナビゲーター
│   │   │   ├── SummaryCards.tsx         # サマリーカード
│   │   │   └── TransactionTable.tsx     # 収支一覧テーブル
│   │   ├── upload/
│   │   │   └── page.tsx         # CSVアップロードページ（/upload）
│   │   ├── globals.css          # グローバルスタイル
│   │   ├── layout.tsx           # アプリケーションレイアウト
│   │   └── page.tsx             # ホームページ（/）
│   └── lib/
│       ├── budget.ts            # 予算データの型定義・バリデーション関数
│       ├── constants.ts         # 収入・支出カテゴリ定数と型定義
│       └── csv.ts               # CSV読み込み・バリデーション共通ユーティリティ
├── __tests__/                   # テストファイル
├── package.json
├── next.config.ts
└── tsconfig.json
```

## カスタマイズ

### デフォルトデータの変更

ホーム画面で自動読み込みされるCSVデータを変更したい場合は、
`public/data/household.csv` を編集してください。

### スタイルの変更

スタイルは Tailwind CSS を使用しています。
各コンポーネントファイル内のクラス名を変更することで、外観をカスタマイズできます。

## 開発

### テスト

このプロジェクトはJestを使用したテストが設定されています。

#### テストの実行

```bash
npm test
```

または

```bash
yarn test
```

または

```bash
pnpm test
```

#### テストの監視モード

```bash
npm run test:watch
```

#### カバレッジレポートの生成

```bash
npm run test:coverage
```

#### テストファイルの構成

- `__tests__/budget.test.ts`: 予算バリデーションユーティリティのテスト
- `__tests__/csv.test.ts`: CSVバリデーションユーティリティのテスト
- `__tests__/page.test.tsx`: ホームページのテスト
- `__tests__/upload.test.tsx`: CSVアップロードページのテスト
- `__tests__/src/app/components/BudgetBarChart.test.tsx`: 予算横棒グラフのテスト
- `__tests__/src/app/components/BudgetPieChart.test.tsx`: 予算配分ドーナツグラフのテスト
- `__tests__/src/app/components/BudgetSummaryCards.test.tsx`: 予算サマリーカードのテスト
- `__tests__/src/app/components/BudgetTable.test.tsx`: 予算テーブルのテスト
- `__tests__/src/app/components/CategoryTable.test.tsx`: カテゴリ別支出テーブルのテスト
- `__tests__/src/app/components/CsvUploader.test.tsx`: CSVアップローダーのテスト
- `__tests__/src/app/components/DarkModeToggle.test.tsx`: ダークモード切替ボタンのテスト
- `__tests__/src/app/components/ExpensePieChart.test.tsx`: 支出割合ドーナツグラフのテスト
- `__tests__/src/app/components/Header.test.tsx`: ヘッダーコンポーネントのテスト
- `__tests__/src/app/components/IncomeExpenseBarChart.test.tsx`: 収支比較横棒グラフのテスト
- `__tests__/src/app/components/MonthNavigator.test.tsx`: 月ナビゲーターのテスト
- `__tests__/src/app/components/SummaryCards.test.tsx`: サマリーカードのテスト
- `__tests__/src/app/components/TransactionTable.test.tsx`: 収支一覧テーブルのテスト

#### テストの特徴

- **Reactコンポーネントテスト**: React Testing Library を使用したコンポーネントのレンダリングとインタラクションのテスト
- **バリデーションテスト**: CSVの各種バリデーションロジックのユニットテスト
- **モッキング**: localStorage や外部依存関係のモック
- **カバレッジ**: コードカバレッジの測定と報告

### リンティング

```bash
npm run lint
```

または

```bash
yarn lint
```

または

```bash
pnpm lint
```

### 型チェック

TypeScriptの型チェックは、ビルド時またはIDEで自動的に実行されます。

## CI/CD

このプロジェクトはGitHub Actionsを使用した継続的インテグレーション（CI）を設定しています。

### 自動テスト

以下の条件でCIが実行されます：

- `main`ブランチへのプッシュ時
- プルリクエストの作成・更新時

CIでは以下のチェックが行われます：

- ESLintによる静的解析
- TypeScriptの型チェック
- Jestを使用したユニットテストとインテグレーションテスト
- アプリケーションのビルド検証
- Node.js 20.x での動作確認

## 自動依存関係更新（Dependabot）

このプロジェクトでは、依存関係の安全性と最新化のために[Dependabot](https://docs.github.com/ja/code-security/dependabot)
を利用しています。

- GitHub Actionsおよびnpmパッケージの依存関係は**月次（月曜日 09:00 JST）**で自動チェック・更新されます。
- 更新内容は自動でプルリクエストとして作成されます。
- 詳細な設定は `.github/dependabot.yml` を参照してください。

## トラブルシューティング

### CSVの読み込みエラー

- CSVファイルが正しいフォーマット（日付,カテゴリ,種別,金額,メモ）になっているか確認してください
- 日付は `YYYY-MM-DD` 形式で入力してください
- カテゴリは定義済みのカテゴリ名を使用してください
- 金額は正の整数で入力してください

### ポート競合

デフォルトのポート3000が使用中の場合：

```bash
npm run dev -- --port 3001
```

