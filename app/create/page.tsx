'use client';

import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from 'pixel-retroui';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const [url, setUrl] = useState('');
  const [algorithm, setAlgorithm] = useState('');
  const [passkey, setPasskey] = useState('');
  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const encryptedContent = encryptContent(url, passkey, algorithm);
    router.push(
      `/qr?content=${encodeURIComponent(encryptedContent)}&algorithm=${algorithm}`
    );
  };

  const encryptContent = (
    content: string,
    passkey: string,
    algorithm: string
  ) => {
    // TODO: Implement encryption logic
    return btoa(content); // Example: using base64 encoding as a placeholder
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mx-10 h-96 w-80 p-4">
        <h1 className="absolute left-4 top-4 text-xl font-bold">Create QR</h1>
        <div className="flex min-h-full flex-col items-center justify-between space-y-4">
          <h1 className="text-lg font-bold">Create a QR Code</h1>
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <label htmlFor="url">URL</label>
              <Input
                id="url"
                placeholder="https://youtube.com/"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="algorithm">Encryption Algorithm</label>
              <DropdownMenu className="w-full">
                <DropdownMenuTrigger
                  className="w-full"
                  type="button"
                  onChange={(e) => console.log(e)}
                >
                  {algorithm || 'Choose an algorithm...'}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem className="w-full">
                    Option 1
                  </DropdownMenuItem>
                  <DropdownMenuItem className="w-full">
                    Option 2
                  </DropdownMenuItem>
                  <DropdownMenuItem className="w-full">
                    Option 3
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
