# 共通ヘッダー 改善仕様書

## 1. 概要

本ドキュメントは、共通ヘッダー（`Header.tsx`）および CSV アップロード画面（`upload/page.tsx`）のヘッダーに関する改善内容について仕様を定義します。  
現状のヘッダーにはデザイン・UX 上の課題があるため、ユーザー体験の向上を目的として改修を行います。

---

## 2. 現状の課題

| No. | 課題 | 詳細 |
|-----|------|------|
| P-1 | ナビゲーションリンクの見た目がチープ | 「ホーム」「予算」「CSVをアップロード」がいずれも `text-sm text-blue-500 hover:underline` の小さなテキストリンクのみであり、視覚的な存在感が乏しくボタンらしさがない |
| P-2 | スマホ画面でのナビゲーションが未対応 | 画面幅が狭い場合でも PC 向けと同じ横並びリンクが表示されるため、リンクが窮屈になり操作しにくい。ハンバーガーメニューが存在しない |
| P-3 | CSV アップロード画面のヘッダーが他画面と不統一 | ホーム・予算画面は共通の `Header` コンポーネントを使用しているが、CSV アップロード画面（`upload/page.tsx`）はページ内にヘッダーを直接記述しており、タイトルが「CSVアップロード」、リンクも「ホームへ戻る」のみと構造が異なる |

---

## 3. 改善内容

### 3.1 ナビゲーションリンクのデザイン改善

#### 現状

```tsx
<Link href="/" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
    ホーム
</Link>
```

テキストリンクのみで、ボタンらしい視覚的フィードバックがなく操作性・視認性が低い。

#### 改善方針

- 各リンクをピル型（角丸）のボタン風スタイルに変更し、ホバー時に背景色を変化させる。
- 現在表示中のページに対応するリンクをアクティブ状態として強調表示（背景色・文字色を変える）する。
- アイコンをリンクラベルの左横に配置することで視認性を向上させる。

#### 変更対象ファイル

- `src/app/components/Header.tsx`

#### 変更内容イメージ

```tsx
{/* ピル型ボタン風ナビゲーションリンク（アイコン付き） */}
<Link
    href="/"
    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
               text-gray-600 dark:text-gray-300
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition-colors"
>
    🏠 ホーム
</Link>
<Link
    href="/budget"
    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
               text-gray-600 dark:text-gray-300
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition-colors"
>
    💰 予算
</Link>
<Link
    href="/upload"
    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
               text-gray-600 dark:text-gray-300
               hover:bg-gray-100 dark:hover:bg-gray-700
               transition-colors"
>
    📂 CSVをアップロード
</Link>
```

> **アクティブ状態の実装方針**  
> Next.js の `usePathname()` フック（`next/navigation`）を使用し、現在のパスと各リンクの `href` を比較する。  
> アクティブなリンクには `bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300` などの強調スタイルを適用する。  
> `usePathname()` はクライアントサイドフックであるため、`Header.tsx` の先頭に `'use client'` ディレクティブを追加する。

---

### 3.2 ハンバーガーメニューの導入（スマホ対応）

#### 現状

レスポンシブ対応がなく、スマホなどの狭い画面でもナビゲーションリンクが横並びで表示され、操作しにくい状態になっている。

#### 改善方針

- 画面幅が `md`（768px）未満の場合はナビゲーションリンクを非表示にし、左上にハンバーガーアイコン（☰）を表示する。
- ハンバーガーアイコンをタップするとドロワー（縦方向のメニュー）が開き、ナビゲーションリンクが縦並びで表示される。
- 再度タップするとドロワーが閉じる。
- メニューが開いている状態でリンクをクリックした場合も、メニューを閉じる。
- 外部ライブラリを導入せず、React の `useState` フックとTailwind CSS のレスポンシブプレフィックス（`md:`）のみで実装する。

#### 変更対象ファイル

- `src/app/components/Header.tsx`

#### ハンバーガーボタンの配置

ハンバーガーボタンはヘッダー左端（アプリタイトルの左横）に配置する（イシューの「左上にあるイメージ」はヘッダー左端を指す）。

```
[ ☰ ] 家計簿アプリ              [☀️]   ← スマホ表示（md 未満）
```

```
家計簿アプリ   🏠 ホーム  💰 予算  📂 CSVをアップロード  [☀️]   ← PC 表示（md 以上）
```

#### 変更内容イメージ

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DarkModeToggle from './DarkModeToggle';

const NAV_LINKS = [
    { href: '/',       label: '🏠 ホーム' },
    { href: '/budget', label: '💰 予算' },
    { href: '/upload', label: '📂 CSVをアップロード' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* ハンバーガーボタン（md 未満でのみ表示） */}
                <button
                    className="md:hidden mr-2 p-2 rounded-md text-gray-600 dark:text-gray-300
                               hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    aria-label="メニューを開く"
                    onClick={() => setMenuOpen((prev) => !prev)}
                >
                    {menuOpen ? '✕' : '☰'}
                </button>

                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">家計簿アプリ</h1>

                {/* PC 向けナビゲーション（md 以上でのみ表示） */}
                <nav className="hidden md:flex items-center gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                                ${pathname === href
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                    <DarkModeToggle />
                </nav>

                {/* スマホ向け：ダークモードトグルは常に右端に表示 */}
                <div className="md:hidden">
                    <DarkModeToggle />
                </div>
            </div>

            {/* スマホ向けドロワーメニュー */}
            {menuOpen && (
                <nav className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex flex-col gap-1">
                    {NAV_LINKS.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${pathname === href
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
```

---

### 3.3 CSV アップロード画面のヘッダー統一

#### 現状

`upload/page.tsx` はページ内にヘッダーを直接実装しており、共通の `Header` コンポーネントを使用していない。  
そのため、ナビゲーションリンクが「ホームへ戻る」の 1 つのみであり、他画面との一貫性がない。

```tsx
{/* upload/page.tsx 内の現状のヘッダー（独自実装） */}
<header className="bg-white dark:bg-gray-900 shadow-sm">
    <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">CSVアップロード</h1>
        <div className="flex items-center gap-2">
            <Link href="/" className="text-sm text-blue-500 dark:text-blue-300 hover:underline">
                ホームへ戻る
            </Link>
            <DarkModeToggle/>
        </div>
    </div>
</header>
```

#### 改善方針

- `upload/page.tsx` の独自ヘッダーを削除し、共通の `<Header />` コンポーネントに置き換える。
- CSV アップロード画面であることをユーザーが把握できるよう、ページの `<main>` 内上部に画面タイトル（「CSVアップロード」）および説明文を追記する。
- これにより、どの画面からでも全ナビゲーションへアクセスできるようになる。

#### 変更対象ファイル

- `src/app/upload/page.tsx`

#### 変更内容イメージ

```tsx
import Header from '../components/Header';

// ...

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* 共通ヘッダーに置き換え */}
        <Header />

        <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* 画面タイトルをページ本体側で表示 */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">CSVアップロード</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    CSV ファイルをアップロードして収支データを確認できます。
                </p>
            </div>

            <CsvUploader onDataLoaded={handleDataLoaded} />
            {/* ...以降は既存のままとする */}
        </main>
    </div>
);
```

---

### 3.4 その他の改善案

#### 3.4.1 ロゴ・アイコンの追加

現状、アプリタイトルはテキスト（「家計簿アプリ」）のみ。  
タイトル左横にアプリロゴ画像またはアイコン（例：💼 や 📊）を配置することで、ブランドイメージを向上させる。

#### 3.4.2 ヘッダーの固定表示（スティッキーヘッダー）

長いページをスクロールしてもヘッダーが常に画面上部に固定されるようにする（`sticky top-0 z-50`）。  
データが多い場合でもナビゲーションにすぐアクセスできるため利便性が向上する。  
固定時には背景に `backdrop-blur` を適用し、コンテンツとの重なりが自然に見えるよう工夫する。

#### 3.4.3 アクティブページのパンくずリスト表示

ヘッダー下部またはページ上部にパンくずリスト（例：`ホーム > CSVをアップロード`）を表示することで、  
ユーザーが現在の画面位置を直感的に把握できるようになる。

---

## 4. 要件

| No. | 要件 |
|-----|------|
| R-1 | ナビゲーションリンクがピル型ボタン風のスタイルになること |
| R-2 | 現在表示中のページに対応するナビゲーションリンクがアクティブ状態として強調表示されること |
| R-3 | 画面幅が `md`（768px）未満の場合にハンバーガーメニューが表示されること |
| R-4 | ハンバーガーメニューのアイコンはヘッダー左端（アプリタイトルの左横）に配置されること |
| R-5 | ハンバーガーメニューのドロワーが開閉できること |
| R-6 | ドロワー内のリンクをクリックした際にドロワーが閉じること |
| R-7 | CSV アップロード画面が共通の `Header` コンポーネントを使用すること |
| R-8 | CSV アップロード画面において、ページ本体側で画面タイトルが表示されること |
| R-9 | ダークモード・ライトモードの両方で視認性が確保されること |

---

## 5. 改修対象ファイル

| ファイルパス | 変更種別 | 変更内容 |
|-------------|----------|---------|
| `src/app/components/Header.tsx` | 修正 | ナビゲーションリンクのデザイン改善・ハンバーガーメニュー追加・アクティブ状態表示 |
| `src/app/upload/page.tsx` | 修正 | 独自ヘッダーを共通 `Header` コンポーネントに置き換え・画面タイトルをページ本体側に追記 |

---

## 6. 非機能要件・制約

- 既存のテスト（`__tests__/` 配下）が引き続き通過すること
- 外部 UI ライブラリ（Headless UI 等）は導入せず、React の標準フックと Tailwind CSS のみで実装すること
- Next.js の `usePathname()` フックを使用するため、`Header.tsx` に `'use client'` ディレクティブを追加すること
