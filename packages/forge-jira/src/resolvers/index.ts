import Resolver from '@forge/resolver';
import StorageService from '../services/storage-service';
import { githubService } from '../services/github-service';
import { GITHUB_TOKEN_IS_NOT_CONFIGURED, JiraIssueContext, ResolverResponse } from '@app/shared';
import { webTrigger } from '@forge/api';

const resolver = new Resolver();

const wrapInResolverResponse = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<ResolverResponse<T extends void ? undefined : T>> => {
  try {
    const result = await operation();
    const data = result as T extends void ? undefined : T;
    return {
      data,
    };
  } catch (error) {
    console.error(errorMessage.concat(':'), error);
    return {
      error: {
        message: errorMessage,
      },
    };
  }
};

const wrapInResolverResponseWithGithubTokenCheck = async <T>(
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<ResolverResponse<T extends void ? undefined : T>> => {
  const tokenExists = await StorageService.tokenExists();
  if (!tokenExists) {
    return {
      error: {
        message: GITHUB_TOKEN_IS_NOT_CONFIGURED,
      },
    };
  }
  return await wrapInResolverResponse(operation, errorMessage);
};

resolver.define('saveGitHubToken', async ({ payload }: { payload: { token?: string } }): Promise<ResolverResponse<undefined>> => {
  const token = payload.token;
  if (!token) {
    console.error('No github token provided in payload');
    return {
      error: {
        message: 'No github token provided',
      },
    };
  }

  const tokenIsValid = await githubService.tokenIsValid(token);
  if (!tokenIsValid) {
    return {
      error: {
        message: 'Invalid GitHub token',
      },
    };
  }

  return await wrapInResolverResponse(() => StorageService.saveToken(token), 'Failed to save GitHub token');
});

resolver.define('gitHubTokenExists', async (): Promise<ResolverResponse<boolean>> =>
  await wrapInResolverResponse(() => StorageService.tokenExists(), 'Error checking if GitHub token exists'));

resolver.define('getPrsForTicket', async (req) => {
  const context = req.context as JiraIssueContext;
  const issueKey = context.extension.issue.key;
  return await wrapInResolverResponseWithGithubTokenCheck(() => githubService.fetchPrForTicket(issueKey), `Failed to fetch PRs for issue key: ${issueKey}`);
});

resolver.define('getPrReviewers', async (req) => {
  const { id, full_name } = req.payload as { id: string; full_name: string };
  return await wrapInResolverResponseWithGithubTokenCheck(() => githubService.fetchPrReviewers(id, full_name), `Failed to fetch PR reviewers for PR id: ${id}`);
});

resolver.define('getWebTriggerUrl', async () =>
  await webTrigger.getUrl('github-pr-trigger'));

export const handler = resolver.getDefinitions();
