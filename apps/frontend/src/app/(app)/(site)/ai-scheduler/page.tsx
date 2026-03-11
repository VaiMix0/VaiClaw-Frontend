export const dynamic = 'force-dynamic';
import { AiSchedulerSettings } from '@gitroom/frontend/components/ai-scheduler/ai.scheduler.settings';
import Link from 'next/link';

export default async function AISchedulerPage() {
    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-[24px]">
                    <h1 className="text-2xl">AI Scheduler Hub</h1>
                    <Link href="/ai-scheduler/campaigns" className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition-colors hover:bg-primary/90 border border-transparent dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20">
                        Manage Campaigns
                    </Link>
                </div>
                <div className="w-full flex">
                    <AiSchedulerSettings accountInfo={null} />
                </div>
            </div>
        </>
    );
}
