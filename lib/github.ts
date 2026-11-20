import { siteConfig } from '@/config/site';
import {
  classifyGitHubError,
  parseRateLimitHeaders,
  summarizePublicEventPayload,
} from './github-logic';
import type {
  GitHubPublicEvent,
  GitHubRepo,
  GitHubResult,
  GitHubUserProfile,
  RateLimitInfo,
} from './github-types';

const GITHUB_API_BASE = 'https://api.github.com';
const REVALIDATE_SECONDS = 300;

function buildGitHubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'critical-dummy-personal-website',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Strictly server-side token usage (never NEXT_PUBLIC_)
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

const emptyRateLimit: RateLimitInfo = {
  limit: null,
  remaining: null,
  resetAt: null,
};

async function fetchGitHubJson<T>(
  path: string,
  options?: { bypassCache?: boolean }
): Promise<GitHubResult<T>> {
  const fetchedAt = new Date().toISOString();

  try {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      headers: buildGitHubHeaders(),
      ...(options?.bypassCache
        ? { cache: 'no-store' as const }
        : { next: { revalidate: REVALIDATE_SECONDS } }),
      signal: AbortSignal.timeout(8000),
    });

    const rateLimit = parseRateLimitHeaders(response.headers);

    if (!response.ok) {
      const classified = classifyGitHubError(response.status, rateLimit);
      return {
        status: classified.fetchStatus,
        data: null,
        rateLimit,
        errorMessage: classified.message,
        fetchedAt,
      };
    }

    const json = (await response.json()) as T;
    return {
      status: 'ok',
      data: json,
      rateLimit,
      errorMessage: null,
      fetchedAt,
    };
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'TimeoutError'
        ? 'GitHub API request timed out.'
        : 'Unable to reach the GitHub API right now.';

    return {
      status: 'error',
      data: null,
      rateLimit: emptyRateLimit,
      errorMessage: message,
      fetchedAt,
    };
  }
}

export async function getGitHubProfile(
  username = siteConfig.identity.githubUsername,
  options?: { bypassCache?: boolean }
): Promise<GitHubResult<GitHubUserProfile>> {
  const res = await fetchGitHubJson<Record<string, unknown>>(
    `/users/${encodeURIComponent(username)}`,
    options
  );

  if (res.status !== 'ok' || !res.data) {
    return {
      status: res.status,
      data: null,
      rateLimit: res.rateLimit,
      errorMessage: res.errorMessage,
      fetchedAt: res.fetchedAt,
    };
  }

  const raw = res.data;
  const profile: GitHubUserProfile = {
    login: String(raw.login ?? username),
    name: typeof raw.name === 'string' ? raw.name : null,
    avatarUrl:
      typeof raw.avatar_url === 'string'
        ? raw.avatar_url
        : `https://avatars.githubusercontent.com/${encodeURIComponent(username)}`,
    htmlUrl:
      typeof raw.html_url === 'string'
        ? raw.html_url
        : `https://github.com/${encodeURIComponent(username)}`,
    bio: typeof raw.bio === 'string' && raw.bio.trim() ? raw.bio : null,
    blog: typeof raw.blog === 'string' && raw.blog.trim() ? raw.blog : null,
    location:
      typeof raw.location === 'string' && raw.location.trim()
        ? raw.location
        : null,
    company:
      typeof raw.company === 'string' && raw.company.trim()
        ? raw.company
        : null,
    publicRepos: typeof raw.public_repos === 'number' ? raw.public_repos : 0,
    publicGists: typeof raw.public_gists === 'number' ? raw.public_gists : 0,
    followers: typeof raw.followers === 'number' ? raw.followers : 0,
    following: typeof raw.following === 'number' ? raw.following : 0,
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : '',
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : '',
  };

  return {
    status: 'ok',
    data: profile,
    rateLimit: res.rateLimit,
    errorMessage: null,
    fetchedAt: res.fetchedAt,
  };
}

export async function getGitHubRepos(
  username = siteConfig.identity.githubUsername,
  options?: { bypassCache?: boolean }
): Promise<GitHubResult<GitHubRepo[]>> {
  const res = await fetchGitHubJson<Array<Record<string, unknown>>>(
    `/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
    options
  );

  if (res.status !== 'ok' || !Array.isArray(res.data)) {
    return {
      status: res.status,
      data: null,
      rateLimit: res.rateLimit,
      errorMessage: res.errorMessage,
      fetchedAt: res.fetchedAt,
    };
  }

  const repos: GitHubRepo[] = res.data.map((raw) => ({
    id: typeof raw.id === 'number' ? raw.id : 0,
    name: typeof raw.name === 'string' ? raw.name : 'unnamed-repository',
    fullName: typeof raw.full_name === 'string' ? raw.full_name : '',
    description:
      typeof raw.description === 'string' && raw.description.trim()
        ? raw.description
        : null,
    htmlUrl: typeof raw.html_url === 'string' ? raw.html_url : '',
    homepage:
      typeof raw.homepage === 'string' && raw.homepage.trim()
        ? raw.homepage
        : null,
    language:
      typeof raw.language === 'string' && raw.language.trim()
        ? raw.language
        : null,
    stargazersCount:
      typeof raw.stargazers_count === 'number' ? raw.stargazers_count : 0,
    forksCount: typeof raw.forks_count === 'number' ? raw.forks_count : 0,
    openIssuesCount:
      typeof raw.open_issues_count === 'number' ? raw.open_issues_count : 0,
    fork: Boolean(raw.fork),
    archived: Boolean(raw.archived),
    topics: Array.isArray(raw.topics)
      ? raw.topics.filter((t): t is string => typeof t === 'string')
      : [],
    defaultBranch:
      typeof raw.default_branch === 'string' ? raw.default_branch : 'main',
    createdAt: typeof raw.created_at === 'string' ? raw.created_at : '',
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : '',
    pushedAt: typeof raw.pushed_at === 'string' ? raw.pushed_at : null,
  }));

  return {
    status: 'ok',
    data: repos,
    rateLimit: res.rateLimit,
    errorMessage: null,
    fetchedAt: res.fetchedAt,
  };
}

export async function getGitHubPublicEvents(
  username = siteConfig.identity.githubUsername,
  options?: { bypassCache?: boolean }
): Promise<GitHubResult<GitHubPublicEvent[]>> {
  const res = await fetchGitHubJson<Array<Record<string, unknown>>>(
    `/users/${encodeURIComponent(username)}/events/public?per_page=100`,
    options
  );

  if (res.status !== 'ok' || !Array.isArray(res.data)) {
    return {
      status: res.status,
      data: null,
      rateLimit: res.rateLimit,
      errorMessage: res.errorMessage,
      fetchedAt: res.fetchedAt,
    };
  }

  const events: GitHubPublicEvent[] = res.data.map((raw) => {
    const type = typeof raw.type === 'string' ? raw.type : 'Event';
    const repoObj =
      raw.repo && typeof raw.repo === 'object'
        ? (raw.repo as Record<string, unknown>)
        : {};
    const repoName =
      typeof repoObj.name === 'string' ? repoObj.name : 'unknown/repository';
    const payload =
      raw.payload && typeof raw.payload === 'object'
        ? (raw.payload as Record<string, unknown>)
        : undefined;
    const parsed = summarizePublicEventPayload(type, payload);

    return {
      id: typeof raw.id === 'string' ? raw.id : String(Math.random()),
      type,
      repoName,
      repoUrl: `https://github.com/${repoName}`,
      createdAt: typeof raw.created_at === 'string' ? raw.created_at : '',
      summary: parsed.summary,
      ref: parsed.ref,
      commitCount: parsed.commitCount,
    };
  });

  return {
    status: 'ok',
    data: events,
    rateLimit: res.rateLimit,
    errorMessage: null,
    fetchedAt: res.fetchedAt,
  };
}
