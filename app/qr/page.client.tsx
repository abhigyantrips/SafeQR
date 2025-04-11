'use client';

import { Button, Card } from 'pixel-retroui';
import { QRCodeSVG } from 'qrcode.react';

import { useRef, useState } from 'react';

// Embeds hidden data into image using LSB steganography
const embedDataInImage = (
  canvas: HTMLCanvasElement,
  hiddenData: string
): HTMLCanvasElement => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Convert data to binary
  const binaryData = hiddenData
    .split('')
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  // Add length information to know how many bits to read later
  const binaryLength = binaryData.length.toString(2).padStart(32, '0');
  const fullBinaryData = binaryLength + binaryData;

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Check if image has enough capacity
  if (data.length * 0.75 < fullBinaryData.length) {
    console.warn('Hidden data too large for this image');
    return canvas;
  }

  // Embed data in LSB of RGB channels (skipping alpha)
  let dataIndex = 0;
  for (
    let i = 0;
    i < data.length && dataIndex < fullBinaryData.length;
    i += 4
  ) {
    for (let j = 0; j < 3 && dataIndex < fullBinaryData.length; j++) {
      // Clear the least significant bit and then set it to our data bit
      data[i + j] = (data[i + j] & 0xfe) | parseInt(fullBinaryData[dataIndex]);
      dataIndex++;
    }
  }

  // Put the modified pixels back
  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

export default function QrPageClient({
  content,
  hiddenData,
}: {
  content: string;
  hiddenData?: string;
}) {
  const qrRef = useRef<SVGSVGElement>(null);
  const [qrBg, setQrBg] = useState('#fefcd0');

  const processQrToCanvas = async (): Promise<HTMLCanvasElement> => {
    if (!qrRef.current) throw new Error('QR code not rendered');

    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(image, 0, 0);

        // If there's hidden data, embed it
        if (hiddenData) {
          resolve(embedDataInImage(canvas, hiddenData));
        } else {
          resolve(canvas);
        }

        URL.revokeObjectURL(url);
      };
      image.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(url);
      };
      image.src = url;
    });
  };

  const handleCopy = async () => {
    // Temporarily switch to white
    setQrBg('#ffffff');
    await new Promise((r) => setTimeout(r, 50)); // Wait briefly for rerender

    try {
      const canvas = await processQrToCanvas();

      if (
        !navigator?.clipboard?.write ||
        typeof ClipboardItem === 'undefined'
      ) {
        // Fallback: copy a data URL to clipboard
        const dataUrl = canvas.toDataURL('image/png');
        await navigator.clipboard.writeText(dataUrl);
      } else {
        // Use ClipboardItem to copy as PNG
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        }, 'image/png');
      }
    } catch (error) {
      console.error('Error copying QR code:', error);
    }

    // Revert background color
    setQrBg('#fefcd0');
  };

  const handleShare = async () => {
    try {
      const canvas = await processQrToCanvas();

      if (navigator.share) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'safeqr.png', { type: 'image/png' });
            await navigator
              .share({
                title: 'SafeQR code',
                text: 'Check out this QR code from SafeQR!',
                files: [file],
              })
              .catch(() => {
                // Fallback to URL sharing if file sharing fails
                navigator.share({
                  title: 'SafeQR code',
                  text: 'Check out this QR code from SafeQR!',
                  url: window.location.href,
                });
              });
          }
        }, 'image/png');
      } else {
        alert('Sharing is not supported on this device.');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      // Fallback to regular share
      if (navigator.share) {
        await navigator.share({
          title: 'SafeQR code',
          text: 'Check out this QR code from SafeQR!',
          url: window.location.href,
        });
      }
    }
  };

  const handleDownload = async () => {
    try {
      const canvas = await processQrToCanvas();
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.download = 'safeqr.png';
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <Card className="mx-10 h-96 w-80 p-4">
      <h1 className="absolute left-4 top-4 text-xl font-bold">SafeQR</h1>
      <div className="flex min-h-full flex-col items-center justify-between space-y-4">
        <p className="text-center">
          Here's your QR Code. This can be scanned through <b>SafeQR</b> in
          order to be decoded.
          {hiddenData && (
            <small className="mt-1 block">(Contains hidden data)</small>
          )}
        </p>
        <Card className="bg-primary-foreground">
          <QRCodeSVG
            ref={qrRef}
            className="bg-primary-foreground p-2"
            bgColor={qrBg}
            value={content || 'No content'}
          />
        </Card>
        <div className="flex w-full justify-between">
          <Button onClick={handleCopy} className="w-full">
            Copy
          </Button>
          <Button onClick={handleShare} className="w-full">
            Share
          </Button>
          <Button onClick={handleDownload} className="w-full">
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
}
