'use client';

import '@/styles/globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`antialiased`}>
        <div className="flex min-h-screen items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
