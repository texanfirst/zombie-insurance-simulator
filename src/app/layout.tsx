import type { Metadata } from "next";
import { Bangers, Bitter } from "next/font/google";
import "./globals.css";

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
  display: "swap",
});

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zombie Apocalypse Insurance Simulator",
  description: "Learn insurance by surviving the zombie apocalypse! An educational game about risk management, coverage, and financial decision-making.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bangers.variable} ${bitter.variable} antialiased noise-overlay`}
      >
        {children}
      </body>
    </html>
  );
}
