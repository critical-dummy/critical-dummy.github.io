'use client';

import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import type { FetchStatus, RateLimitInfo } from '@/lib/github-types';
import { formatUtcDateTime } from '@/lib/github-logic';

interface DataStatusBannerProps {
  status: FetchStatus;
  errorMessage: string | null;
  rateLimit?: RateLimitInfo;
  onRetry?: () => void;
  retrying?: boolean;
}

export function DataStatusBanner({
  status,
  errorMessage,
  rateLimit,
  onRetry,
  retrying = false,
}: DataStatusBannerProps) {
  if (status === 'ok') {
    return null;
  }

  const isRateLimit = status === 'rate_limited';

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3 border border-[#a3a2a5] bg-[#f7f7f8] p-4 sm:flex-row sm:items-center sm:justify-between rounded-sm"
    >
      <div className="flex items-start gap-3">
        {isRateLimit ? (
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#ea580c]"
            aria-hidden="true"
          />
        ) : (
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-[#111113]"
            aria-hidden="true"
          />
        )}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#111113]">
            {isRateLimit
              ? 'GitHub API rate limit reached'
              : status === 'not_found'
                ? 'GitHub resource unavailable'
                : 'GitHub data temporarily unavailable'}
          </p>
          <p className="text-xs text-[#52525b]">
            {errorMessage ??
              'Could not load live data from GitHub. Unavailable data is not replaced with simulated entries.'}
          </p>
          {rateLimit && rateLimit.resetAt && (
            <p className="font-mono text-xs text-[#52525b] tabular-nums">
              Limit window resets: {formatUtcDateTime(rateLimit.resetAt)}
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex min-h-[40px] items-center gap-2 self-start border border-[#111113] bg-white px-3.5 py-2 text-xs font-semibold text-[#111113] transition-colors hover:bg-[#111113] hover:text-white disabled:opacity-50 sm:self-center rounded-sm whitespace-nowrap shrink-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>{retrying ? 'Retrying...' : 'Retry fetch'}</span>
        </button>
      )}
    </div>
  );
}
