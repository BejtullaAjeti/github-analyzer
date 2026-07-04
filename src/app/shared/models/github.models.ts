export interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
  blog: string | null;
  company: string | null;
  created_at: string;
}

export interface Repository {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
}

export interface ReposResponse {
  top_repos: Repository[];
  languages: Record<string, number>;
}

export interface ActivityPoint {
  date: string;
  count: number;
}

export interface RepoDetail {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  pushed_at: string;
  created_at: string;
}

export interface RepoHealth {
  last_commit_at: string;
  open_issues: number;
  stars: number;
  watchers: number;
  stars_trend_note: string;
}

export interface CommitFrequencyPoint {
  week_start: string;
  count: number;
}

export interface ContributorSummary {
  login: string;
  avatar_url: string;
  contributions: number;
}

export type RepoLanguages = Record<string, number>;

export interface ApiError {
  error: string;
}
