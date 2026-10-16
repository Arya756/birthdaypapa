import type { Metadata } from "next";
import { Dancing_Script, Caveat } from "next/font/google";
import "./globals.css";

const script = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-hand",
});

export const metadata: Metadata = {
  title: "Happy Birthday Papa",
  description: "A little something for you, Papa.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${script.variable} ${hand.variable}`}>
      <body className="bg-[#fbf8f2] text-[#2e2a26] antialiased">
        {children}
      </body>
    </html>
  );
}
