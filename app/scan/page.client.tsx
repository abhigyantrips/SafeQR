'use client';

import { Button, Card, Input } from 'pixel-retroui';

import { useRef, useState } from 'react';

import { decryptData } from '@/lib/crypto';

// Import Html5Qrcode dynamically to avoid SSR issues
let Html5Qrcode: any;
let Html5QrcodeSupportedFormats: any;
if (typeof window !== 'undefined') {
  // Only import on client side
  import('html5-qrcode').then((module) => {
    Html5Qrcode = module.Html5Qrcode;
    Html5QrcodeSupportedFormats = module.Html5QrcodeSupportedFormats;
  });
}

// Extract hidden data from an image using LSB steganography
const extractHiddenData = (imageData: ImageData): string | null => {
  try {
    const data = imageData.data;

    // Extract length bits first (32 bits)
    let binaryLength = '';
    let dataIndex = 0;

    // Get the length value (first 32 bits)
    for (let i = 0; i < data.length && dataIndex < 32; i += 4) {
      for (let j = 0; j < 3 && dataIndex < 32; j++) {
        binaryLength += (data[i + j] & 1).toString();
        dataIndex++;
      }
    }

    // Convert binary length to number
    const lengthInBits = parseInt(binaryLength, 2);
    console.log('Binary data length (bits):', lengthInBits);

    // Sanity check the length
    if (
      isNaN(lengthInBits) ||
      lengthInBits <= 0 ||
      lengthInBits > data.length * 0.75
    ) {
      console.log('Invalid data length:', lengthInBits);
      return null;
    }

    // Now extract the actual data bits (after the length)
    let binaryData = '';

    // Continue from where we left off
    for (
      let i = Math.floor(dataIndex / 3) * 4;
      i < data.length && binaryData.length < lengthInBits;
      i += 4
    ) {
      for (let j = 0; j < 3 && binaryData.length < lengthInBits; j++) {
        // If this is the first pixel after the length, we may need to offset j
        const jOffset = i === Math.floor(dataIndex / 3) * 4 ? dataIndex % 3 : 0;

        if (j >= jOffset) {
          binaryData += (data[i + j] & 1).toString();
        }
      }
    }

    console.log('Extracted data bits:', binaryData.length);

    // Now convert the binary data to characters (8 bits per char)
    let result = '';
    for (let i = 0; i < binaryData.length; i += 8) {
      if (i + 8 <= binaryData.length) {
        const byte = binaryData.substring(i, i + 8);
        result += String.fromCharCode(parseInt(byte, 2));
      }
    }

    return result;
  } catch (error) {
    console.error('Error extracting hidden data:', error);
    return null;
  }
};

export default function ScanPageClient() {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [hiddenData, setHiddenData] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [decryptedHiddenData, setDecryptedHiddenData] = useState<string | null>(
    null
  );
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processQRCodeInImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!Html5Qrcode) {
        return reject(new Error('QR scanner library not loaded'));
      }

      const tempId = `file-scanner-container-${Date.now()}`;
      const tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const html5QrCode = new Html5Qrcode(tempId);
      html5QrCode
        .scanFile(file, false)
        .then((decodedText: string) => {
          resolve(decodedText);
          // Clean up happens in finally
        })
        .catch((err: any) => {
          reject(new Error(`QR Code scan failed: ${err}`));
        })
        .finally(() => {
          // First remove the tempDiv from the DOM
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }

          // Then wait a bit before trying to clear the scanner
          setTimeout(() => {
            try {
              // The clear() method should be safer now that the DOM element is gone
              html5QrCode.clear();
            } catch (error) {
              console.warn('Warning during cleanup:', error);
              // Non-fatal error, so just log it
            }
          }, 100);
        });
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setProcessing(true);

    const file = e.target.files?.[0];
    if (!file) {
      setProcessing(false);
      return;
    }

    try {
      // First try to decode the QR code
      const decodedText = await processQRCodeInImage(file).catch((err) => {
        throw new Error(`Failed to decode QR code: ${err.message}`);
      });

      setQrCodeData(decodedText);

      // Then try to extract hidden data from the image
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              throw new Error('Failed to create canvas context');
            }

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // Try to extract hidden data
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            const extractedHiddenData = extractHiddenData(imageData);
            console.log('Found hidden data:', extractedHiddenData);
            setHiddenData(extractedHiddenData);
            setProcessing(false);
          };

          img.onerror = () => {
            throw new Error('Failed to load image');
          };

          img.src = event.target?.result as string;
        } catch (err: any) {
          setError(`Error processing image: ${err.message}`);
          setProcessing(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setProcessing(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const handleDecrypt = () => {
    setError(null);
    setIsDecrypting(true);

    try {
      if (qrCodeData) {
        try {
          const decrypted = decryptData(qrCodeData, password);
          setDecryptedData(decrypted);
        } catch (err) {
          setDecryptedData('Invalid data or incorrect password');
        }
      }

      if (hiddenData) {
        try {
          const decryptedHidden = decryptData(hiddenData, password);
          setDecryptedHiddenData(decryptedHidden);
        } catch (err) {
          setDecryptedHiddenData('Invalid hidden data or incorrect password');
        }
      }
    } catch (err: any) {
      setError(`Decryption error: ${err.toString()}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="mx-10 min-h-96 w-80 max-w-md p-4">
      <h1 className="absolute left-4 top-4 text-xl font-bold">Scan QR</h1>
      <div className="flex min-h-full flex-col items-center justify-between space-y-4">
        <h1 className="text-lg font-bold">Upload QR Code</h1>

        {!qrCodeData && (
          <div className="w-full space-y-4">
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100">
              {!processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="p-2 text-center text-gray-500">
                    Upload an image containing a QR code
                  </p>
                </div>
              )}

              {processing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-center text-gray-500">
                    Processing image...
                  </p>
                </div>
              )}
            </div>

            <div className="flex w-full justify-center">
              <Button
                onClick={triggerFileUpload}
                className="w-full"
                disabled={processing}
              >
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        )}

        {qrCodeData && (
          <div className="w-full space-y-4">
            <div className="w-full break-words rounded bg-gray-100 p-2">
              <p className="font-semibold">QR Code Content:</p>
              <p className="overflow-hidden text-ellipsis text-sm opacity-75">
                {qrCodeData.length > 50
                  ? qrCodeData.substring(0, 50) + '...'
                  : qrCodeData}
              </p>

              {hiddenData && (
                <>
                  <p className="mt-2 font-semibold">Hidden Content Detected</p>
                  <p className="text-xs opacity-75">
                    Enter password to decrypt both contents
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password to decrypt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Note: If the password is incorrect, you'll receive garbage
                information after decryption.
              </p>
            </div>

            {decryptedData && (
              <div className="w-full rounded bg-gray-100 p-2">
                <p className="font-semibold">Decrypted Content:</p>
                <p className="break-words">{decryptedData}</p>
              </div>
            )}

            {decryptedHiddenData && (
              <div className="w-full rounded bg-gray-100 p-2">
                <p className="font-semibold">Decrypted Hidden Content:</p>
                <p className="break-words">{decryptedHiddenData}</p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleDecrypt}
                disabled={isDecrypting || !password}
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt'}
              </Button>

              <Button
                onClick={() => {
                  setQrCodeData(null);
                  setHiddenData(null);
                  setDecryptedData(null);
                  setDecryptedHiddenData(null);
                  setPassword('');
                  setError(null);
                  setProcessing(false);
                }}
              >
                Upload Another
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full rounded bg-red-100 p-2 text-red-800">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
