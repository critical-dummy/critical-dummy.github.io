import type { Metadata } from 'next';
import { ActivityView } from '@/components/ActivityView';
import { MotionSection } from '@/components/MotionSection';
import { siteConfig } from '@/config/site';
import {
  getGitHubProfile,
  getGitHubPublicEvents,
  getGitHubRepos,
} from '@/lib/github';

export const metadata: Metadata = {
  title: 'GitHub Activity',
  description:
    'Live public GitHub activity, repository summary, and data availability boundaries for critical-dummy.',
};

export const revalidate = 300;

export default async function ActivityPage() {
  const username = siteConfig.identity.githubUsername;
  const [profileResult, reposResult, eventsResult] = await Promise.all([
    getGitHubProfile(username),
    getGitHubRepos(username),
    getGitHubPublicEvents(username),
  ]);

  return (
    <MotionSection className="space-y-6">
      <header className="space-y-2 border-b border-[#e4e4e7] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#111113]">
          GitHub Activity
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#52525b]">
          Live public repository and event information from GitHub for{' '}
          <span className="font-mono font-medium text-[#111113]">
            {username}
          </span>
          . Unavailable metrics are explicitly labeled so missing data is never
          mistaken for zero activity.
        </p>
      </header>

      <ActivityView
        initialProfile={profileResult}
        initialRepos={reposResult}
        initialEvents={eventsResult}
      />
    </MotionSection>
  );
}
