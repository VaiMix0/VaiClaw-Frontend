'use client';
import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    try {
      const eventId = Sentry.captureException(error);
      Sentry.showReportDialog({
        eventId,
        title: 'Something broke!',
        subtitle: 'Please help us fix the issue by providing some details.',
        labelComments: 'What happened?',
        labelName: 'Your name',
        labelEmail: 'Your email',
        labelSubmit: 'Send Report',
        lang: 'en',
      });
    } catch {
      // Sentry not initialized — ignore
    }
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}

