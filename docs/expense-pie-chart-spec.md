# 支出割合グラフ 改善仕様書

## 1. 概要

本ドキュメントは、支出割合円グラフ（`ExpensePieChart.tsx`）の改善内容について仕様を定義します。  
現状のグラフには下記の問題があり、ユーザー体験の向上を目的として改修を行います。

---

## 2. 現状の課題

| No. | 課題 | 詳細 |
|-----|------|------|
| P-1 | グラフが見切れる | `ResponsiveContainer` の高さが固定（`350px`）のため、カテゴリ数が多い場合にグラフ下部の凡例が表示領域からはみ出す |
| P-2 | 凡例の並び順が不統一 | 凡例アイテムが金額の降順で並んでいないため、どのカテゴリが最大かを一目で把握しづらい |
| P-3 | 配色がおもちゃっぽい | `#3b82f6`（青）、`#ef4444`（赤）、`#22c55e`（緑）など彩度が高い原色系の色を使用しており、視認性が低く印象が幼稚に見える |

---

## 3. 改善内容

### 3.1 グラフの見切れ修正

#### 現状

```tsx
<ResponsiveContainer width="100%" height={350}>
```

高さを `350px` に固定しているため、凡例アイテム数（最大で支出カテゴリ全種）が多い場合にグラフ下部が切れる。

#### 改善方針

- `PieChart` と凡例（legend）を縦に分離し、グラフ本体は上部に固定高さで配置、凡例はグラフコンポーネントの外側（`ResponsiveContainer` の下）に独立したリストとして描画する。
- これにより凡例の行数が増えても描画領域全体が自動的に伸縮し、見切れが発生しない。

#### 変更対象ファイル

- `src/app/components/ExpensePieChart.tsx`

#### 変更内容イメージ

```tsx
{/* グラフ本体のみ ResponsiveContainer に収める */}
<ResponsiveContainer width="100%" height={260}>
  <PieChart>
    <Pie ... />
    <Tooltip ... />
    {/* Legend は削除 */}
  </PieChart>
</ResponsiveContainer>

{/* 凡例はグラフの外側に独立して描画 */}
<ul className="mt-3 space-y-1 text-sm">
  {data.map((entry) => (
    <li key={entry.name} className="flex items-center gap-2">
      <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{backgroundColor: entry.fill}} />
      <span className="text-gray-700 dark:text-gray-300">
        {entry.name}：¥{entry.value.toLocaleString()}（{entry.percentage.toFixed(1)}%）
      </span>
    </li>
  ))}
</ul>
```

---

### 3.2 凡例の並び替え（金額降順）

#### 現状

`buildChartData` 内で `sort((a, b) => b.value - a.value)` により金額降順にソートしているが、  
`aggregateSmallSlices` でフィルタリングと再結合を行うため、`その他` が末尾に追加されるなど  
最終的な表示順が意図通りに保たれないケースがある。  
また、recharts の `Legend` コンポーネントは内部でデータの順序を変更する場合があり、  
凡例の表示順がデータ配列の順序と一致しないことがある。

#### 改善方針

- 3.1 で凡例を `ResponsiveContainer` の外に独立させることにより、recharts の `Legend` コンポーネントへの依存をなくす。
- 凡例描画に使用する `data` 配列は `aggregateSmallSlices` の結果をそのまま金額降順で並んでいる状態にする。
  - `buildChartData` は既に金額降順でソート済み
  - `aggregateSmallSlices` でも、`その他` をまとめた後に最終的な配列を再度金額降順でソートする

#### 変更対象ファイル

- `src/app/components/ExpensePieChart.tsx`

#### 変更内容イメージ

```ts
// aggregateSmallSlices の末尾でソートを行う
return [
  ...main,
  {
    name: 'その他',
    value: otherValue,
    percentage: total > 0 ? (otherValue / total) * 100 : 0,
  },
].sort((a, b) => b.value - a.value); // 再ソート追加
```

---

### 3.3 配色の改善

#### 現状

```ts
const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
```

彩度が高い原色系の色を 8 色使用しており、全体的に派手でまとまりのない印象になっている。

#### 改善方針

彩度・明度を抑えた落ち着いたトーンのカラーパレットへ変更する。  
ダークモードでの視認性も考慮し、明るすぎず暗すぎない中間トーンの色を採用する。  
また、カテゴリ数が最大 15 種（`EXPENSE_CATEGORIES` の件数）になることを考慮して、  
識別可能な色数を 15 色に拡張する。

#### 採用カラーパレット（案）

同系色の段階的なトーン変化を組み合わせた、落ち着きのある 15 色のパレットを使用する。

| インデックス | カラーコード | 色名（参考） |
|:---:|------|------|
| 0 | `#4e79a7` | スティールブルー |
| 1 | `#59a14f` | セージグリーン |
| 2 | `#e15759` | ダスティレッド |
| 3 | `#76b7b2` | スレートティール |
| 4 | `#edc948` | マスタードイエロー |
| 5 | `#b07aa1` | モーブパープル |
| 6 | `#ff9da7` | ダスティピンク |
| 7 | `#9c755f` | ウォームブラウン |
| 8 | `#bab0ac` | ウォームグレー |
| 9 | `#499894` | テール |
| 10 | `#f1ce63` | ソフトゴールド |
| 11 | `#a0cbe8` | スカイブルー |
| 12 | `#ffbe7d` | ピーチ |
| 13 | `#8cd17d` | ライトグリーン |
| 14 | `#b6992d` | オリーブゴールド |

> 参考：[Tableau 10 及び Tableau 20 カラーパレット](https://www.tableau.com/blog/colors-upgrade-tableau-10-56782)  
> このパレットはデータ可視化の分野で広く使われており、視認性・識別性・品位のバランスが取れている。

#### 変更対象ファイル

- `src/app/components/ExpensePieChart.tsx`

#### 変更内容イメージ

```ts
const COLORS = [
    '#4e79a7',
    '#59a14f',
    '#e15759',
    '#76b7b2',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ac',
    '#499894',
    '#f1ce63',
    '#a0cbe8',
    '#ffbe7d',
    '#8cd17d',
    '#b6992d',
];
```

---

## 4. 要件

| No. | 要件 |
|-----|------|
| R-1 | カテゴリ数が多い場合でもグラフが見切れないこと |
| R-2 | 凡例のアイテムが金額の降順（大きい順）で表示されること |
| R-3 | 配色が落ち着いた印象のパレットになること |
| R-4 | カテゴリ数が最大 15 種の場合でも各カテゴリが識別可能な色で表示されること |
| R-5 | ダークモード・ライトモードの両方で視認性が確保されること |
| R-6 | 既存の機能（ホバーアニメーション・ツールチップ・データなし表示）が引き続き動作すること |

---

## 5. 改修対象ファイル

| ファイルパス | 変更種別 | 変更内容 |
|-------------|----------|---------|
| `src/app/components/ExpensePieChart.tsx` | 修正 | グラフレイアウト調整・凡例ソート・配色変更 |

---

## 6. 非機能要件・制約

- 既存のテスト（`__tests__/` 配下）が引き続き通過すること
- recharts のバージョンアップは行わないこと
- Tailwind CSS のユーティリティクラスと組み合わせてスタイリングすること
