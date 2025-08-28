import { fetch } from "@forge/api";

export class GitHubApi {
  constructor(url, token) {
    this.url = url;
    this.token = token;
  }

  async fetchPrReviewers(id, full_repo_name) {
    return this.baseRequest({
      path: `/repos/${full_repo_name}/pulls/${id}/reviews`,
    });
  }

  fetchPrsForRepo(owner, repo, state = "open") {
    return this.getPaginatedData(`/repos/${owner}/${repo}/pulls`, { state });
  }

  fetchAllRepositories() {
    return this.getPaginatedData("/user/repos");
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
      const json = await response.json();
      const parsedData = this.parseData(json);
      data = [...data, ...parsedData];
      const linkHeader = response.headers.link;
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
    // Some endpoints respond with 204 No Content instead of empty array
    //   when there is no data. In that case, return an empty array.
    if (!data) {
      return [];
    }
    return data;
  }

  buildPath(path, extraParams = {}) {
    const isAbsolute = /^https?:\/\//i.test(path);
    const url = new URL(path, this.url);

    for (const [k, v] of Object.entries(extraParams)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
    return isAbsolute ? url.toString() : url.pathname + url.search;
  }

  baseRequest({ path, method = "GET", headers = {}, params = {} }) {
    const pathWithParams = this.buildPath(path, params);
    return fetch(this.url + pathWithParams, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${this.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...headers,
      },
    });
  }
}
