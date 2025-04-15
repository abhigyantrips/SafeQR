import { Metadata } from 'next';

import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'SafeQR',
  description: 'Transfer encrypted data through QR codes.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
