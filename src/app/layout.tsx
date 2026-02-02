import type { Metadata } from "next";
import { Caveat, Crimson_Pro, Special_Elite, Shadows_Into_Light } from "next/font/google";
import "./globals.css";

// Da Vinci Notebook Typography
const caveat = Caveat({
  variable: "--font-handwritten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const specialElite = Special_Elite({
  variable: "--font-typewriter",
  subsets: ["latin"],
  weight: ["400"],
});

const shadowsIntoLight = Shadows_Into_Light({
  variable: "--font-annotation",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "AG+ Notebook | Observations on Artificial Minds",
  description: "A Renaissance inventor's journal documenting AI discoveries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${caveat.variable} ${crimsonPro.variable} ${specialElite.variable} ${shadowsIntoLight.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
