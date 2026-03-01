'use client';

import React, { FC, useCallback, useMemo, useState } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import useSWR from 'swr';
import { orderBy } from 'lodash';
import clsx from 'clsx';
import Image from 'next/image';
import { AddProviderComponent } from '@gitroom/frontend/components/launches/add.provider.component';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const modals = useModals();
  const t = useT();

  return (
    <div className="w-full min-h-full flex-1 p-[40px] flex relative">
      <style>
        {`#support-discord {display: none}`}
      </style>
      <div className="flex flex-1 bg-newBgColorInner rounded-[20px] flex-col relative max-w-[1000px] mx-auto shadow-2xl overflow-y-auto">
        <button
          className="outline-none absolute end-[20px] top-[20px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder cursor-pointer mantine-Modal-close mantine-1dcetaa z-50 text-white"
          type="button"
          onClick={modals.closeAll}
        >
          <svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
          >
            <path
              d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
        <div className="flex-1 flex p-[40px]">
          <div className="flex flex-col gap-[24px] flex-1">
            {/* Step indicators */}
            <div className="flex items-center justify-center gap-[16px]">
              {/* Step 1 Indicator */}
              <div className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] font-semibold transition-colors',
                    step === 1
                      ? 'bg-boxFocused text-textItemFocused'
                      : 'bg-[#15161A] text-gray-500 border border-[#2b2d31]'
                  )}
                >
                  1
                </div>
                <span
                  className={clsx(
                    'text-[14px]',
                    step === 1 ? 'font-medium' : 'text-customColor18'
                  )}
                >
                  {t('select_plan', 'Select Plan')}
                </span>
              </div>
              <div className={clsx("w-[24px] h-[2px]", step >= 2 ? "bg-boxFocused" : "bg-[#2b2d31]")} />
              {/* Step 2 Indicator */}
              <div className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] font-semibold transition-colors',
                    step === 2
                      ? 'bg-boxFocused text-textItemFocused'
                      : step > 2 ? 'bg-boxFocused text-textItemFocused' : 'bg-[#15161A] text-gray-500 border border-[#2b2d31]'
                  )}
                >
                  2
                </div>
                <span
                  className={clsx(
                    'text-[14px]',
                    step === 2 || step > 2 ? 'font-medium' : 'text-customColor18'
                  )}
                >
                  {t('connect_channels', 'Connect Channels')}
                </span>
              </div>
              <div className={clsx("w-[24px] h-[2px]", step >= 3 ? "bg-boxFocused" : "bg-[#2b2d31]")} />
              {/* Step 3 Indicator */}
              <div className="flex items-center gap-[8px]">
                <div
                  className={clsx(
                    'w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] font-semibold transition-colors',
                    step === 3
                      ? 'bg-boxFocused text-textItemFocused'
                      : 'bg-[#15161A] text-gray-500 border border-[#2b2d31]'
                  )}
                >
                  3
                </div>
                <span
                  className={clsx(
                    'text-[14px]',
                    step === 3 ? 'font-medium' : 'text-customColor18'
                  )}
                >
                  {t('watch_tutorial', 'Watch Tutorial')}
                </span>
              </div>
            </div>

            {/* Step content */}
            {step === 1 && (
              <OnboardingStep1Plans
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <OnboardingStep2Channels
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
                onSkip={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <OnboardingStep3Tutorial onBack={() => setStep(2)} onFinish={onClose} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const OnboardingStep1Plans: FC<{ onNext: () => void }> = ({ onNext }) => {
  const t = useT();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');

  const plans = [
    {
      id: 'free',
      name: 'Free Forever',
      price: '$0',
      description: 'Perfect for small creators starting out.',
      features: ['Up to 3 Channels', '15 Posts per Month', 'Basic Analytics', 'Standard Support'],
      gradient: 'from-[#3b82f6] to-[#2563eb]',
      shadow: 'shadow-blue-500/20'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$49',
      period: '/month',
      badge: '14 DAYS FREE TRIAL',
      description: 'For growing creators and marketing agencies.',
      features: ['Up to 30 Channels', 'Unlimited Posts', 'Advanced Analytics', 'AI Content Generation', 'Priority Support'],
      gradient: 'from-[#622aff] to-[#8b5cf6]',
      shadow: 'shadow-purple-500/30'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: '$99',
      period: '/month',
      description: 'For huge brands handling complex social media.',
      features: ['Up to 100 Channels', 'Unlimited Posts', 'Custom Webhooks', 'Unlimited AI Generators', '24/7 Support'],
      gradient: 'from-[#10b981] to-[#059669]',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  return (
    <div className="flex flex-col gap-[30px] pt-[20px]">
      <div className="flex gap-[8px] flex-col text-center">
        <h2 className="text-[32px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          {t('choose_your_plan', 'Choose your subscription tier')}
        </h2>
        <p className="text-[15px] text-customColor18 max-w-[600px] mx-auto">
          {t('start_free_trial_desc', 'Start your 14-day free trial on the Pro plan today. No credit card required. Cancel anytime.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={clsx(
              'relative rounded-[20px] p-[24px] cursor-pointer transition-all duration-300 border-2 overflow-hidden flex flex-col',
              selectedPlan === plan.id
                ? 'border-[#8b5cf6] bg-[#1a1b23] transform scale-[1.02] shadow-2xl ' + plan.shadow
                : 'border-[#2b2d31] bg-[#15161a] hover:border-[#4b4d54] hover:bg-[#1a1b23]'
            )}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-[10px] font-bold px-[12px] py-[4px] rounded-bl-[12px] uppercase">
                {plan.badge}
              </div>
            )}

            <div className="mb-[16px]">
              <h3 className="text-[20px] font-semibold">{plan.name}</h3>
              <p className="text-[13px] text-gray-400 mt-[6px]">{plan.description}</p>
            </div>

            <div className="flex items-baseline mb-[24px]">
              <span className="text-[36px] font-bold">{plan.price}</span>
              {plan.period && <span className="text-gray-400 ml-[4px]">{plan.period}</span>}
            </div>

            <div className="flex-1 space-y-[12px] mb-[24px]">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-[10px] text-[14px]">
                  <svg className="w-[18px] h-[18px] text-[#10b981] mt-[2px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12l4 4L20 6" />
                  </svg>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <div className={clsx(
              "w-full py-[12px] rounded-[10px] text-center font-semibold text-[15px] transition-all",
              selectedPlan === plan.id
                ? `bg-gradient-to-r ${plan.gradient} text-white`
                : "bg-[#2b2d31] text-gray-300"
            )}>
              {selectedPlan === plan.id ? 'Selected' : 'Select'}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-[16px]">
        <button
          onClick={onNext}
          className="group flex items-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] hover:from-[#7c3aff] hover:to-[#9d6eff] text-white font-semibold px-[36px] py-[16px] rounded-[14px] text-[16px] transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          {t('start_trial', 'Start My Free Trial')}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
            <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const OnboardingStep2Channels: FC<{ onBack: () => void; onNext: () => void; onSkip: () => void }> = ({
  onBack,
  onNext,
  onSkip,
}) => {
  const fetch = useFetch();
  const t = useT();

  const getIntegrations = useCallback(async () => {
    return (await fetch('/integrations')).json();
  }, []);

  const load = useCallback(async (path: string) => {
    const list = (await (await fetch(path)).json()).integrations;
    return list;
  }, []);

  const { data: integrations } = useSWR('/integrations/list', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  });

  const sortedIntegrations = useMemo(() => {
    return orderBy(
      integrations,
      ['type', 'disabled', 'identifier'],
      ['desc', 'asc', 'asc']
    );
  }, [integrations]);

  const { data } = useSWR('get-all-integrations-onboarding', getIntegrations);

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex gap-[4px] flex-col text-center">
        <div className="text-[24px] font-semibold">
          {t('connect_your_channels', 'Connect Your Channels')}
        </div>
        <div className="text-[14px] text-customColor18">
          {t(
            'connect_social_media_to_start',
            'Connect your social media accounts to start scheduling posts'
          )}
        </div>
      </div>

      {/* Connected channels */}
      {sortedIntegrations.length > 0 && (
        <div className="bg-newTableHeader rounded-[8px] p-[16px]">
          <div className="text-[14px] font-medium mb-[12px]">
            {t('connected_channels', 'Connected Channels')} (
            {sortedIntegrations.length})
          </div>
          <div className="flex flex-wrap gap-[12px]">
            {sortedIntegrations.map((integration: any) => (
              <div
                key={integration.id}
                className="flex items-center gap-[8px] bg-customColor47/30 rounded-[8px] px-[12px] py-[8px]"
              >
                <div className="relative w-[28px] h-[28px]">
                  <Image
                    src={integration.picture}
                    className="rounded-full"
                    alt={integration.identifier}
                    width={28}
                    height={28}
                  />
                  <Image
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="rounded-full absolute -bottom-[3px] -end-[3px] border border-fifth"
                    alt={integration.identifier}
                    width={14}
                    height={14}
                  />
                </div>
                <span className="text-[13px]">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available platforms - using AddProviderComponent */}
      <div className="flex flex-col gap-[12px]">
        <div className="text-[14px] font-medium">
          {t('click_channel_to_add', 'Click a channel to add it')}
        </div>
        {data && (
          <AddProviderComponent
            invite={false}
            social={data.social || []}
            article={data.article || []}
            onboarding={true}
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-end pt-[24px] mt-[8px]">
        <button
          onClick={onBack}
          className="group flex items-center gap-[8px] bg-[#1a1b23] hover:bg-[#2b2d31] border-2 border-[#2b2d31] font-medium px-[24px] py-[14px] rounded-[12px] text-[15px] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
          </svg>
          {t('back', 'Back')}
        </button>
        <button
          onClick={onNext}
          className="group flex items-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] hover:from-[#7c3aff] hover:to-[#9d6eff] text-white font-semibold px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          {sortedIntegrations.length > 0
            ? t('continue', 'Continue')
            : t('continue_without_channels', 'Continue without channels')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const OnboardingStep3Tutorial: FC<{ onBack: () => void; onFinish: () => void }> = ({
  onBack,
  onFinish,
}) => {
  const t = useT();

  return (
    <div className="flex flex-col gap-[24px] flex-1">
      <div className="flex gap-[4px] flex-col text-center">
        <div className="text-[24px] font-semibold">
          {t('watch_tutorial_title', 'Learn How to Use Postiz')}
        </div>
        <div className="text-[14px] text-customColor18">
          {t(
            'watch_tutorial_description',
            'Watch this short video to learn how to get the most out of Postiz'
          )}
        </div>
      </div>

      {/* YouTube Video Embed */}
      <div className="relative flex-1 rounded-[12px] overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full flex justify-center">
          <iframe
            className="h-full aspect-video"
            src="https://www.youtube.com/embed/BdsCVvEYgHU?si=vvhaZJ8I5oXXvVJS?autoplay=1"
            title="Postiz Tutorial"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between pt-[24px] mt-[8px]">
        <button
          onClick={onBack}
          className="group flex items-center gap-[8px] bg-transparent border-2 border-boxFocused font-medium px-[24px] py-[12px] rounded-[12px] text-[15px] transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:-translate-x-1 transition-transform"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          {t('back', 'Back')}
        </button>
        <button
          onClick={onFinish}
          className="group flex items-center gap-[12px] bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-white font-semibold px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
        >
          {t('get_started', 'Get Started')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </button>
      </div>
    </div>
  );
};
