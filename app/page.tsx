'use client';

import { Button, Card } from 'pixel-retroui';
import { QRCodeCanvas } from 'qrcode.react';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Card className="h-96 w-80 p-4">
        <h1 className="absolute left-4 top-4 text-xl font-bold">SafeQR</h1>
        <div className="flex min-h-full flex-col items-center justify-between space-y-4">
          <p className="text-center">
            Welcome to your secure data-transfer experience! Click on the
            buttons below to continue.
          </p>
          <Card>
            <QRCodeCanvas
              className="bg-white p-2"
              value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1"
            />
          </Card>
          <div className="flex w-full space-x-2">
            <Button onClick={() => router.push('/scan')} className="w-full">
              Scan
            </Button>
            <Button onClick={() => router.push('/create')} className="w-full">
              Create
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}
