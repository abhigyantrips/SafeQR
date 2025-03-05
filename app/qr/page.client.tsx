'use client';

import { Button, Card } from 'pixel-retroui';
import { QRCodeSVG } from 'qrcode.react';

import { useRef, useState } from 'react';

export default function QrPageClient({ content }: { content: string }) {
  const qrRef = useRef<SVGSVGElement>(null);
  const [qrBg, setQrBg] = useState('#fefcd0');

  const handleCopy = async () => {
    // Temporarily switch to white
    setQrBg('#ffffff');
    await new Promise((r) => setTimeout(r, 50)); // Wait briefly for rerender

    if (!navigator?.clipboard?.write || typeof ClipboardItem === 'undefined') {
      // Fallback: copy a data URL to clipboard
      if (!qrRef.current) return;
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(image, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        await navigator.clipboard.writeText(dataUrl);
        URL.revokeObjectURL(url);
      };
      image.src = url;
    } else {
      // Use ClipboardItem to copy as PNG
      if (!qrRef.current) return;
      const svgData = new XMLSerializer().serializeToString(qrRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(image, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        }, 'image/png');
        URL.revokeObjectURL(url);
      };
      image.src = url;
    }

    // Revert background color
    setQrBg('#fefcd0');
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'SafeQR code',
        text: 'Check out this QR code from SafeQR!',
        url: window.location.href,
      });
    } else {
      alert('Sharing is not supported on this device.');
    }
  };

  return (
    <Card className="mx-10 h-96 w-80 p-4">
      <h1 className="absolute left-4 top-4 text-xl font-bold">SafeQR</h1>
      <div className="flex min-h-full flex-col items-center justify-between space-y-4">
        <p className="text-center">
          Here's your QR Code. This can be scanned through <b>SafeQR</b> in
          order to be decoded.
        </p>
        <Card className="bg-primary-foreground">
          <QRCodeSVG
            ref={qrRef}
            className="bg-primary-foreground p-2"
            bgColor={qrBg}
            value={content || 'No content'}
          />
        </Card>
        <div className="flex w-full space-x-2">
          <Button onClick={handleCopy} className="w-full">
            Copy
          </Button>
          <Button onClick={handleShare} className="w-full">
            Share
          </Button>
        </div>
      </div>
    </Card>
  );
}
