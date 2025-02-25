'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { Button, Window, WindowContent, WindowHeader } from 'react95';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Window resizable className="h-96 w-96">
        <WindowHeader>
          <span>SafeQR.exe</span>
        </WindowHeader>
        <WindowContent className="flex flex-col items-center space-y-4">
          <p className="text-center">
            Welcome to your secure data-transfer experience! Click on the
            buttons below to continue.
          </p>
          <QRCodeCanvas
            className="bg-white p-2"
            value="https://www.youtube.com/watch?v=dQw4w9WgXcQ&autoplay=1"
          />
          <div className="flex space-x-2">
            <Button onClick={() => router.push('/scan')}>Scan</Button>
            <Button onClick={() => router.push('/create')}>Create</Button>
          </div>
        </WindowContent>
      </Window>
    </div>
  );
}
