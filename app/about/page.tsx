import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AvatarFrame } from '@/components/AvatarFrame';
import { DataStatusBanner } from '@/components/DataStatusBanner';
import { MotionSection } from '@/components/MotionSection';
import { siteConfig } from '@/config/site';
import { getGitHubProfile } from '@/lib/github';
import { formatUtcDate } from '@/lib/github-logic';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Developer profile, technical interests, and development philosophy for critical-dummy.',
};

export const revalidate = 300;

export default async function AboutPage() {
  const profileResult = await getGitHubProfile(
    siteConfig.identity.githubUsername
  );
  const profile = profileResult.data;

  return (
    <MotionSection className="space-y-8">
      <header className="space-y-2 border-b border-[#e4e4e7] pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-[#111113]">
          About
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#52525b]">
          {siteConfig.about.lead}
        </p>
      </header>

      {profileResult.status !== 'ok' && (
        <DataStatusBanner
          status={profileResult.status}
          errorMessage={profileResult.errorMessage}
          rateLimit={profileResult.rateLimit}
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Profile summary column */}
        <aside className="space-y-5 border border-[#e4e4e7] bg-[#f7f7f8] p-5 lg:col-span-4 rounded-sm">
          <div className="flex items-center gap-3.5">
            <AvatarFrame
              src={profile?.avatarUrl}
              alt={`${siteConfig.identity.handle} avatar`}
              handle={siteConfig.identity.handle}
              size={56}
            />
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold text-[#111113]">
                {profile?.login ?? siteConfig.identity.githubUsername}
              </p>
              <p className="text-xs text-[#52525b]">
                {profile?.name ?? siteConfig.identity.title}
              </p>
            </div>
          </div>

          <dl className="space-y-2.5 border-t border-[#e4e4e7] pt-4 text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#52525b]">Public repos</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profile ? profile.publicRepos : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#52525b]">Followers</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profile ? profile.followers : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#52525b]">Following</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profile ? profile.following : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#52525b]">Account created</dt>
              <dd className="font-mono text-[#111113] tabular-nums">
                {profile ? formatUtcDate(profile.createdAt) : 'Unavailable'}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-[#52525b]">Location</dt>
              <dd className="font-mono text-[#111113]">
                {profileResult.status === 'ok'
                  ? (profile?.location ?? 'Not specified')
                  : 'Unavailable'}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col gap-2 border-t border-[#e4e4e7] pt-4">
            <a
              href={profile?.htmlUrl ?? siteConfig.identity.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center justify-between border border-[#111113] bg-white px-3 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-[#111113] hover:text-white rounded-sm"
            >
              <span>View GitHub Profile</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
            <Link
              href="/projects"
              className="inline-flex min-h-[40px] items-center justify-between border border-[#e4e4e7] bg-white px-3 py-2 text-xs font-medium text-[#111113] transition-colors hover:border-[#a3a2a5] rounded-sm"
            >
              <span>Inspect Repositories</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>

        {/* Editable profile & philosophy sections */}
        <div className="space-y-8 lg:col-span-8">
          {siteConfig.about.sections.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`about-${section.id}`}
              className="space-y-3 border-b border-[#e4e4e7] pb-6 last:border-b-0 last:pb-0"
            >
              <h2
                id={`about-${section.id}`}
                className="text-base font-semibold text-[#111113]"
              >
                {section.heading}
              </h2>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className="max-w-2xl text-sm leading-relaxed text-[#52525b]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
