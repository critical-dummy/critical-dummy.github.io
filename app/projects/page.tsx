import type { Metadata } from 'next';
import { MotionSection } from '@/components/MotionSection';
import { ProjectsExplorer } from '@/components/ProjectsExplorer';
import { siteConfig } from '@/config/site';
import { getGitHubRepos } from '@/lib/github';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Public GitHub repositories for critical-dummy with live filtering and sorting.',
};

export const revalidate = 300;

export default async function ProjectsPage() {
  const reposResult = await getGitHubRepos(siteConfig.identity.githubUsername);

  return (
    <MotionSection className="space-y-6">
      <header className="space-y-2 border-b border-[#e4e4e7] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#111113]">
          Projects
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#52525b]">
          Public repositories retrieved directly from GitHub for{' '}
          <span className="font-mono font-medium text-[#111113]">
            {siteConfig.identity.githubUsername}
          </span>
          . Descriptions, languages, and timestamps reflect live repository
          metadata.
        </p>
      </header>

      <ProjectsExplorer initialResult={reposResult} />
    </MotionSection>
  );
}
