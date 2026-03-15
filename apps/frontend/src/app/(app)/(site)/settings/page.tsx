import { SettingsPopup } from '@gitroom/frontend/components/layout/settings.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'VaiMix Settings',
  description: '',
};
export default async function Index({
  searchParams,
}: {
  searchParams: Promise<{
    code: string;
  }>;
}) {
  return <SettingsPopup />;
}
