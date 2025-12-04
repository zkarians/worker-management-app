import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// LG Smart Korean 폰트 설정
const lgSmart = localFont({
  src: [
    {
      path: '../public/fonts/LG_Smart_Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../public/fonts/LG_Smart_Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/LG_Smart_Regular_Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/LG_Smart_SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/LG_Smart_Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/LG_Smart_Bold_Italic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-lg-smart',
});

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
      <body className={`${lgSmart.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
