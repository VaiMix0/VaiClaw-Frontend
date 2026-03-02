import { TopTitle } from '@gitroom/frontend/components/launches/helpers/top.title.component';
import React, { FC, useCallback, useState } from 'react';
import { useModals } from '@gitroom/frontend/components/layout/new-modal';
import { Integration } from '@gitroom/frontend/prisma.mock';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { Button } from '@gitroom/react/form/button';
import { Slider } from '@gitroom/react/form/slider';
import { useT } from '@gitroom/react/translation/get.transation.service.client';

export const Element: FC<{
  setting: any;
  onChange: (value: any) => void;
}> = (props) => {
  const { setting, onChange } = props;
  const [value, setValue] = useState(setting.value);
  return (
    <div className="flex flex-col gap-[10px]">
      <div>{setting.title}</div>
      <div className="text-[14px]">{setting.description}</div>
      <Slider
        value={value === true ? 'on' : 'off'}
        onChange={() => {
          setValue(!value);
          onChange(!value);
        }}
        fill={true}
      />
    </div>
  );
};
export const SettingsModal: FC<{
  integration: Integration & {
    customer?: {
      id: string;
      name: string;
    };
  };
  onClose: () => void;
}> = (props) => {
  const fetch = useFetch();
  const t = useT();
  const { onClose, integration } = props;
  const modal = useModals();
  const [values, setValues] = useState(() => {
    let list = [];
    try {
      list = JSON.parse(integration?.additionalSettings || '[]');
    } catch (e) { }

    if (!list.find((p: any) => p.id === 'postforme_fallback')) {
      list.push({
        id: 'postforme_fallback',
        title: 'Dự phòng Postforme (Fallback)',
        description: 'Đăng bài tự động qua dịch vụ Postforme dự phòng nếu thiết bị kết nối của bạn bị mất mạng khi đến lịch đăng bài.',
        value: false
      });
    }
    return list;
  });
  const changeValue = useCallback(
    (index: number) => (value: any) => {
      const newValues = [...values];
      newValues[index].value = value;
      setValues(newValues);
    },
    [values]
  );
  const save = useCallback(async () => {
    await fetch(`/integrations/${integration.id}/settings`, {
      method: 'POST',
      body: JSON.stringify({
        additionalSettings: JSON.stringify(values),
      }),
    });
    modal.closeAll();
    onClose();
  }, [values, integration]);
  return (
    <div>
      <div className="mt-[16px]">
        {values.map((setting: any, index: number) => (
          <Element
            key={setting.title}
            setting={setting}
            onChange={changeValue(index)}
          />
        ))}
      </div>

      <div className="my-[16px] flex gap-[10px]">
        <Button onClick={save}>{t('save', 'Save')}</Button>
      </div>
    </div>
  );
};
