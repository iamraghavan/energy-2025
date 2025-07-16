import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/auth-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ScoreCast | Live Sports Scores & Predictions',
  description: 'Your ultimate destination for live scores, match schedules, and AI-powered predictions across Football, Cricket, Basketball, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
