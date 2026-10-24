import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Frame by Frame — Some moments. Forever stories.', description: 'An intimate, cinematic approach to photography and films. Explore the journey from a fleeting moment to a memory you can hold.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
