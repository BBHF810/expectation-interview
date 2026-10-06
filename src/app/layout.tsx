import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIに話して見つける、すれ違いのカタチ | みらいリビングラボ 工大祭2026",
  description: "家族や友人に抱いた『期待』と『すれ違い』をAIと振り返り、未来の暮らしにおける心地よい関わり方を見つける体験型展示（東京科学大学 みらいリビングラボ 出展）。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
