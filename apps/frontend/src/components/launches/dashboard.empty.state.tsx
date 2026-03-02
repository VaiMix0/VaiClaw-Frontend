import React, { FC } from 'react';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { AddProviderButton } from '@gitroom/frontend/components/launches/add.provider.component';
import { Button } from '@gitroom/react/form/button';
import { useRouter } from 'next/navigation';

export const DashboardEmptyState: FC = () => {
    const t = useT();
    const router = useRouter();

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-[40px] text-center overflow-auto">
            <div className="max-w-[800px] bg-newSettings p-[40px] rounded-[16px] shadow-lg flex flex-col items-center">
                <h1 className="text-[32px] font-bold text-textColor mb-[16px]">
                    {t('welcome_to_vaiclaw', 'Welcome to VaiClaw! 🎉')}
                </h1>
                <p className="text-[18px] text-textColor mb-[32px] opacity-80">
                    {t('welcome_subtitle', 'Your social media automation journey starts here. Explore our features and set up your workspace when you are ready.')}
                </p>

                <div className="grid grid-cols-2 gap-[24px] w-full">
                    <div className="bg-newBgColorInner p-[24px] rounded-[12px] flex flex-col items-center text-center border border-newBorder">
                        <div className="text-[48px] mb-[16px]">⚙️</div>
                        <h3 className="text-[20px] font-[600] text-textColor mb-[8px]">
                            {t('step_1_title', '1. Setup Your Brand')}
                        </h3>
                        <p className="text-[14px] text-textColor opacity-70 mb-[16px]">
                            {t('step_1_desc', 'Configure your industry and brand voice to help AI understand your niche.')}
                        </p>
                        <Button onClick={() => router.push('/launches?onboarding=true&step=2')} className="mt-auto">
                            {t('configure_brand', 'Configure Brand')}
                        </Button>
                    </div>

                    <div className="bg-newBgColorInner p-[24px] rounded-[12px] flex flex-col items-center text-center border border-newBorder">
                        <div className="text-[48px] mb-[16px]">🔗</div>
                        <h3 className="text-[20px] font-[600] text-textColor mb-[8px]">
                            {t('step_2_title', '2. Connect Channels')}
                        </h3>
                        <p className="text-[14px] text-textColor opacity-70 mb-[16px]">
                            {t('step_2_desc', 'Link your Facebook, Zalo, TikTok, and other social media accounts.')}
                        </p>
                        <div className="mt-auto w-full flex justify-center">
                            <AddProviderButton />
                        </div>
                    </div>

                    <div className="bg-newBgColorInner p-[24px] rounded-[12px] flex flex-col items-center text-center border border-newBorder col-span-2">
                        <div className="text-[48px] mb-[16px]">✨</div>
                        <h3 className="text-[20px] font-[600] text-textColor mb-[8px]">
                            {t('step_3_title', '3. Create Magic with AI')}
                        </h3>
                        <p className="text-[14px] text-textColor opacity-70 mb-[16px]">
                            {t('step_3_desc', 'Once you have set up your brand and channels, use our AI Prompt to generate and schedule high-quality posts instantly.')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
