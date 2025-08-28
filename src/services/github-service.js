import { fetch } from "@forge/api";
import StorageService from "./storage-service";
import { GITHUB_BASE_URL } from "../../common/constants";

class GitHubService {
  async findPrsForIssue(issueKey) {
    const repos = await this.fetchAllRepositories();
    const prs = await Promise.all(
      repos.map((repo) =>
        this.fetchPrsForRepo(repo.owner.login, repo.name, "all"),
      ),
    );
    return prs.flat().filter((pr) => pr.title.includes(issueKey));
  }

  fetchPrsForRepo(owner, repo, state = "open") {
    return this.getPaginatedData(`/repos/${owner}/${repo}/pulls`, { state });
  }

  fetchPrReviewers(id, full_repo_name) {
    console.log({ id, full_repo_name });
    return this.baseRequest({
      path: `/repos/${full_repo_name}/pulls/${id}/reviews`,
    });
  }

  fetchAllRepositories() {
    return this.getPaginatedData("/user/repos");
  }

  fetchUserInfo() {
    return this.baseRequest({ path: "/user" });
  }

  async getPaginatedData(path, params) {
    const nextPattern = /(?<=<)([\S]*)(?=>; rel="Next")/i;
    let pagesRemaining = true;
    let data = [];
    while (pagesRemaining) {
      const response = await this.baseRequest({
        path: `${path}`,
        params: {
          per_page: 100,
          ...params,
        },
      });
      const parsedData = this.parseData(response);
      data = [...data, ...parsedData];
      const linkHeader = response.headers?.link;
      pagesRemaining = linkHeader && linkHeader.includes(`rel="next"`);

      if (pagesRemaining) {
        path = linkHeader.match(nextPattern)[0];
      }
    }
    return data;
  }

  parseData(data) {
    if (Array.isArray(data)) {
      return data;
    }
    return data ?? [];
  }

  buildPath = (path, extraParams = {}) => {
    const isAbsolute = /^https?:\/\//i.test(path);
    const url = new URL(path, GITHUB_BASE_URL);

    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
    return isAbsolute ? url.toString() : url.pathname + url.search;
  };

  async baseRequest({ path, method = "GET", headers = {}, params = {} }) {
    const token = await StorageService.loadToken();
    const pathWithParams = this.buildPath(path, params);
    const response = await fetch(GITHUB_BASE_URL + pathWithParams, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...headers,
      },
    });
    return response.json();
  }
}

export default new GitHubService();
