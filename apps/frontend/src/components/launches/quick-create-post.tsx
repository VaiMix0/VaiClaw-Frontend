'use client';

import React, { FC } from 'react';
import dayjs from 'dayjs';
import { Integrations } from '@gitroom/frontend/components/launches/calendar.context';
import { AddEditModal } from '@gitroom/frontend/components/new-launch/add.edit.modal';

interface QuickCreatePostProps {
  integrations: Integrations[];
  onClose: () => void;
  onCreated: () => void;
  initialDate?: dayjs.Dayjs;
}

export const QuickCreatePost: FC<QuickCreatePostProps> = ({
  integrations,
  onClose,
  onCreated,
  initialDate,
}) => {
  return (
    <AddEditModal
      allIntegrations={integrations.map((p) => ({ ...p }))}
      integrations={integrations.slice(0).map((p) => ({ ...p }))}
      mutate={onCreated}
      date={initialDate || dayjs().add(2, 'hour')}
      customClose={onClose}
      reopenModal={() => ({})}
    />
  );
};
