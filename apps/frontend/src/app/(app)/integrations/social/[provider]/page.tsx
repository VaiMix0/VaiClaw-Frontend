import { ContinueIntegration } from '@gitroom/frontend/components/launches/continue.integration';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{
    provider: string;
  }>;
  searchParams: Promise<any>;
}) {
  const { provider } = await params;
  const resolvedSearchParams = await searchParams;
  const get = (await cookies()).get('auth');
  return <ContinueIntegration searchParams={resolvedSearchParams} provider={provider} logged={!!get?.name} />;
}
