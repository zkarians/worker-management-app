import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "웅동물류센터 야간출하",
  description: "물류 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
