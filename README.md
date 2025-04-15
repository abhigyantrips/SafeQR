# [SafeQR](https://safeqr.abhigyantrips.dev)

> ⚠️ This project exists for **educational purposes only**.

Transfer data through QR codes, using encryption and steganography. SafeQR allows users to create QR codes with AES-256 encryption using a passkey, which they can then use to decode the data on the other end.

The algorithm also encodes data into the image itself through steganography, which can later be decoded using the same passkey.

![Example Screenshot](/public/example-screenshot.png)

## Technologies Used

This website has been built almost completely in TypeScript with the following frameworks.

1. [Next.JS](https://nextjs.org), with Static Site Generation.
2. [TailwindCSS](https://tailwindcss.com), for styling.
3. [React95](https://react95.github.io/React95/), a UI component library based on Windows95.
4. [CryptoJS](https://www.npmjs.com/package/crypto-js), a JavaScript library of crypto standards.

## Development

Install the dependencies using `pnpm`.

```console
pnpm install
```

Run the development server using the following command.

```console
pnpm dev
```
