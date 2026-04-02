# 支出割合円グラフ改善仕様書

## 1. 概要

本ドキュメントは、支出割合円グラフ（`ExpensePieChart` コンポーネント）の視認性改善に関する仕様を定義します。  
現状の課題を整理したうえで、以下の改善を検討します。

1. グラフのスライスを割合の大きい順に並び替えて表示する
2. グラフ全体の視認性を高めるための追加アイデア

---

## 2. 現状の課題

| No. | 課題 |
|-----|------|
| P-1 | スライスがカテゴリ登録順に表示されており、どのカテゴリの支出が大きいか直感的に分かりにくい |
| P-2 | 支出割合が小さなカテゴリのラベルが重なり、視認性が低下する場合がある |
| P-3 | 凡例とスライスの対応を目視で追わなければならず、読み取りに手間がかかる |
| P-4 | ドーナツ型ではなく塗りつぶし型のため、グラフ中央のスペースが活用されていない |

---

## 3. 改善内容

### 3.1 スライスの並び替え（割合降順）

現在は `Map` の挿入順でスライスが描画される。  
`buildChartData` 関数の返り値を `value` の降順にソートし、割合の大きいカテゴリから時計回りに並べる。

**変更前の表示例（カテゴリ登録順）:**

```
食料費 → 交通費 → 光熱費 → 通信費 → 日用品 → 住宅費 → …
```

**変更後の表示例（割合降順）:**

```
住宅費（35%）→ 食料費（15%）→ 投資額（13%）→ 保険料（7%）→ …
```

---

### 3.2 視認性向上アイデア

#### 3.2.1 ドーナツグラフへの変更

`Pie` コンポーネントに `innerRadius` プロパティを追加することで、  
ドーナツ型（リングチャート）に変更します。  
中央のスペースに合計金額を表示することで、ひと目で支出総額が把握できます。

#### 3.2.2 小スライスの集約

割合が一定の閾値（例: 3%）未満のカテゴリは「その他」に集約し、  
スライス数を絞ることでラベルの重なりを防ぎます。

#### 3.2.3 ホバー時のハイライト

`activeIndex` を利用してホバー中のスライスの `outerRadius` を拡大し、  
選択中のカテゴリを視覚的に強調します。

#### 3.2.4 カスタム凡例（金額付き）

標準の `Legend` コンポーネントを `content` プロパティでカスタマイズし、  
凡例にカテゴリ名・金額・割合をまとめて表示します。  
グラフ本体のラベルを非表示（または最低限）にし、情報を凡例に集約することで  
スライス上のテキスト重なりを解消します。

#### 3.2.5 アニメーション

データ変化時のアニメーション（`isAnimationActive`）を有効にすることで、  
月切り替え時などにスライスの変化を視覚的に追いやすくします。

---

## 4. 技術仕様

### 4.1 ソートロジック（3.1 の詳細）

`buildChartData` 関数の返り値末尾に `.sort((a, b) => b.value - a.value)` を追加するだけで実現できます。

**変更前:**

```typescript
return Array.from(map.entries()).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
}));
```

**変更後:**

```typescript
return Array.from(map.entries())
    .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
```

---

### 4.2 ドーナツグラフ化（3.2.1 の詳細）

`Pie` コンポーネントに `innerRadius` を追加します。  
また、`recharts` の `Label` を利用してグラフ中央に合計金額を表示します。

```tsx
<Pie
    data={data}
    cx="50%"
    cy="45%"
    innerRadius={60}
    outerRadius={100}
    dataKey="value"
    label={renderCustomLabel}
    labelLine={true}
>
    {data.map((_, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
    <Label
        value={`合計 ¥${total.toLocaleString()}`}
        position="center"
        style={{fontSize: '14px', fill: '#374151'}}
    />
</Pie>
```

---

### 4.3 小スライス集約ロジック（3.2.2 の詳細）

閾値（`MIN_PERCENTAGE = 3`）未満のエントリを `その他` に集約します。  
`その他` カテゴリが元から存在する場合はそちらに加算します。

```typescript
const MIN_PERCENTAGE = 3;

function aggregateSmallSlices(entries: ChartEntry[], total: number): ChartEntry[] {
    const main = entries.filter((e) => e.percentage >= MIN_PERCENTAGE);
    const small = entries.filter((e) => e.percentage < MIN_PERCENTAGE);

    if (small.length === 0) return main;

    const otherValue = small.reduce((sum, e) => sum + e.value, 0);
    const existingOther = main.find((e) => e.name === 'その他');

    if (existingOther) {
        existingOther.value += otherValue;
        existingOther.percentage = total > 0 ? (existingOther.value / total) * 100 : 0;
        return main;
    }

    return [
        ...main,
        {
            name: 'その他',
            value: otherValue,
            percentage: total > 0 ? (otherValue / total) * 100 : 0,
        },
    ];
}
```

---

### 4.4 ホバーハイライト（3.2.3 の詳細）

`activeIndex` を `useState` で管理し、`Pie` の `onMouseEnter` / `onMouseLeave` で更新します。  
アクティブなスライスの `outerRadius` を 110 に拡大します。

```tsx
const [activeIndex, setActiveIndex] = useState<number | null>(null);

// ...

<Pie
    data={data}
    cx="50%"
    cy="45%"
    innerRadius={60}
    outerRadius={100}
    dataKey="value"
    onMouseEnter={(_, index) => setActiveIndex(index)}
    onMouseLeave={() => setActiveIndex(null)}
>
    {data.map((_, index) => (
        <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
            outerRadius={activeIndex === index ? 110 : 100}
        />
    ))}
</Pie>
```

---

### 4.5 カスタム凡例（3.2.4 の詳細）

`Legend` コンポーネントの `content` プロパティにカスタムレンダラーを渡します。

```tsx
function renderCustomLegend(props: {payload?: Array<{color: string; payload: ChartEntry}>}) {
    const {payload = []} = props;
    return (
        <ul className="mt-2 space-y-1 text-sm">
            {payload.map((entry, index) => (
                <li key={index} className="flex items-center gap-2">
                    <span
                        className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                        style={{backgroundColor: entry.color}}
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        {entry.payload.name}：¥{entry.payload.value.toLocaleString()}（{entry.payload.percentage.toFixed(1)}%）
                    </span>
                </li>
            ))}
        </ul>
    );
}

// ...

<Legend content={renderCustomLegend} />
```

---

## 5. 実装対象ファイル

### 5.1 変更ファイル

| ファイルパス | 変更内容 |
|-------------|----------|
| `src/app/components/ExpensePieChart.tsx` | ソート処理の追加、ドーナツ化、ホバーハイライト、カスタム凡例、小スライス集約 |

---

## 6. 優先度と実装順序

改善内容が多岐にわたるため、以下の優先度で段階的に実装することを推奨します。

| 優先度 | 改善項目 | 理由 |
|--------|----------|------|
| 高 | 3.1 割合降順ソート | コアとなる改善要件。変更量が少なく影響範囲が限定的 |
| 高 | 3.2.1 ドーナツグラフ化 | 合計金額の表示も兼ねて情報量が増え視認性が向上する |
| 中 | 3.2.4 カスタム凡例 | ラベル重なり問題を根本的に解消できる |
| 中 | 3.2.2 小スライス集約 | データ件数が多い場合に有効。閾値の調整が必要 |
| 低 | 3.2.3 ホバーハイライト | UX向上。機能的影響は小さい |
| 低 | 3.2.5 アニメーション | UX向上。月切り替えとの組み合わせで効果的 |

---

## 7. 関連ファイル

- `src/app/components/ExpensePieChart.tsx` - 支出割合グラフコンポーネント（改修対象）
- `src/app/page.tsx` - メインページ（`ExpensePieChart` の呼び出し元）
- `src/lib/constants.ts` - カテゴリ定数定義
