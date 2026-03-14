import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import Image from 'next/image';
import loadDynamic from 'next/dynamic';
import { TestimonialComponent } from '@gitroom/frontend/components/auth/testimonial.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <div className="bg-[#0E0E0E] flex flex-col lg:flex-row p-[8px] sm:p-[12px] gap-[12px] min-h-screen w-screen text-white overflow-x-hidden">
      <ReturnUrlComponent />
      <div className="flex flex-col py-[24px] sm:py-[40px] px-[16px] sm:px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white bg-[#1A1919]">
        <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
          <LogoTextComponent />
          <div className="flex">{children}</div>
        </div>
      </div>
      <div className="text-[36px] flex-1 pt-[88px] hidden lg:flex flex-col items-center">
        <div className="text-center">
          Over <span className="text-[42px] text-[#FC69FF]">20,000+</span>{' '}
          Entrepreneurs use
          <br />
          VaiMix To Grow Their Social Presence
        </div>
        <TestimonialComponent />
      </div>
    </div>
  );
}


