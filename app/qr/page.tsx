import QrPageClient from '@/app/qr/page.client';

export default async function QrPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const content = searchParams.content;

  return <QrPageClient content={(content as string) ?? ''} />;
}
