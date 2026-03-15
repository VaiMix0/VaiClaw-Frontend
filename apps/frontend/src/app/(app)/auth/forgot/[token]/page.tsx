export const dynamic = 'force-dynamic';
import { ForgotReturn } from '@gitroom/frontend/components/auth/forgot-return';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'VaiMix - Forgot Password',
  description: '',
};
export default async function Auth({ params }: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;
  return <ForgotReturn token={token} />;
}
