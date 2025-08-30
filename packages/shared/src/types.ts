import { Endpoints } from '@octokit/types';

// Resolver Types
export interface ResolverResponse<T> {
  data?: T;
  error?: {
    message: string;
  };
}

// GitHub Webhook Event Types
export type { WebhookEvent, PullRequestEvent } from '@octokit/webhooks-types';

// GitHub API Response Types
export type AuthenticatedUserResponse
    = Endpoints['GET /user']['response']['data'];
export type PullRequestReview
    = Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews']['response']['data'][0];
export type ReviewState = PullRequestReview['state'];
export type Repo = Endpoints['GET /user/repos']['response']['data'][0];
export type PullRequest
    = Endpoints['GET /repos/{owner}/{repo}/pulls']['response']['data'][0];

// Forge Trigger Payload Types
export interface ForgeWebTriggerPayload {
  method: string;
  path: string;
  headers: Record<string, string[]>;
  queryParameters: Record<string, string[]>;
  body?: string;
}
export interface JiraIssueContext {
  cloudId: string;
  extension: {
    type: 'jira:issueContext';
    issue: {
      id: string;
      type: string;
      key: string;
      typeId: string;
    };
    project: {
      id: string;
      type: string;
      key: string;
    };
  };
}

// Jira API Response Types
interface JiraStatusCategory {
  id: number;
  key: string;
  name: string;
}
interface JiraStatus {
  id: string;
  name: string;
  statusCategory: JiraStatusCategory;
}
export interface JiraTransition {
  id: string;
  name: string;
  to: JiraStatus;
}
export interface JiraTransitionsResponse {
  expand?: string;
  transitions: JiraTransition[];
}
