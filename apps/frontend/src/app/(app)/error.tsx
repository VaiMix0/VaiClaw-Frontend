'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-[16px] p-[24px]">
      <h2 className="text-[20px] font-[600] text-newTextColor">
        Something went wrong
      </h2>
      <p className="text-[14px] text-textItemBlur text-center max-w-[400px]">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <button
        onClick={reset}
        className="px-[20px] py-[10px] bg-boxFocused text-newTextColor rounded-[10px] text-[14px] font-[600] hover:opacity-80 transition-opacity"
      >
        Try again
      </button>
    </div>
  );
}
