import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { AvatarFrame } from '@/components/AvatarFrame';
import { DataStatusBanner } from '@/components/DataStatusBanner';
import { MotionSection } from '@/components/MotionSection';
import { RepoRow } from '@/components/RepoRow';
import { siteConfig } from '@/config/site';
import { getGitHubProfile, getGitHubRepos } from '@/lib/github';
import { formatUtcDate, selectFeaturedRepos } from '@/lib/github-logic';

export const revalidate = 300;

export default async function HomePage() {
  const [profileResult, reposResult] = await Promise.all([
    getGitHubProfile(siteConfig.identity.githubUsername),
    getGitHubRepos(siteConfig.identity.githubUsername),
  ]);

  const profile = profileResult.data;
  const allRepos = reposResult.data ?? [];
  const selectedRepos = selectFeaturedRepos(
    allRepos,
    siteConfig.selectedRepoNames,
    4
  );

  return (
    <MotionSection className="space-y-12">
      {/* Identity & Introduction */}
      <section
        aria-labelledby="home-identity-heading"
        className="grid grid-cols-1 gap-8 border-b border-[#e4e4e7] pb-10 lg:grid-cols-12 lg:items-start"
      >
        <div className="space-y-5 lg:col-span-8">
          <div className="flex items-start gap-4">
            <AvatarFrame
              src={profile?.avatarUrl}
              alt={`${siteConfig.identity.handle} GitHub avatar`}
              handle={siteConfig.identity.handle}
              size={68}
            />
            <div className="space-y-1 min-w-0">
              <h1
                id="home-identity-heading"
                className="text-2xl font-bold tracking-tight text-[#111113] sm:text-3xl [text-wrap:balance]"
              >
                {siteConfig.identity.title}
              </h1>
              <p className="text-sm font-medium text-[#52525b]">
                {siteConfig.identity.subtitle}
              </p>
              {profile && (
                <p className="font-mono text-xs text-[#52525b] tabular-nums">
                  @{profile.login}
                  {profile.name && profile.name !== profile.login
                    ? ` · ${profile.name}`
                    : ''}
                  {' · '}
                  {profile.publicRepos} public repositories
                </p>
              )}
            </div>
          </div>

          <p className="max-w-2xl text-base leading-relaxed text-[#111113]">
            {siteConfig.identity.introduction}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/projects"
              className="inline-flex min-h-[42px] items-center gap-2 border border-[#111113] bg-[#111113] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#ea580c] hover:bg-[#ea580c] rounded-sm whitespace-nowrap shrink-0"
            >
              <span>Browse Projects</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <a
              href={profile?.htmlUrl ?? siteConfig.identity.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center gap-1.5 border border-[#e4e4e7] bg-white px-4 py-2 text-sm font-medium text-[#111113] transition-colors hover:border-[#a3a2a5] rounded-sm whitespace-nowrap shrink-0"
            >
              <span>GitHub Profile</span>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            {profile?.blog && (
              <a
                href={profile.blog}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-1.5 border border-[#e4e4e7] bg-white px-4 py-2 text-sm font-medium text-[#111113] transition-colors hover:border-[#a3a2a5] rounded-sm whitespace-nowrap shrink-0"
              >
                <span>Nekoweb</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Right summary box: live GitHub metadata without fabricated stats */}
        <aside
          aria-label="Account index"
          className="border border-[#e4e4e7] bg-[#f7f7f8] p-5 lg:col-span-4 rounded-sm"
        >
          <h2 className="border-b border-[#e4e4e7] pb-2.5 text-xs font-semibold text-[#111113]">
            Public GitHub Record
          </h2>
          <dl className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#52525b]">Handle</dt>
              <dd className="font-mono font-medium text-[#111113]">
                {profile?.login ?? siteConfig.identity.githubUsername}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#52525b]">GitHub bio</dt>
              <dd className="font-mono text-[#111113]">
                {profileResult.status === 'ok'
                  ? (profile?.bio ?? 'None set')
                  : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#52525b]">Repositories</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profileResult.status === 'ok' && profile
                  ? profile.publicRepos
                  : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#52525b]">Joined</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profileResult.status === 'ok' && profile
                  ? formatUtcDate(profile.createdAt)
                  : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#52525b]">Pages host</dt>
              <dd className="font-mono text-[#111113]">
                {siteConfig.domains.githubPages}
              </dd>
            </div>
          </dl>
        </aside>
      </section>

      {/* Current Interests & Development Fields */}
      <section aria-labelledby="interests-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="interests-heading"
            className="text-lg font-semibold tracking-tight text-[#111113]"
          >
            Current Interests & Development Fields
          </h2>
          <Link
            href="/about"
            className="text-xs font-semibold text-[#52525b] underline decoration-[#a3a2a5] underline-offset-4 transition-colors hover:text-[#ea580c]"
          >
            Read full profile
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {siteConfig.interests.map((field) => (
            <div
              key={field.title}
              className="flex flex-col justify-between gap-3 border border-[#e4e4e7] bg-white p-5 rounded-sm"
            >
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-[#111113]">
                  {field.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#52525b]">
                  {field.summary}
                </p>
              </div>
              {field.relatedRepos.length > 0 && (
                <p className="border-t border-[#f1f1f3] pt-2.5 font-mono text-xs text-[#52525b]">
                  Related: {field.relatedRepos.join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Selected Projects (live from GitHub) */}
      <section aria-labelledby="selected-projects-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="selected-projects-heading"
            className="text-lg font-semibold tracking-tight text-[#111113]"
          >
            Selected Projects
          </h2>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#ea580c] transition-colors hover:text-[#c2410c]"
          >
            <span>View all public repositories</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {reposResult.status !== 'ok' && selectedRepos.length === 0 ? (
          <DataStatusBanner
            status={reposResult.status}
            errorMessage={reposResult.errorMessage}
            rateLimit={reposResult.rateLimit}
          />
        ) : selectedRepos.length === 0 ? (
          <div className="border border-[#e4e4e7] bg-[#f7f7f8] p-5 text-sm text-[#52525b] rounded-sm">
            No public repositories returned by GitHub for this account.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {selectedRepos.map((repo) => (
              <RepoRow key={repo.id} repo={repo} compact />
            ))}
          </div>
        )}
      </section>

      {/* Direct Platform & Section Links */}
      <section
        aria-labelledby="workspace-links-heading"
        className="border-t border-[#e4e4e7] pt-8"
      >
        <h2
          id="workspace-links-heading"
          className="mb-4 text-sm font-semibold text-[#111113]"
        >
          Workspace Sections & External Links
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/projects"
            className="flex flex-col justify-between gap-2 border border-[#e4e4e7] bg-[#f7f7f8] p-4 transition-colors hover:border-[#a3a2a5] rounded-sm"
          >
            <span className="text-sm font-semibold text-[#111113]">
              Projects
            </span>
            <span className="text-xs text-[#52525b]">
              Filter and sort all public repositories.
            </span>
          </Link>

          <Link
            href="/activity"
            className="flex flex-col justify-between gap-2 border border-[#e4e4e7] bg-[#f7f7f8] p-4 transition-colors hover:border-[#a3a2a5] rounded-sm"
          >
            <span className="text-sm font-semibold text-[#111113]">
              GitHub Activity
            </span>
            <span className="text-xs text-[#52525b]">
              Recent public events and data availability scope.
            </span>
          </Link>

          <Link
            href="/about"
            className="flex flex-col justify-between gap-2 border border-[#e4e4e7] bg-[#f7f7f8] p-4 transition-colors hover:border-[#a3a2a5] rounded-sm"
          >
            <span className="text-sm font-semibold text-[#111113]">About</span>
            <span className="text-xs text-[#52525b]">
              Background, technical interests, and philosophy.
            </span>
          </Link>

          <Link
            href="/contact"
            className="flex flex-col justify-between gap-2 border border-[#e4e4e7] bg-[#f7f7f8] p-4 transition-colors hover:border-[#a3a2a5] rounded-sm"
          >
            <span className="text-sm font-semibold text-[#111113]">
              Contact
            </span>
            <span className="text-xs text-[#52525b]">
              GitHub profile and configurable links.
            </span>
          </Link>
        </div>
      </section>
    </MotionSection>
  );
}
