'use client';

import 'reflect-metadata';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useShallow } from 'zustand/react/shallow';
import { PicksSocialsComponent } from '@gitroom/frontend/components/new-launch/picks.socials.component';
import { EditorWrapper } from '@gitroom/frontend/components/new-launch/editor';
import { SelectCurrent } from '@gitroom/frontend/components/new-launch/select.current';
import { ShowAllProviders } from '@gitroom/frontend/components/new-launch/providers/show.all.providers';
import { DatePicker } from '@gitroom/frontend/components/launches/helpers/date.picker';
import { RepeatComponent } from '@gitroom/frontend/components/launches/repeat.component';
import { TagsComponent } from '@gitroom/frontend/components/launches/tags.component';
import { useToaster } from '@gitroom/react/toaster/toaster';
import { weightedLength } from '@gitroom/helpers/utils/count.length';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { capitalize } from 'lodash';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { useRouter } from 'next/navigation';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { useShortlinkPreference } from '@gitroom/frontend/components/settings/shortlink-preference.component';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { newDayjs } from '@gitroom/frontend/components/layout/set.timezone';
import clsx from 'clsx';
import { Integrations } from '@gitroom/frontend/components/launches/calendar.context';
import { LoadingComponent } from '@gitroom/frontend/components/layout/loading';
import { useSearchParams } from 'next/navigation';

function countCharacters(text: string, type: string): number {
  if (type !== 'x') return text.length;
  return weightedLength(text);
}

export const CreatePostPage = () => {
  const fetch = useFetch();
  const t = useT();

  const loadIntegrations = useCallback(async () => {
    const res = await fetch('/integrations/list');
    const data = await res.json();
    return (data.integrations || []) as Integrations[];
  }, []);

  const { data: integrations, isLoading } = useSWR(
    'create-post-integrations',
    loadIntegrations,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      fallbackData: [],
    }
  );

  const searchParams = useSearchParams();
  const initialDate = searchParams.get('date');

  if (isLoading || !integrations) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingComponent />
      </div>
    );
  }

  return (
    <CreatePostPageInner
      integrations={integrations}
      initialDate={initialDate ? dayjs(initialDate) : undefined}
    />
  );
};

const CreatePostPageInner = ({ integrations, initialDate }: { integrations: Integrations[]; initialDate?: dayjs.Dayjs }) => {
  const t = useT();
  const router = useRouter();
  const fetch = useFetch();
  const toaster = useToaster();
  const ref = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { data: shortlinkPreferenceData } = useShortlinkPreference();

  const {
    setAllIntegrations,
    setDate,
    setEditor,
    addGlobalValue,
    reset,
    selectedIntegrations,
    hide,
    date,
    setDate: updateDate,
    repeater,
    setRepeater,
    tags,
    setTags,
    locked,
    current,
    global,
    internal,
    activateExitButton,
    setHide,
  } = useLaunchStore(
    useShallow((state) => ({
      setAllIntegrations: state.setAllIntegrations,
      setDate: state.setDate,
      setEditor: state.setEditor,
      addGlobalValue: state.addGlobalValue,
      reset: state.reset,
      selectedIntegrations: state.selectedIntegrations,
      hide: state.hide,
      date: state.date,
      setHide: state.setHide,
      repeater: state.repeater,
      setRepeater: state.setRepeater,
      tags: state.tags,
      setTags: state.setTags,
      locked: state.locked,
      current: state.current,
      global: state.global,
      internal: state.internal,
      activateExitButton: state.activateExitButton,
    }))
  );

  // Initialize store
  useEffect(() => {
    setDate(initialDate || dayjs().add(2, 'hour'));
    setAllIntegrations(integrations);
    setEditor('normal');
    addGlobalValue(0, [
      {
        content: '',
        id: makeId(10),
        media: [],
        delay: 0,
      },
    ]);

    return () => {
      reset();
    };
  }, []);

  useEffect(() => {
    if (hide) setHide(false);
  }, [hide]);

  const goBack = useCallback(() => {
    router.push('/launches');
  }, [router]);

  const schedule = useCallback(
    (type: 'draft' | 'now' | 'schedule') => async () => {
      setLoading(true);
      const checkAllValid = await ref.current?.checkAllValid();
      if (!checkAllValid) {
        setLoading(false);
        return;
      }

      const notEnoughChars = checkAllValid.filter((p: any) => {
        return p.values.some((a: any) => {
          return (
            countCharacters(
              stripHtmlValidation('normal', a.content, true),
              p?.integration?.identifier || ''
            ) === 0 && a.media?.length === 0
          );
        });
      });

      for (const item of notEnoughChars) {
        toaster.show(
          `${capitalize(item.integration.identifier.split('-')[0])} (${item.integration.name}): ` +
            t('post_needs_content_or_image', 'Your post should have at least one character or one image.'),
          'warning'
        );
        setLoading(false);
        return;
      }

      if (type !== 'draft') {
        for (const item of checkAllValid) {
          if (item.valid === false) {
            toaster.show(
              `${capitalize(item.integration.identifier.split('-')[0])} (${item.integration.name}): ${t('please_fix_your_settings', 'Please fix your settings')}`,
              'warning'
            );
            item.fix();
            setLoading(false);
            return;
          }
          if (item.errors !== true) {
            toaster.show(
              `${capitalize(item.integration.identifier.split('-')[0])} (${item.integration.name}): ${item.errors}`,
              'warning'
            );
            setLoading(false);
            return;
          }

          const sliceNeeded = checkAllValid.filter((p: any) => {
            return p.values.some((a: any) => {
              const strip = stripHtmlValidation('normal', a.content, true);
              const wl = countCharacters(strip, p?.integration?.identifier || '');
              const totalCharacters = wl > strip.length ? wl : strip.length;
              return totalCharacters > (p.maximumCharacters || 1000000);
            });
          });

          for (const si of sliceNeeded) {
            toaster.show(
              `${si?.integration?.name} (${si?.integration?.identifier}) ${t('post_is_too_long', 'post is too long, please fix it')}`,
              'warning'
            );
            setLoading(false);
            return;
          }
        }
      }

      const shortlinkPreference = shortlinkPreferenceData?.shortlink || 'ASK';
      let shortLink = false;

      if (shortlinkPreference !== 'NO') {
        const shortLinkUrl = await (
          await fetch('/posts/should-shortlink', {
            method: 'POST',
            body: JSON.stringify({
              messages: checkAllValid.flatMap((p: any) =>
                p.values.flatMap((a: any) => a.content)
              ),
            }),
          })
        ).json();

        if (shortLinkUrl.ask) {
          if (shortlinkPreference === 'YES') {
            shortLink = true;
          } else {
            shortLink = await deleteDialog(
              t('shortlink_urls_question', 'Do you want to shortlink the URLs?'),
              t('yes_shortlink_it', 'Yes, shortlink it!')
            );
          }
        }
      }

      const group = makeId(10);
      const data = {
        type,
        ...(repeater ? { inter: repeater } : {}),
        tags,
        shortLink,
        date: date.utc().format('YYYY-MM-DDTHH:mm:ss'),
        posts: checkAllValid.map((post: any) => ({
          integration: { id: post.integration.id },
          group,
          settings: { ...(post.settings || {}) },
          value: post.values.map((value: any) => ({
            ...(value.id ? { id: value.id } : {}),
            content: value.content,
            delay: value.delay || 0,
            image:
              (value?.media || []).map(
                ({ id, path, alt, thumbnail, thumbnailTimestamp }: any) => ({
                  id, path, alt, thumbnail, thumbnailTimestamp,
                })
              ) || [],
          })),
        })),
      };

      await fetch('/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      toaster.show(t('added_successfully', 'Added successfully'));
      router.push('/launches');
    },
    [ref, repeater, tags, date, shortlinkPreferenceData]
  );

  // Wait for store initialization
  if (!global.length && !internal.length) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col bg-newBgColorInner overflow-hidden">
      {/* Header */}
      <div className="bg-newBgColor px-[16px] py-[12px] flex items-center gap-[12px] border-b border-newBorder shrink-0">
        <button onClick={goBack} className="text-textColor">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[16px] lg:text-[20px] font-[600] flex-1">
          {t('create_post_title', 'Create Post')}
        </h1>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Editor panel */}
        <div className={clsx(
          'flex flex-col flex-1 min-h-0 lg:border-e border-newBorder overflow-y-auto',
          showPreview ? 'hidden lg:flex' : 'flex'
        )}>
          <div className="flex flex-col gap-[16px] p-[12px] lg:p-[20px]">
            {/* Channel selection */}
            <div className="flex w-full">
              <div className="flex flex-1">
                <PicksSocialsComponent toolTip={true} />
              </div>
            </div>

            {/* Editor tabs & content */}
            <div className="flex flex-1 gap-[6px] flex-col">
              <div><SelectCurrent /></div>
              <div className="flex-1 flex">
                {!hide && <EditorWrapper totalPosts={1} value="" />}
              </div>
              <div id="social-empty" className="pb-[16px]" />
            </div>

            {/* Channel settings portal target */}
            <div
              id="wrapper-settings"
              className={clsx(
                'select-none',
                current === 'global' && 'hidden'
              )}
            >
              <div className="flex-1 flex flex-col rounded-[12px] gap-[12px] overflow-hidden bg-newSettings">
                <div
                  id="social-settings"
                  className="flex flex-col gap-[20px] bg-newBgColor"
                />
                <style>
                  {`#social-settings [data-id="${current}"] {display: block !important;}`}
                </style>
              </div>
            </div>
          </div>
        </div>

        {/* Preview panel */}
        <div className={clsx(
          'w-full lg:w-[500px] flex flex-col min-h-0 border-t lg:border-t-0 border-newBorder overflow-y-auto',
          showPreview ? 'flex' : 'hidden lg:flex'
        )}>
          <div className="flex items-center px-[12px] py-[8px] lg:hidden border-b border-newBorder">
            <button
              onClick={() => setShowPreview(false)}
              className="text-[13px] font-[600] text-[#612BD3]"
            >
              {t('back_to_editor', 'Back to Editor')}
            </button>
          </div>
          <div className="p-[12px] lg:p-[20px]">
            <ShowAllProviders ref={ref} />
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="shrink-0 border-t border-newBorder bg-newBgColorInner px-[12px] py-[12px] flex flex-col gap-[8px] pb-[env(safe-area-inset-bottom,12px)]">
        {/* Tags & Repeat */}
        <div className="flex flex-wrap gap-[8px]">
          <TagsComponent
            name="tags"
            label={t('tags', 'Tags')}
            initial={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <RepeatComponent repeat={repeater} onChange={setRepeater} />
        </div>

        {/* Date & Actions */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-[8px]">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="lg:hidden cursor-pointer h-[44px] px-[16px] bg-btnSimple justify-center items-center flex rounded-[8px] text-[15px] font-[600]"
          >
            {showPreview ? t('back_to_editor', 'Back to Editor') : t('preview', 'Preview')}
          </button>

          <DatePicker onChange={updateDate} date={date} />

          <button
            disabled={selectedIntegrations.length === 0 || loading || locked}
            onClick={schedule('draft')}
            className="relative cursor-pointer disabled:cursor-not-allowed px-[20px] h-[44px] bg-btnSimple justify-center items-center flex rounded-[8px] text-[15px] font-[600]"
          >
            {loading && (
              <div className="absolute left-[50%] top-[50%] -translate-y-[50%] -translate-x-[50%]">
                <div className="animate-spin h-[20px] w-[20px] border-4 border-textColor border-t-transparent rounded-full" />
              </div>
            )}
            <div className={clsx(loading && 'invisible')}>
              {t('save_as_draft', 'Save as Draft')}
            </div>
          </button>

          <div className="group cursor-pointer relative">
            <button
              disabled={selectedIntegrations.length === 0 || loading || locked}
              onClick={schedule('schedule')}
              className="text-white relative w-full lg:min-w-[180px] disabled:cursor-not-allowed disabled:opacity-80 outline-none gap-[8px] flex justify-center items-center h-[44px] rounded-[8px] bg-[#612BD3] px-[20px]"
            >
              {loading && (
                <div className="absolute left-[50%] top-[50%] -translate-y-[50%] -translate-x-[50%]">
                  <div className="animate-spin h-[20px] w-[20px] border-4 border-white border-t-transparent rounded-full" />
                </div>
              )}
              <div className={clsx('text-[15px] font-[600]', loading && 'invisible')}>
                {selectedIntegrations.length === 0
                  ? t('check_circles_above', 'Check the circles above')
                  : t('add_to_calendar', 'Add to calendar')}
              </div>
            </button>

            <button
              onClick={schedule('now')}
              disabled={selectedIntegrations.length === 0 || loading || locked}
              className="rounded-[8px] z-[300] disabled:cursor-not-allowed disabled:opacity-80 hidden group-hover:flex absolute bottom-[100%] left-0 right-0 lg:left-auto lg:right-auto lg:-left-[12px] p-[12px] lg:w-[206px] bg-newBgColorInner"
            >
              <div className="text-white rounded-[8px] bg-[#D82D7E] h-[44px] w-full flex justify-center items-center">
                {t('post_now', 'Post Now')}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
