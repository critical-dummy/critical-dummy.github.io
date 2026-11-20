'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Info, RefreshCw } from 'lucide-react';
import {
  extractLanguages,
  formatUtcDate,
  formatUtcDateTime,
  humanizeEventType,
  summarizeActivity,
} from '@/lib/github-logic';
import type {
  GitHubPublicEvent,
  GitHubRepo,
  GitHubResult,
  GitHubUserProfile,
} from '@/lib/github-types';
import { DataStatusBanner } from './DataStatusBanner';

interface ActivityViewProps {
  initialProfile: GitHubResult<GitHubUserProfile>;
  initialRepos: GitHubResult<GitHubRepo[]>;
  initialEvents: GitHubResult<GitHubPublicEvent[]>;
}

export function ActivityView({
  initialProfile,
  initialRepos,
  initialEvents,
}: ActivityViewProps) {
  const [profileResult, setProfileResult] = useState(initialProfile);
  const [reposResult, setReposResult] = useState(initialRepos);
  const [eventsResult, setEventsResult] = useState(initialEvents);
  const [eventFilter, setEventFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const profile = profileResult.data;
  const repos = useMemo(() => reposResult.data ?? [], [reposResult.data]);
  const events = useMemo(() => eventsResult.data ?? [], [eventsResult.data]);

  const eventsAvailable = eventsResult.status === 'ok';
  const summary = useMemo(
    () => summarizeActivity(events, eventsAvailable),
    [events, eventsAvailable]
  );

  const languageStats = useMemo(() => extractLanguages(repos), [repos]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === 'all') return events;
    return events.filter((event) => event.type === eventFilter);
  }, [events, eventFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/github?section=activity&fresh=1', {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as {
        profile: GitHubResult<GitHubUserProfile>;
        repos: GitHubResult<GitHubRepo[]>;
        events: GitHubResult<GitHubPublicEvent[]>;
      };
      if (payload.profile) setProfileResult(payload.profile);
      if (payload.repos) setReposResult(payload.repos);
      if (payload.events) setEventsResult(payload.events);
    } catch {
      const now = new Date().toISOString();
      setEventsResult((prev) => ({
        status: 'error',
        data: prev.data,
        rateLimit: prev.rateLimit,
        errorMessage: 'Failed to refresh public GitHub activity.',
        fetchedAt: now,
      }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const primaryErrorResult =
    eventsResult.status !== 'ok'
      ? eventsResult
      : reposResult.status !== 'ok'
        ? reposResult
        : profileResult.status !== 'ok'
          ? profileResult
          : null;

  return (
    <div className="space-y-8">
      {/* Toolbar & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e4e4e7] pb-4">
        <div className="font-mono text-xs text-[#52525b] tabular-nums">
          Last checked: {formatUtcDateTime(eventsResult.fetchedAt)}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex min-h-[40px] items-center gap-2 border border-[#e4e4e7] bg-white px-3.5 py-2 text-xs font-semibold text-[#111113] transition-colors hover:border-[#a3a2a5] disabled:opacity-50 rounded-sm whitespace-nowrap shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{isRefreshing ? 'Syncing activity...' : 'Refresh activity'}</span>
        </button>
      </div>

      {primaryErrorResult && (
        <DataStatusBanner
          status={primaryErrorResult.status}
          errorMessage={primaryErrorResult.errorMessage}
          rateLimit={primaryErrorResult.rateLimit}
          onRetry={handleRefresh}
          retrying={isRefreshing}
        />
      )}

      {/* Honest Data Availability Overview */}
      <section
        aria-labelledby="activity-overview-heading"
        className="space-y-4"
      >
        <h2
          id="activity-overview-heading"
          className="text-base font-semibold text-[#111113]"
        >
          Public GitHub Snapshot
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-[#e4e4e7] bg-white p-4 rounded-sm">
            <p className="text-xs font-medium text-[#52525b]">
              Public repositories
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#111113] tabular-nums">
              {profileResult.status === 'ok' && profile
                ? profile.publicRepos
                : reposResult.status === 'ok'
                  ? repos.length
                  : 'Unavailable'}
            </p>
            <p className="mt-1 text-xs text-[#52525b]">
              {profileResult.status === 'ok'
                ? 'Live from /users profile'
                : 'Profile endpoint unavailable'}
            </p>
          </div>

          <div className="border border-[#e4e4e7] bg-white p-4 rounded-sm">
            <p className="text-xs font-medium text-[#52525b]">
              Recent public events (90d)
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#111113] tabular-nums">
              {eventsAvailable ? summary.totalRecentEvents : 'Unavailable'}
            </p>
            <p className="mt-1 text-xs text-[#52525b]">
              {eventsAvailable
                ? summary.totalRecentEvents === 0
                  ? 'Zero events in 90-day window'
                  : `Latest ${formatUtcDate(summary.latestEventAt)}`
                : 'Events endpoint unavailable'}
            </p>
          </div>

          <div className="border border-[#e4e4e7] bg-white p-4 rounded-sm">
            <p className="text-xs font-medium text-[#52525b]">
              365-day contribution total
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#52525b]">
              Unavailable
            </p>
            <p className="mt-1 text-xs text-[#52525b]">
              Requires authenticated GraphQL API
            </p>
          </div>

          <div className="border border-[#e4e4e7] bg-white p-4 rounded-sm">
            <p className="text-xs font-medium text-[#52525b]">
              Account created
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[#111113] tabular-nums">
              {profileResult.status === 'ok' && profile
                ? formatUtcDate(profile.createdAt)
                : 'Unavailable'}
            </p>
            <p className="mt-1 text-xs text-[#52525b]">
              {profileResult.status === 'ok' && profile
                ? `${profile.followers} follower${profile.followers === 1 ? '' : 's'} · ${profile.following} following`
                : 'Profile metadata unavailable'}
            </p>
          </div>
        </div>

        {/* Explicit distinction between unavailable data and zero activity */}
        <div className="flex items-start gap-3 border border-[#a3a2a5] bg-[#f7f7f8] p-4 rounded-sm">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]"
            aria-hidden="true"
          />
          <div className="space-y-1 text-xs leading-relaxed text-[#52525b]">
            <p className="font-semibold text-[#111113]">
              Data availability boundary
            </p>
            <p>{summary.availability.reason}</p>
          </div>
        </div>
      </section>

      {/* Repository breakdown */}
      <section
        aria-labelledby="repo-breakdown-heading"
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <div className="space-y-3 border border-[#e4e4e7] bg-white p-5 rounded-sm">
          <h2
            id="repo-breakdown-heading"
            className="text-sm font-semibold text-[#111113]"
          >
            Public Repository Languages
          </h2>
          {reposResult.status !== 'ok' && repos.length === 0 ? (
            <p className="text-xs text-[#52525b]">
              Language breakdown is unavailable while repository data cannot be
              fetched.
            </p>
          ) : languageStats.length === 0 ? (
            <p className="text-xs text-[#52525b]">
              Zero public repositories available to summarize.
            </p>
          ) : (
            <ul className="divide-y divide-[#f1f1f3]">
              {languageStats.map((stat) => (
                <li
                  key={stat.language}
                  className="flex items-center justify-between py-2 text-xs"
                >
                  <span className="font-medium text-[#111113]">
                    {stat.language}
                  </span>
                  <span className="font-mono text-[#52525b] tabular-nums">
                    {stat.count} {stat.count === 1 ? 'repo' : 'repos'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border border-[#e4e4e7] bg-white p-5 rounded-sm">
          <h2 className="text-sm font-semibold text-[#111113]">
            Repositories in Recent Public Events
          </h2>
          {!eventsAvailable ? (
            <p className="text-xs text-[#52525b]">
              Recent repository activity cannot be computed because the public
              events endpoint is unavailable.
            </p>
          ) : summary.activeRepos.length === 0 ? (
            <p className="text-xs text-[#52525b]">
              Zero public events recorded across repositories in the last 90
              days.
            </p>
          ) : (
            <ul className="divide-y divide-[#f1f1f3]">
              {summary.activeRepos.slice(0, 8).map((item) => (
                <li
                  key={item.repoName}
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs"
                >
                  <a
                    href={`https://github.com/${item.repoName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono font-medium text-[#111113] hover:text-[#ea580c]"
                  >
                    <span>{item.repoName}</span>
                    <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                  <span className="font-mono text-[#52525b] tabular-nums">
                    {item.eventCount} event{item.eventCount === 1 ? '' : 's'} ·{' '}
                    {formatUtcDate(item.latestAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Public Events Timeline */}
      <section aria-labelledby="events-log-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="events-log-heading"
            className="text-base font-semibold text-[#111113]"
          >
            Public Event Log
          </h2>

          {summary.eventTypes.length > 0 && (
            <div
              role="group"
              aria-label="Filter public events by type"
              className="flex flex-wrap items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setEventFilter('all')}
                aria-pressed={eventFilter === 'all'}
                className={`min-h-[32px] border px-2.5 py-1 text-xs font-medium transition-colors rounded-sm whitespace-nowrap shrink-0 ${
                  eventFilter === 'all'
                    ? 'border-[#111113] bg-[#111113] text-white'
                    : 'border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#a3a2a5]'
                }`}
              >
                All ({events.length})
              </button>
              {summary.eventTypes.map((et) => (
                <button
                  key={et.type}
                  type="button"
                  onClick={() => setEventFilter(et.type)}
                  aria-pressed={eventFilter === et.type}
                  className={`min-h-[32px] border px-2.5 py-1 text-xs font-medium transition-colors rounded-sm whitespace-nowrap shrink-0 ${
                    eventFilter === et.type
                      ? 'border-[#ea580c] bg-[#ea580c] text-white'
                      : 'border-[#e4e4e7] bg-white text-[#52525b] hover:border-[#a3a2a5]'
                  }`}
                >
                  {et.label} ({et.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {isRefreshing ? (
          <div aria-busy="true" className="space-y-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="h-14 animate-pulse border border-[#e4e4e7] bg-[#f7f7f8] rounded-sm"
              />
            ))}
          </div>
        ) : !eventsAvailable ? (
          <div className="border border-[#e4e4e7] bg-white p-5 text-sm text-[#52525b] rounded-sm">
            Public events could not be fetched from GitHub. This reflects an API
            fetch or rate-limit failure rather than zero activity.
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="border border-[#e4e4e7] bg-white p-5 text-sm text-[#52525b] rounded-sm">
            {events.length === 0
              ? 'GitHub returned 0 public events in the last 90 days for this account.'
              : 'No events match the selected event type filter.'}
          </div>
        ) : (
          <ul
            data-testid="public-events-list"
            className="divide-y divide-[#e4e4e7] border border-[#e4e4e7] bg-white rounded-sm"
          >
            {filteredEvents.slice(0, 40).map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2 text-xs">
                    <span className="font-semibold text-[#ea580c]">
                      {humanizeEventType(event.type)}
                    </span>
                    <span aria-hidden="true" className="text-[#a3a2a5]">
                      ·
                    </span>
                    <a
                      href={event.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono font-medium text-[#111113] hover:underline break-all"
                    >
                      {event.repoName}
                    </a>
                  </div>
                  <p className="text-sm text-[#52525b]">{event.summary}</p>
                </div>

                <span className="font-mono text-xs text-[#52525b] tabular-nums shrink-0">
                  {formatUtcDateTime(event.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
