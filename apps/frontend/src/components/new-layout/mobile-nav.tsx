'use client';

import React, { FC, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { Logo } from '@gitroom/frontend/components/new-layout/logo';
import { useMenuItem } from '@gitroom/frontend/components/layout/top.menu';
import { useUser } from '@gitroom/frontend/components/layout/user.context';
import { useVariables } from '@gitroom/react/helpers/variable.context';

// Hamburger icon
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// Mobile top header bar (visible only on mobile)
export const MobileHeader: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useUser();
  const { firstMenu, secondMenu } = useMenuItem();
  const { billingEnabled } = useVariables();
  const currentPath = usePathname();

  const allItems = [...firstMenu, ...secondMenu].filter((f) => {
    if (f.hide) return false;
    if (f.requireBilling && !billingEnabled) return false;
    if (f.name === 'Billing' && user?.isLifetime) return false;
    if (f.role) return f.role.includes(user?.role!);
    return true;
  });

  return (
    <>
      {/* Mobile top bar - glass effect */}
      <div className="lg:hidden flex items-center justify-between bg-newBgColorInner/90 backdrop-blur-md px-[16px] h-[56px] rounded-[16px] shrink-0 border border-white/[0.06]">
        <Link href="/launches">
          <Logo />
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-newTextColor p-[10px] rounded-[10px] hover:bg-boxFocused active:bg-boxFocused transition-colors"
        >
          {menuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {/* Mobile slide-down menu - glass card style */}
      <div
        className={clsx(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          menuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-newBgColorInner/95 backdrop-blur-xl rounded-[16px] mt-[4px] p-[8px] flex flex-col gap-[2px] border border-white/[0.06]">
          {allItems.map((item) => {
            const isExternal = item.path.startsWith('http');
            const isActive = !isExternal && currentPath.indexOf(item.path) === 0;
            const Component = isExternal ? 'a' : Link;
            const linkProps = isExternal
              ? { href: item.path, target: '_blank', rel: 'noopener noreferrer' }
              : { href: item.path, prefetch: true };

            return (
              <Component
                key={item.name}
                {...(linkProps as any)}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'flex items-center gap-[12px] px-[14px] py-[12px] rounded-[12px] text-[14px] font-[600] transition-all active:scale-[0.98]',
                  isActive
                    ? 'text-textItemFocused bg-boxFocused'
                    : 'text-textItemBlur hover:text-textItemFocused hover:bg-boxFocused/50'
                )}
              >
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </Component>
            );
          })}
        </div>
      </div>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1]"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

// Bottom navigation bar for mobile (key pages only)
export const MobileBottomNav: FC = () => {
  const { firstMenu } = useMenuItem();
  const user = useUser();
  const { isGeneral, billingEnabled } = useVariables();
  const currentPath = usePathname();

  // Show only first 5 items in bottom nav
  const bottomItems = firstMenu
    .filter((f) => {
      if (f.hide) return false;
      if (f.requireBilling && !billingEnabled) return false;
      if (f.role) return f.role.includes(user?.role!);
      return true;
    })
    .slice(0, 5);

  // @ts-ignore
  if (!user?.orgId || (user.tier === 'FREE' && isGeneral && billingEnabled)) {
    return null;
  }

  return (
    <nav
      className="mobile-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 bg-newBgColorInner/95 backdrop-blur-xl border-t border-white/[0.08]"
      style={{ zIndex: 9000 }}
    >
      <div className="flex items-center justify-around h-[64px] px-[8px] safe-area-bottom">
        {bottomItems.map((item) => {
          const isActive = currentPath.indexOf(item.path) === 0;
          return (
            <Link
              key={item.name}
              href={item.path}
              prefetch={true}
              className={clsx(
                'flex flex-col items-center justify-center gap-[4px] flex-1 py-[8px] rounded-[12px] transition-all active:scale-95 select-none',
                isActive
                  ? 'text-textItemFocused'
                  : 'text-textItemBlur active:text-textItemFocused'
              )}
            >
              <div className={clsx(
                'w-[36px] h-[36px] flex items-center justify-center rounded-[10px] transition-all',
                isActive && 'bg-boxFocused shadow-sm'
              )}>
                {item.icon}
              </div>
              <span className="text-[10px] font-[600] leading-tight truncate max-w-[64px]">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
