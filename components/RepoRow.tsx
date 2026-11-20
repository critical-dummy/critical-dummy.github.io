import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import type { GitHubRepo } from '@/lib/github-types';
import { formatUtcDate } from '@/lib/github-logic';

interface RepoRowProps {
  repo: GitHubRepo;
  compact?: boolean;
}

export function RepoRow({ repo, compact = false }: RepoRowProps) {
  const updatedLabel = formatUtcDate(repo.pushedAt ?? repo.updatedAt);

  return (
    <article className="group flex flex-col justify-between gap-3 border border-[#e4e4e7] bg-white p-4 transition-colors hover:border-[#a3a2a5] rounded-sm">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2 min-w-0">
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-sm font-semibold text-[#111113] transition-colors group-hover:text-[#ea580c] break-all"
            >
              <span>{repo.name}</span>
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 text-[#52525b] transition-colors group-hover:text-[#ea580c]"
                aria-hidden="true"
              />
            </a>
            {repo.fork && (
              <span className="text-xs text-[#52525b]">· Fork</span>
            )}
            {repo.archived && (
              <span className="text-xs text-[#ea580c]">· Archived</span>
            )}
          </div>

          <span className="font-mono text-xs text-[#52525b] tabular-nums shrink-0">
            Updated {updatedLabel}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-[#52525b]">
          {repo.description ?? 'No repository description provided on GitHub.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f1f3] pt-2.5 text-xs text-[#52525b]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-[#111113]">
            {repo.language ?? 'Language unspecified'}
          </span>
          <span aria-hidden="true" className="text-[#a3a2a5]">
            ·
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <Star className="h-3 w-3 text-[#52525b]" aria-hidden="true" />
            <span>{repo.stargazersCount}</span>
          </span>
          <span aria-hidden="true" className="text-[#a3a2a5]">
            ·
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums">
            <GitFork className="h-3 w-3 text-[#52525b]" aria-hidden="true" />
            <span>{repo.forksCount}</span>
          </span>
          {!compact && repo.topics.length > 0 && (
            <>
              <span aria-hidden="true" className="text-[#a3a2a5]">
                ·
              </span>
              <span>{repo.topics.slice(0, 3).join(', ')}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {repo.homepage && (
            <a
              href={repo.homepage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#52525b] underline decoration-[#a3a2a5] underline-offset-4 transition-colors hover:text-[#ea580c] whitespace-nowrap"
            >
              Homepage
            </a>
          )}
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#111113] transition-colors hover:text-[#ea580c] whitespace-nowrap"
          >
            Repository
          </a>
        </div>
      </div>
    </article>
  );
}
