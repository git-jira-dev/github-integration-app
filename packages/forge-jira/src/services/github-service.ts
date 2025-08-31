import StorageService from './storage-service';
import { GITHUB_BASE_URL } from '../constants';
import { AuthenticatedUserResponse, PullRequest, PullRequestReview, Repo } from '@app/shared';

interface BaseRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: unknown;
}

class GithubService {
  async tokenIsValid(token: string): Promise<boolean> {
    try {
      await this.baseRequestWith<AuthenticatedUserResponse>({ path: '/user', headers: {
        Authorization: `Bearer ${token}`,
      } });
      return true;
    } catch (error) {
      console.error('GitHub token validation failed:', error);
      return false;
    }
  }

  async fetchAllRepositories() {
    return this.getPaginatedData<Repo>({ path: '/user/repos' });
  }

  async fetchPrsForRepo(owner: string, repo: string, state = 'all') {
    return this.getPaginatedData<PullRequest>({ path: `/repos/${owner}/${repo}/pulls`, params: { state } });
  }

  async fetchPrForTicket(ticketKey: string) {
    const repositories = await this.fetchAllRepositories();
    const prs = await Promise.all(
      repositories.map(repo => this.fetchPrsForRepo(repo.owner.login, repo.name, 'all')),
    );
    return prs.flat().filter(pr => pr.title.includes(ticketKey));
  }

  async fetchPrReviewers(id: string, full_repo_name: string) {
    return this.getPaginatedData<PullRequestReview>({ path: `/repos/${full_repo_name}/pulls/${id}/reviews` });
  }

  async getPaginatedData<T>(options: BaseRequestOptions) {
    const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
    let pagesRemaining = true;
    let data: T[] = [];
    while (pagesRemaining) {
      const response = await this.baseRequest({
        ...options,
        params: { ...options.params, per_page: '100' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API error: ${response.status.toString()} ${response.statusText} - ${errorText}`);
      }
      const page = await response.json() as T[];
      data = [...data, ...page];
      const linkHeader = response.headers.get('Link');
      pagesRemaining = linkHeader?.includes(`rel="next"`) ?? false;
      if (pagesRemaining && linkHeader !== null) {
        const nextMatch = nextPattern.exec(linkHeader);
        if (nextMatch?.[0]) {
          options.path = nextMatch[0];
        }
      }
    }
    return data;
  }

  async baseRequestWith<T>(options: BaseRequestOptions) {
    const response = await this.baseRequest(options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status.toString()} ${response.statusText} - ${errorText}`);
    }

    return (await response.json()) as T;
  }

  async baseRequest({ method, path, params, headers }: BaseRequestOptions) {
    const url = this.buildUrl(path, params);
    const token = await this.getGitHubToken();
    return await fetch(url, {
      method: method ?? 'GET',
      headers: {
        'Authorization': `Bearer ${token ?? ''}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  buildUrl(path: string, params?: Record<string, string>) {
    const url = new URL(path, GITHUB_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    return url.toString();
  }

  async getGitHubToken() {
    return await StorageService.loadToken();
  }
}

export const githubService = new GithubService();
