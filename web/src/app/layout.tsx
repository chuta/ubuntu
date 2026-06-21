import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ubuntu GrowthOS",
  description: "Commercial Intelligence & Growth Operations Platform — Ubuntu Tribe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-screen bg-surface font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
