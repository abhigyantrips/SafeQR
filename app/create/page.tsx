'use client';

import { Button, Card, Input, TextArea } from 'pixel-retroui';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { encryptData } from '@/lib/crypto';

export default function CreatePage() {
  const [text, setText] = useState('');
  const [passkey, setPasskey] = useState('');
  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const encryptedContent = encryptData(text, passkey);
    router.push(`/qr?content=${encodeURIComponent(encryptedContent)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-10 h-96 w-80 p-4">
        <h1 className="absolute left-4 top-4 text-xl font-bold">Create QR</h1>
        <div className="flex min-h-full flex-col items-center justify-between space-y-4">
          <h1 className="text-lg font-bold">Create a QR Code</h1>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label htmlFor="text">Text</label>
              <TextArea
                id="text"
                placeholder="Enter your text here..."
                value={text}
                className="resize-none"
                onChange={(e) => setText(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="passkey">Passkey</label>
              <Input
                id="passkey"
                placeholder="supersecretpassword"
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
              />
            </div>
          </div>
          <div className="flex w-full justify-center">
            <Button type="submit">Submit</Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
