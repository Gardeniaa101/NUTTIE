import type { Metadata } from "next";
import { EB_Garamond, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"]
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "The F↔T Translator",
  description: "한국어 F↔T 의도와 톤 번역기"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className={`${ebGaramond.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
