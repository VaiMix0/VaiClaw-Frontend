'use client';

import { FC } from 'react';
import clsx from 'clsx';

export interface ScrollableTabsProps {
  tabs: { key: string; label: string }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export const ScrollableTabs: FC<ScrollableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex gap-[8px] overflow-x-auto shrink-0 scrollbar-none snap-x snap-mandatory',
        className
      )}
    >
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          className={clsx(
            'px-[12px] py-[8px] rounded-[8px] text-[13px] font-[600] whitespace-nowrap transition-colors snap-start',
            key === activeTab
              ? 'bg-boxFocused text-textItemFocused'
              : 'text-textItemBlur hover:bg-boxHover'
          )}
          onClick={() => onTabChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
