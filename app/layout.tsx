import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Mindloom',
    default: 'Mindloom — Your Personal AI Companion',
  },
  description:
    'A self-hosted, two-layer personal AI that learns from your data. Local ML for speed, Cortex Ultra for deep reasoning. Your data, your AI.',
  keywords: ['AI', 'personal assistant', 'machine learning', 'productivity', 'study companion'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
