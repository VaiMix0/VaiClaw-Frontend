import { FC, lazy } from 'react';
import { Web3ProviderInterface } from '@gitroom/frontend/components/launches/web3/web3.provider.interface';
import { TelegramProvider } from '@gitroom/frontend/components/launches/web3/providers/telegram.provider';
import { MoltbookProvider } from '@gitroom/frontend/components/launches/web3/providers/moltbook.provider';
import { ZaloProvider } from '@gitroom/frontend/components/launches/web3/providers/zalo.provider';

const WrapcasterProvider = lazy(
  () =>
    import('@gitroom/frontend/components/launches/web3/providers/wrapcaster.provider').then(
      (mod) => ({ default: mod.WrapcasterProvider })
    )
);

export const web3List: {
  identifier: string;
  component: FC<Web3ProviderInterface>;
}[] = [
    {
      identifier: 'telegram',
      component: TelegramProvider,
    },
    {
      identifier: 'wrapcast',
      component: WrapcasterProvider as unknown as FC<Web3ProviderInterface>,
    },
    {
      identifier: 'moltbook',
      component: MoltbookProvider,
    },
    {
      identifier: 'zalo',
      component: ZaloProvider,
    },
  ];

