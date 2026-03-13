'use client';

export const Logo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="60"
      height="60"
      viewBox="0 0 160 160"
      fill="none"
      className="mt-[8px] min-w-[60px] min-h-[60px]"
    >
      <rect width="160" height="160" rx="32" fill="url(#vmGrad)" />
      <text
        x="50%"
        y="55%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', sans-serif"
        fontSize="70"
        fontWeight="800"
        fill="white"
        letterSpacing="-4"
      >VM</text>
      <defs>
        <linearGradient id="vmGrad" x1="0" y1="0" x2="160" y2="160" gradientUnits="userSpaceOnUse">
          <stop stopColor="#713CE2" />
          <stop offset="1" stopColor="#4B1F9E" />
        </linearGradient>
      </defs>
    </svg>
  );
};
