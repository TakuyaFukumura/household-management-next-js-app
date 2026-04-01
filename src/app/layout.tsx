import type {Metadata} from "next";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
    title: "家計簿アプリ",
    description: "CSVから収支を管理する家計簿アプリケーション",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
        <body className="antialiased">
        {children}
        </body>
        </html>
    );
}

