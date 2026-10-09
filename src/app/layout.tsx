import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DevConsoleViewer } from "@/components/DevConsoleViewer";
import { VoiceInputProvider } from "@/contexts/VoiceInputContext";

export const metadata: Metadata = {
  title: "AIに話して見つける、すれ違いのカタチ",
  description: "身近な人に抱いた『期待』と『すれ違い』をAIとお話しして、お互いの気持ちの受け止めや未来の関係性を動物タイプで楽しく診断します。",
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
        <VoiceInputProvider>
          <main className="container">{children}</main>
          <DevConsoleViewer />
        </VoiceInputProvider>
      </body>
    </html>
  );
}
