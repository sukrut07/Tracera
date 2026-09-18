import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { TraceCursor } from '@/components/cursor/TraceCursor';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TRACERA — Audit Workflow, Clearly Traced',
  description:
    'A traceable CA engagement workflow platform: Client → Document → Review → Correction → Approval → Audit Trail → Closure.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full ${poppins.variable}`}>
      <body className="min-h-full flex flex-col bg-[#F7F5EF] text-[#0A0A0A] selection:bg-[#E73520] selection:text-white font-sans antialiased">
        {/* Custom Desktop Trace Cursor */}
        <TraceCursor />
        {children}
      </body>
    </html>
  );
}
