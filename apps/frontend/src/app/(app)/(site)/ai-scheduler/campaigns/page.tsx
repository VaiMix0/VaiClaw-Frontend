export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { AiCampaignList } from '@gitroom/frontend/components/ai-scheduler/ai.campaign.list';

export default async function CampaignsPage() {
    return (
        <>
            <div className="flex flex-col w-full">
                <div className="flex justify-between items-center mb-[24px]">
                    <h1 className="text-2xl">Auto-Pilot Campaigns</h1>
                    <Link href="/ai-scheduler" className="text-sm font-medium underline text-blue-500">
                        &larr; Back to Scheduler
                    </Link>
                </div>
                <div className="w-full flex">
                    <AiCampaignList />
                </div>
            </div>
        </>
    );
}

