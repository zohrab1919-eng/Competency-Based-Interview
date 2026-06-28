import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CBI Practice App',
  description: 'Competency-Based Interview Simulator — S.T.A.R. Technique | Enablerz Consulting',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
