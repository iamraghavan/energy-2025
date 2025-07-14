import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], variable: '--font-jost' });

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
    <html lang="en" className="dark">
      <body className={`${jost.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
