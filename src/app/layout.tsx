import type { Metadata } from 'next';
import { Bricolage_Grotesque, Lexend } from 'next/font/google';
import '@/styles/globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
});

const body = Lexend({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'FAST Math Review',
  description: 'Florida 4th grade F.A.S.T. math review and testing workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
