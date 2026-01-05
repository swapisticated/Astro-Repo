import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Patrick_Hand,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import DefaultLayout from "@/components/layouts/DefaultLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  weight: "400",
  variable: "--font-patrick-hand",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GraphIt - Visualize GitHub Repositories",
  description:
    "Transform GitHub repositories into beautiful, interactive visualizations with GraphIt. Explore code structure and get AI-powered insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${patrickHand.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <DefaultLayout>{children}</DefaultLayout>
      </body>
    </html>
  );
}
