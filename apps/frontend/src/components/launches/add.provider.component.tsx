'use client';

import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import React, { FC, useCallback, useMemo } from 'react';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Input } from '@gitroom/react/form/input';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { Button } from '@gitroom/react/form/button';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { ApiKeyDto } from '@gitroom/nestjs-libraries/dtos/integrations/api.key.dto';
import { useRouter } from 'next/navigation';
import { TopTitle } from '@gitroom/frontend/components/launches/helpers/top.title.component';
import { useVariables } from '@gitroom/react/helpers/variable.context';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { web3List } from '@gitroom/frontend/components/launches/web3/web3.list';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { capitalize } from 'lodash';
import { DevicePairingModal } from '@gitroom/frontend/components/devices/qr-connect.modal';

const resolver = classValidatorResolver(ApiKeyDto);

export const useAddProvider = (update?: () => void, invite?: boolean) => {
  const modal = useModals();
  const fetch = useFetch();
  return useCallback(async () => {
    const data = await (await fetch('/integrations')).json();
    modal.openModal({
      title: 'Add Channel',
      withCloseButton: true,
      children: (
        <AddProviderComponent invite={!!invite} update={update} {...data} />
      ),
    });
  }, []);
};
export const AddProviderButton: FC<{
  update?: () => void;
}> = (props) => {
  const { update } = props;
  const add = useAddProvider(update);
  const invite = useAddProvider(update, true);
  const t = useT();

  return (
    <div className="flex group-[.sidebar]:block gap-[8px]">
      <button
        className="flex-1 group-[.sidebar]:w-[100%] group-[.sidebar]:flex-none text-btnText bg-btnSimple h-[44px] pt-[12px] pb-[14px] ps-[16px] pe-[20px] justify-center items-center flex rounded-[8px] gap-[8px]"
        onClick={add}
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M1.66675 10.0417C3.35907 10.2299 4.93698 10.9884 6.14101 12.1924C7.34504 13.3964 8.10353 14.9743 8.29175 16.6667M1.66675 13.4167C2.46749 13.58 3.20253 13.9751 3.7804 14.553C4.35827 15.1309 4.75344 15.8659 4.91675 16.6667M1.66675 16.6667H1.67508M11.6667 17.5H14.3334C15.7335 17.5 16.4336 17.5 16.9684 17.2275C17.4388 16.9878 17.8212 16.6054 18.0609 16.135C18.3334 15.6002 18.3334 14.9001 18.3334 13.5V6.5C18.3334 5.09987 18.3334 4.3998 18.0609 3.86502C17.8212 3.39462 17.4388 3.01217 16.9684 2.77248C16.4336 2.5 15.7335 2.5 14.3334 2.5H5.66675C4.26662 2.5 3.56655 2.5 3.03177 2.77248C2.56137 3.01217 2.17892 3.39462 1.93923 3.86502C1.66675 4.3998 1.66675 5.09987 1.66675 6.5V6.66667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="text-start text-[14px] group-[.sidebar]:hidden">
          {t('add_channel', 'Add Channel')}
        </div>
      </button>
      <button
        onClick={invite}
        data-tooltip-id="tooltip"
        data-tooltip-content={t(
          'invite_link',
          'Send Invite Link to a customer to add channel'
        )}
        className="group-[.sidebar]:hidden min-h-[44px] min-w-[44px] bg-btnSimple justify-center items-center flex rounded-[8px] cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="none"
        >
          <g clip-path="url(#clip0_2452_193804)">
            <path
              d="M6.6668 8.66599C6.9531 9.04875 7.31837 9.36545 7.73783 9.59462C8.1573 9.82379 8.62114 9.96007 9.0979 9.99422C9.57466 10.0284 10.0532 9.95957 10.501 9.79251C10.9489 9.62546 11.3555 9.36404 11.6935 9.02599L13.6935 7.02599C14.3007 6.39732 14.6366 5.55531 14.629 4.68132C14.6215 3.80733 14.2709 2.97129 13.6529 2.35326C13.0348 1.73524 12.1988 1.38467 11.3248 1.37708C10.4508 1.36948 9.60881 1.70547 8.98013 2.31266L7.83347 3.45266M9.33347 7.33266C9.04716 6.94991 8.68189 6.6332 8.26243 6.40403C7.84297 6.17486 7.37913 6.03858 6.90237 6.00444C6.4256 5.97029 5.94708 6.03908 5.49924 6.20614C5.0514 6.3732 4.64472 6.63461 4.3068 6.97266L2.3068 8.97266C1.69961 9.60133 1.36363 10.4433 1.37122 11.3173C1.37881 12.1913 1.72938 13.0274 2.3474 13.6454C2.96543 14.2634 3.80147 14.614 4.67546 14.6216C5.54945 14.6292 6.39146 14.2932 7.02013 13.686L8.16013 12.546"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0_2452_193804">
              <rect width="16" height="16" fill="textColor"></rect>
            </clipPath>
          </defs>
        </svg>
      </button>
    </div>
  );
};

export const UrlModal: FC<{
  gotoUrl(url: string): void;
}> = (props) => {
  const { gotoUrl } = props;
  const methods = useForm({
    mode: 'onChange',
  });

  const t = useT();

  const submit = useCallback(async (data: FieldValues) => {
    gotoUrl(data.url);
  }, []);
  return (
    <div className="rounded-[4px] border border-customColor6 bg-sixth px-[16px] pb-[16px] relative">
      <TopTitle title={`Instance URL`} />
      <button
        onClick={close}
        className="outline-none absolute end-[20px] top-[20px] mantine-UnstyledButton-root mantine-ActionIcon-root hover:bg-tableBorder cursor-pointer mantine-Modal-close mantine-1dcetaa"
        type="button"
      >
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
        >
          <path
            d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </button>
      <FormProvider {...methods}>
        <form
          className="gap-[8px] flex flex-col"
          onSubmit={methods.handleSubmit(submit)}
        >
          <div className="pt-[10px]">
            <Input label="URL" name="url" />
          </div>
          <div>
            <Button type="submit">{t('connect', 'Connect')}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
export const CustomVariables: FC<{
  variables: Array<{
    key: string;
    label: string;
    defaultValue?: string;
    validation: string;
    type: 'text' | 'password';
  }>;
  close?: () => void;
  identifier: string;
  gotoUrl(url: string): void;
  onboarding?: boolean;
}> = (props) => {
  const { close, gotoUrl, identifier, variables, onboarding } = props;
  const fetch = useFetch();
  const modals = useModals();
  const schema = useMemo(() => {
    return object({
      ...variables.reduce((aIcc, item) => {
        const splitter = item.validation.split('/');
        const regex = new RegExp(
          splitter.slice(1, -1).join('/'),
          splitter.pop()
        );
        return {
          ...aIcc,
          [item.key]: string()
            .matches(regex, `${item.label} is invalid`)
            .required(),
        };
      }, {}),
    });
  }, [variables]);
  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema),
    values: variables.reduce(
      (acc, item) => ({
        ...acc,
        ...(item.defaultValue
          ? {
            [item.key]: item.defaultValue,
          }
          : {}),
      }),
      {}
    ),
  });
  const submit = useCallback(
    async (data: FieldValues) => {
      const { url } = await (
        await fetch(
          `/integrations/social/${identifier}${onboarding ? '?onboarding=true' : ''
          }`
        )
      ).json();
      modals.closeAll();
      gotoUrl(
        `/integrations/social/${identifier}?state=${url}&code=${Buffer.from(
          JSON.stringify(data)
        ).toString('base64')}${onboarding ? '&onboarding=true' : ''}`
      );
    },
    [variables, onboarding]
  );

  const t = useT();

  return (
    <div className="rounded-[4px] relative">
      <FormProvider {...methods}>
        <form
          className="gap-[8px] flex flex-col pt-[10px]"
          onSubmit={methods.handleSubmit(submit)}
        >
          {variables.map((variable) => (
            <div key={variable.key}>
              <Input
                label={variable.label}
                name={variable.key}
                type={variable.type == 'text' ? 'text' : 'password'}
              />
            </div>
          ))}
          <div>
            <Button type="submit">{t('connect', 'Connect')}</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
const ExtensionNotFound: FC = () => {
  const modals = useModals();
  const t = useT();
  return (
    <div className="flex flex-col gap-[16px] pt-[8px]">
      <p className="text-[14px] text-textColor/80">
        {t(
          'extension_not_available',
          'The Postiz browser extension is not installed. You need to install it before connecting this channel.'
        )}
      </p>
      <div className="flex gap-[10px]">
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            window.open(
              'https://chromewebstore.google.com/detail/postiz/cidhffagahknaeodkplfbcpfeielnkjl?hl=en',
              '_blank'
            );
            modals.closeCurrent();
          }}
        >
          {t('install_extension', 'Install Extension')}
        </Button>
        <Button
          type="button"
          className="flex-1 !bg-transparent border border-tableBorder text-textColor"
          onClick={() => modals.closeCurrent()}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};

const ChromeExtensionWarning: FC<{
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  const modals = useModals();
  const t = useT();
  return (
    <div className="flex flex-col gap-[16px] pt-[8px]">
      <p className="text-[14px] text-textColor/80">
        {t(
          'chrome_extension_warning_intro',
          'This channel connects via the browser extension. Please be aware of the following:'
        )}
      </p>
      <ul className="flex flex-col gap-[8px] list-disc ps-[20px] text-[14px] text-textColor/80">
        <li>
          {t(
            'chrome_extension_warning_tos',
            'Using a browser extension to interact with a platform may violate its terms of service and could result in your account being suspended or banned.'
          )}
        </li>
        <li>
          {t(
            'chrome_extension_warning_unstable',
            'This method is not as reliable as native integrations and may experience random disconnections.'
          )}
        </li>
        <li>
          {t(
            'chrome_extension_warning_reconnect',
            'You may need to reconnect periodically if the session expires.'
          )}
        </li>
        <li>
          We will store your cookies securely to facilitate the connection.
        </li>
        <li>
          Postiz does not take responsibility for any issues arising or account termination due to the use of this method.
        </li>
      </ul>
      <div className="flex gap-[10px] mt-[8px]">
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            modals.closeCurrent();
            onConfirm();
          }}
        >
          {t('i_understand_continue', 'I understand, continue')}
        </Button>
        <Button
          type="button"
          className="flex-1 !bg-transparent border border-tableBorder text-textColor"
          onClick={() => {
            modals.closeCurrent();
            onCancel();
          }}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};

export const AddProviderComponent: FC<{
  social: Array<{
    identifier: string;
    name: string;
    toolTip?: string;
    isExternal: boolean;
    isWeb3: boolean;
    isChromeExtension?: boolean;
    extensionCookies?: Array<{
      name: string;
      domain: string;
    }>;
    customFields?: Array<{
      key: string;
      label: string;
      validation: string;
      type: 'text' | 'password';
    }>;
  }>;
  article: Array<{
    identifier: string;
    name: string;
  }>;
  invite: boolean;
  update?: () => void;
  onboarding?: boolean;
}> = (props) => {
  const { update, social, article, onboarding } = props;
  const { isGeneral, extensionId } = useVariables();
  const toaster = useToaster();
  const router = useRouter();
  const fetch = useFetch();
  const modal = useModals();

  const [isPairingOpen, setIsPairingOpen] = React.useState(false);
  // Optional mockup state for device connection - easily swappable with Zustand global state later
  const [isDeviceOnline, setIsDeviceOnline] = React.useState(false);
  const getSocialLink = useCallback(
    (
      invite: boolean,
      identifier: string,
      isExternal: boolean,
      isWeb3: boolean,
      isChromeExtension?: boolean,
      customFields?: Array<{
        key: string;
        label: string;
        validation: string;
        defaultValue?: string;
        type: 'text' | 'password';
      }>
    ) =>
      async () => {
        const onboardingParam = onboarding ? 'onboarding=true' : '';
        const openWeb3 = async () => {
          const web3Provider = web3List.find(
            (item) => item.identifier === identifier
          );
          if (!web3Provider) {
            toaster.show(
              t('could_not_connect_to_platform', 'Could not connect to the platform'),
              'warning'
            );
            return;
          }
          const { component: Web3Providers } = web3Provider;
          let nonce: string | undefined;
          try {
            const data = await (
              await fetch(
                `/integrations/social/${identifier}${onboarding ? '?onboarding=true' : ''}`
              )
            ).json();
            nonce = data?.url;
          } catch (e) {
            toaster.show(
              t('could_not_connect_to_platform', 'Could not connect to the platform'),
              'warning'
            );
            return;
          }
          if (!nonce) {
            toaster.show(
              t('could_not_connect_to_platform', 'Could not connect to the platform'),
              'warning'
            );
            return;
          }
          modal.openModal({
            title: `Add ${capitalize(identifier)}`,
            withCloseButton: true,
            classNames: {
              modal: 'bg-transparent text-textColor',
            },
            children: (
              <Web3Providers
                onComplete={(code, newState) => {
                  if (!code || !newState) {
                    return;
                  }
                  window.location.href = `/integrations/social/${identifier}?code=${code}&state=${newState}${onboarding ? '&onboarding=true' : ''}`;
                }}
                nonce={nonce}
              />
            ),
          });
          return;
        };

        const gotoIntegration = async (externalUrl?: string) => {
          const params = [
            externalUrl ? `externalUrl=${externalUrl}` : '',
            onboardingParam,
          ]
            .filter(Boolean)
            .join('&');
          let responseData: { url?: string; err?: string } = {};
          try {
            responseData = await (
              await fetch(
                `/integrations/social/${identifier}${params ? `?${params}` : ''}`
              )
            ).json();
          } catch (e) {
            toaster.show(
              t(
                'could_not_connect_to_platform',
                'Could not connect to the platform'
              ),
              'warning'
            );
            return;
          }
          const { url, err } = responseData;
          if (err) {
            toaster.show(
              t(
                'could_not_connect_to_platform',
                'Could not connect to the platform'
              ),
              'warning'
            );
            return;
          }

          if (!url) {
            toaster.show(
              t(
                'could_not_connect_to_platform',
                'Could not connect to the platform'
              ),
              'warning'
            );
            return;
          }

          if (invite) {
            toaster.show(
              'Invite link copied to clipboard, link will be available for 1 hour',
              'success'
            );
            modal.closeAll();
            copy(url);
            return;
          }

          window.location.href = url;
        };
        if (isWeb3) {
          openWeb3();
          return;
        }
        if (isChromeExtension) {
          const confirmed = await new Promise<boolean>((resolve) => {
            modal.openModal({
              title: t('chrome_extension_notice', 'Browser Extension Notice'),
              withCloseButton: true,
              onClose: () => resolve(false),
              children: (
                <ChromeExtensionWarning
                  onConfirm={() => {
                    resolve(true);
                  }}
                  onCancel={() => {
                    resolve(false);
                  }}
                />
              ),
            });
          });
          if (!confirmed) {
            return;
          }
          if (!extensionId || !chrome?.runtime?.sendMessage) {
            modal.openModal({
              title: t('extension_not_available_title', 'Extension Not Found'),
              withCloseButton: true,
              children: <ExtensionNotFound />,
            });
            return;
          }
          try {
            await new Promise<void>((resolve, reject) => {
              chrome.runtime.sendMessage(
                extensionId,
                { type: 'PING' },
                (response: any) => {
                  if (chrome.runtime.lastError || !response?.status) {
                    reject(new Error('Extension not reachable'));
                  } else {
                    resolve();
                  }
                }
              );
            });
          } catch {
            toaster.show(
              t(
                'extension_not_installed',
                'Postiz browser extension is not installed or not reachable.'
              ),
              'warning'
            );
            return;
          }
          try {
            const cookieResponse = await new Promise<any>((resolve, reject) => {
              chrome.runtime.sendMessage(
                extensionId,
                { type: 'GET_COOKIES', provider: identifier },
                (response: any) => {
                  if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    resolve(response);
                  }
                }
              );
            });
            if (!cookieResponse.success) {
              toaster.show(
                cookieResponse.error ||
                t(
                  'extension_cookies_missing',
                  'Could not get cookies. Please log in to the platform first.'
                ),
                'warning'
              );
              return;
            }
            const { url } = await (
              await fetch(
                `/integrations/social/${identifier}${onboarding ? '?onboarding=true' : ''
                }`
              )
            ).json();
            modal.closeAll();
            window.location.href = `/integrations/social/${identifier}?state=${url}&code=${Buffer.from(
              JSON.stringify(cookieResponse.cookies)
            ).toString('base64')}${onboarding ? '&onboarding=true' : ''}`;
          } catch {
            toaster.show(
              t(
                'extension_communication_error',
                'Failed to communicate with the browser extension.'
              ),
              'warning'
            );
          }
          return;
        }
        if (isExternal) {
          modal.openModal({
            title: 'URL',
            withCloseButton: true,
            classNames: {
              modal: 'bg-transparent text-textColor',
            },
            children: <UrlModal gotoUrl={gotoIntegration} />,
          });
          return;
        }
        if (customFields) {
          modal.openModal({
            title: t('add_provider_title', 'Add Provider'),
            withCloseButton: true,
            classNames: {
              modal: 'bg-transparent text-textColor',
            },
            children: (
              <CustomVariables
                identifier={identifier}
                gotoUrl={(url: string) => router.push(url)}
                variables={customFields}
                onboarding={onboarding}
              />
            ),
          });
          return;
        }
        await gotoIntegration();
      },
    [onboarding]
  );

  const t = useT();

  return (
    <>
      {isPairingOpen && (
        <DevicePairingModal
          onClose={() => setIsPairingOpen(false)}
          onConnected={(dev) => {
            setIsDeviceOnline(true);
            setIsPairingOpen(false);
            toaster.show(`Đã kết nối thiết bị: ${dev?.name || 'Thành công'}`, 'success');
          }}
        />
      )}

      <div className={clsx("w-full flex gap-6 rounded-[4px] relative", onboarding ? "flex-col" : "flex-col lg:flex-row")}>

        {/* Nhóm 1: Kênh Cá Nhân (Android Edge Device) */}
        <div className="flex-1 glass-card glow-border p-6 flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-1">Thiết bị Android (Cá nhân)</h3>
              <p className="text-sm text-gray-400">Kết nối điện thoại để đăng lên MXH Cá nhân</p>
            </div>
            <div className={clsx("px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2", isDeviceOnline ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
              <div className={clsx("w-2 h-2 rounded-full", isDeviceOnline ? "bg-green-400 animate-pulse" : "bg-red-400")} />
              {isDeviceOnline ? 'Online' : 'Offline'}
            </div>
          </div>

          {!isDeviceOnline ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center animate-float-slow">
                <svg className="w-10 h-10 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-300 font-medium mb-1">Chưa có thiết bị nào kết nối</p>
                <p className="text-sm text-gray-500 max-w-[250px] mx-auto">Vui lòng gắn ứng dụng VaiClaw để hỗ trợ việc đăng bài.</p>
              </div>
              <div className="flex flex-col w-full max-w-[200px] gap-3">
                <button onClick={() => setIsPairingOpen(true)} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 text-white font-medium shadow-lg shadow-accent-500/20 transition-all cursor-pointer">
                  Kết Nối Thiết Bị
                </button>
                <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-all cursor-pointer">
                  Tải App Android
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col pt-2 animate-fadeIn">
              <p className="text-sm text-gray-400 mb-4">Các nền tảng có thể thêm qua thiết bị này:</p>
              <div className="grid grid-cols-3 gap-3">
                {social.filter(item => {
                  if (!props.invite) return item.isChromeExtension;
                  return item.isChromeExtension && !item.isExternal && !item.isWeb3 && !item.customFields;
                }).map(item => (
                  <div
                    key={item.identifier}
                    onClick={getSocialLink(props.invite, item.identifier, item.isExternal, item.isWeb3, item.isChromeExtension, item.customFields)}
                    title={item.toolTip || ''}
                    className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    {item.identifier === 'youtube' ? (
                      <img className="w-8 h-8 group-hover:scale-110 transition-transform" src={`/icons/platforms/youtube.svg`} />
                    ) : (
                      <img className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform" src={`/icons/platforms/${item.identifier}.png`} />
                    )}
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center leading-tight">{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Optional: disconnect button */}
              <div className="mt-auto pt-6 flex justify-center">
                <button onClick={() => setIsDeviceOnline(false)} className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer">Ngắt kết nối thiết bị thử nghiệm</button>
              </div>
            </div>
          )}
        </div>

        {/* Nhóm 2: Kênh Doanh Nghiệp (Cloud API) */}
        <div className="flex-1 glass-card p-6 flex flex-col gap-4 min-h-[400px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-1">Cloud API (Official)</h3>
              <p className="text-sm text-gray-400">Kết nối trực tiếp qua API chính thức</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/10">
              <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          <div className="flex-1 pt-2">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
              {social.filter(item => {
                if (!props.invite) return !item.isChromeExtension;
                return !item.isChromeExtension && !item.isExternal && !item.isWeb3 && !item.customFields;
              }).map(item => (
                <div
                  key={item.identifier}
                  onClick={getSocialLink(props.invite, item.identifier, item.isExternal, item.isWeb3, item.isChromeExtension, item.customFields)}
                  title={item.toolTip || ''}
                  className="aspect-square rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] hover:from-white/10 hover:to-white/5 border border-white/5 hover:border-primary-500/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm hover:shadow-primary-500/20"
                >
                  {item.identifier === 'youtube' ? (
                    <img className="w-8 h-8 group-hover:scale-110 transition-transform" src={`/icons/platforms/youtube.svg`} />
                  ) : (
                    <img className="w-8 h-8 rounded-full group-hover:scale-110 transition-transform" src={`/icons/platforms/${item.identifier}.png`} />
                  )}
                  <span className="text-xs font-medium text-gray-300 group-hover:text-white text-center px-1 leading-tight">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
