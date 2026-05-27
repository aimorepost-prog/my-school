import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "My Stage　神谷京花｜思考の学校 認定講師",
    template: "%s",
  },
  description:
    "思考の学校 認定講師・神谷京花の体験講座・基礎講座・おさらい会のお申し込みサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
