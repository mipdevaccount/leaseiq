import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Link from 'next/link';
import { Building2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Choice Properties · Lease Intelligence',
  description: 'Retrieval-Augmented Generation (RAG) chatbot over a corpus of REIT lease abstracts.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Disclaimer Banner */}
          <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 text-xs px-4 py-1.5 text-center font-medium border-b border-amber-200 dark:border-amber-800">
            Demonstration environment. Lease data is synthetic, calibrated against publicly disclosed Choice Properties portfolio characteristics. No actual lease documents were used.
          </div>

          {/* Header */}
          <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight hover:opacity-80 transition-opacity">
                  <Building2 className="h-5 w-5 text-primary" />
                  <span>LeaseIQ <span className="text-muted-foreground font-normal">Powered by Project X</span></span>
                </Link>
                <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <Link href="/" className="hover:text-foreground transition-colors">Chat</Link>
                  <Link href="/portfolio" className="hover:text-foreground transition-colors">Portfolio Dashboard</Link>
                  <Link href="/about" className="hover:text-foreground transition-colors">How it works</Link>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col relative">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
