'use client';

import { Button, Card } from 'pixel-retroui';
import { QRCodeSVG } from 'qrcode.react';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Card className="mx-10 h-96 w-80 p-4">
        <a className="absolute left-4 top-4 hover:text-white" href="/">
          <h1 className="text-xl font-bold">SafeQR</h1>
        </a>
        <div className="flex min-h-full flex-col items-center justify-between space-y-4">
          <p className="text-center">
            Welcome to your <b>secure data-transfer</b> experience! Click on the
            buttons below to continue.
          </p>
          <Card className="bg-primary-foreground">
            <QRCodeSVG
              className="bg-primary-foreground p-2"
              bgColor="#fefcd0"
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
