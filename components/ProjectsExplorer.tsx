'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, Search, X } from 'lucide-react';
import {
  extractLanguages,
  filterAndSortRepos,
  formatUtcDateTime,
} from '@/lib/github-logic';
import type {
  GitHubRepo,
  GitHubResult,
  RepoSortOption,
  RepoSourceFilter,
} from '@/lib/github-types';
import { DataStatusBanner } from './DataStatusBanner';
import { RepoRow } from './RepoRow';

interface ProjectsExplorerProps {
  initialResult: GitHubResult<GitHubRepo[]>;
}

export function ProjectsExplorer({ initialResult }: ProjectsExplorerProps) {
  const [result, setResult] = useState<GitHubResult<GitHubRepo[]>>(initialResult);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('all');
  const [source, setSource] = useState<RepoSourceFilter>('all');
  const [sort, setSort] = useState<RepoSortOption>('updated');

  const repos = useMemo(() => result.data ?? [], [result.data]);

  const languages = useMemo(() => extractLanguages(repos), [repos]);

  const filteredRepos = useMemo(
    () =>
      filterAndSortRepos(repos, {
        query,
        language,
        source,
        sort,
      }),
    [repos, query, language, source, sort]
  );

  const hasActiveFilters =
    query.trim().length > 0 || language !== 'all' || source !== 'all';

  const handleClearFilters = () => {
    setQuery('');
    setLanguage('all');
    setSource('all');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/github?section=repos&fresh=1', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as {
        repos: GitHubResult<GitHubRepo[]>;
      };
      if (payload.repos) {
        setResult(payload.repos);
      }
    } catch {
      setResult((prev) => ({
        status: 'error',
        data: prev.data,
        rateLimit: prev.rateLimit,
        errorMessage: 'Failed to refresh repository data from the server.',
        fetchedAt: new Date().toISOString(),
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="space-y-4 border border-[#e4e4e7] bg-[#f7f7f8] p-4 rounded-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="md:col-span-2 lg:col-span-5">
            <label
              htmlFor="repo-search-input"
              className="mb-1.5 block text-xs font-semibold text-[#111113]"
            >
              Filter repositories
            </label>
            <div className="relative flex items-center">
              <Search
                className="pointer-events-none absolute left-3 h-4 w-4 text-[#52525b]"
                aria-hidden="true"
              />
              <input
                id="repo-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, description, or language..."
                className="h-10 w-full border border-[#e4e4e7] bg-white pl-9 pr-9 text-sm text-[#111113] placeholder:text-[#71717a] rounded-sm"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear repository search"
                  className="absolute right-2 inline-flex h-7 w-7 items-center justify-center text-[#52525b] hover:text-[#111113]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="repo-sort-select"
              className="mb-1.5 block text-xs font-semibold text-[#111113]"
            >
              Sort order
            </label>
            <select
              id="repo-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as RepoSortOption)}
              className="h-10 w-full border border-[#e4e4e7] bg-white pl-3 pr-8 text-sm text-[#111113] rounded-sm"
            >
              <option value="updated">Recently updated</option>
              <option value="stars">Most starred</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>

          <div className="lg:col-span-4 flex flex-wrap items-end justify-between gap-2 sm:flex-nowrap lg:justify-end">
            <div
              role="group"
              aria-label="Repository source filter"
              className="inline-flex h-10 border border-[#e4e4e7] bg-white p-0.5 rounded-sm"
            >
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'sources', label: 'Sources' },
                  { id: 'forks', label: 'Forks' },
                ] as const
              ).map((option) => {
                const active = source === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSource(option.id)}
                    aria-pressed={active}
                    className={`px-3 text-xs font-medium transition-colors rounded-sm whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#111113] text-white'
                        : 'text-[#52525b] hover:text-[#111113]'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh repositories from GitHub"
              className="inline-flex h-10 items-center gap-1.5 border border-[#e4e4e7] bg-white px-3 text-xs font-semibold text-[#111113] transition-colors hover:border-[#a3a2a5] disabled:opacity-50 rounded-sm whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{isRefreshing ? 'Syncing' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Language filter bar */}
        {languages.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#e4e4e7] pt-3">
            <span className="mr-1 text-xs font-medium text-[#52525b]">
              Language:
            </span>
            <button
              type="button"
              onClick={() => setLanguage('all')}
              aria-pressed={language === 'all'}
              className={`min-h-[32px] border px-2.5 py-1 text-xs font-medium transition-colors rounded-sm whitespace-nowrap shrink-0 ${
                language === 'all'
                  ? 'border-[#111113] bg-[#111113] text-white'
                  : 'border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#a3a2a5] hover:text-[#111113]'
              }`}
            >
              All ({repos.length})
            </button>
            {languages.map((item) => {
              const active = language === item.language;
              return (
                <button
                  key={item.language}
                  type="button"
                  onClick={() => setLanguage(item.language)}
                  aria-pressed={active}
                  className={`min-h-[32px] border px-2.5 py-1 text-xs font-medium transition-colors rounded-sm whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-[#ea580c] bg-[#ea580c] text-white'
                      : 'border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#a3a2a5] hover:text-[#111113]'
                  }`}
                >
                  {item.language} ({item.count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Status / Error banner */}
      <DataStatusBanner
        status={result.status}
        errorMessage={result.errorMessage}
        rateLimit={result.rateLimit}
        onRetry={handleRefresh}
        retrying={isRefreshing}
      />

      {/* Result metadata row */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#52525b]">
        <p className="font-mono tabular-nums" data-testid="repo-count-summary">
          Showing {filteredRepos.length} of {repos.length} public repositories
        </p>
        <p className="font-mono tabular-nums">
          Synced {formatUtcDateTime(result.fetchedAt)}
        </p>
      </div>

      {/* Loading skeleton */}
      {isRefreshing ? (
        <div
          aria-busy="true"
          aria-label="Refreshing repositories"
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {[0, 1, 2, 3].map((slot) => (
            <div
              key={slot}
              className="h-36 animate-pulse border border-[#e4e4e7] bg-[#f7f7f8] p-4 rounded-sm"
            />
          ))}
        </div>
      ) : result.status !== 'ok' && repos.length === 0 ? (
        <div className="border border-[#e4e4e7] bg-white p-6 text-sm text-[#52525b] rounded-sm">
          Repository list could not be loaded from GitHub. Use the retry action
          above once network access or the GitHub API rate-limit window is
          available.
        </div>
      ) : repos.length === 0 ? (
        <div className="border border-[#e4e4e7] bg-white p-6 text-sm text-[#52525b] rounded-sm">
          This GitHub account currently has 0 public repositories.
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border border-[#e4e4e7] bg-[#f7f7f8] p-6 rounded-sm">
          <p className="text-sm font-semibold text-[#111113]">
            No repositories match the current filters.
          </p>
          <p className="text-xs text-[#52525b]">
            Adjust the search query, language, or source filter to view public
            repositories.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex min-h-[40px] items-center border border-[#111113] bg-white px-4 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-[#111113] hover:text-white rounded-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div
          data-testid="repositories-grid"
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          {filteredRepos.map((repo) => (
            <RepoRow key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
