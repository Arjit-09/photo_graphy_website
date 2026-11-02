import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Beast Click — Weddings, Portraits & Films',
  description: 'Honest wedding, couple, and portrait photography by Beast Click. Tell your story at bcphotographer19@gmail.com or call +91 82875 45122.',
  applicationName: 'Beast Click',
  openGraph: {
    title: 'Beast Click — Weddings, Portraits & Films',
    description: 'For the moments that mean everything. Photography and films by Beast Click.',
    type: 'website',
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
