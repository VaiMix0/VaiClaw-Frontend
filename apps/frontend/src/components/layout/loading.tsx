'use client';

import { FC } from 'react';

export const Spinner: FC<{
  width?: number;
  height?: number;
  color?: string;
}> = ({ width = 20, height, color = '#612bd3' }) => {
  const w = width;
  const h = height || w;
  const border = Math.max(2, w / 8);
  return (
    <>
      <div
        className="vaiclaw-spinner"
        style={{
          width: w,
          height: h,
          border: `${border}px solid rgba(255,255,255,0.2)`,
          borderTopColor: color,
          borderRadius: '50%',
        }}
      />
      <style>{`
        .vaiclaw-spinner { animation: vaiclaw-spin 0.8s linear infinite; }
        @keyframes vaiclaw-spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
};

export const LoadingComponent: FC<{
  width?: number;
  height?: number;
}> = (props) => {
  return (
    <div className="flex-1 flex justify-center pt-[100px]">
      <Spinner width={props.width || 100} height={props.height || 100} color="#612bd3" />
    </div>
  );
};
