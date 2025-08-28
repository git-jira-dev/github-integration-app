import { kvs } from "@forge/kvs";
import { GitHubApi } from "../api/github-api";

const INSTALL_CONTEXT_NOT_FOUND =
  "Installation context is required but missing";
const ISSUE_KEY_NOT_FOUND = "Issue key is required but missing";
const TOKEN_NOT_FOUND = "Token not found";
const GITHUB_TOKEN_KEY_PREFIX = "github:token:";
const GITHUB_BASE_URL = "https://api.github.com";

export const buildGithubKeyFromInstallContext = (installContext) =>
  GITHUB_TOKEN_KEY_PREFIX + installContext.replace(/\//g, "-");

export async function loadToken({ context }) {
  if (!context?.installContext) {
    console.error(INSTALL_CONTEXT_NOT_FOUND);
    return { success: false, message: INSTALL_CONTEXT_NOT_FOUND };
  }

  const key = buildGithubKeyFromInstallContext(context.installContext);

  try {
    const token = await kvs.getSecret(key);
    if (!token) {
      return { success: false, message: TOKEN_NOT_FOUND };
    }
    return { success: true, key, token };
  } catch (error) {
    console.error("Error loading GitHub key:", error);
    return {
      success: false,
      message: `Failed to load GitHub key`,
    };
  }
}

export async function tokenExists(req) {
  const token = loadToken(req);
  return !!token;
}

export const saveToken = async (req) => {
  try {
    const { githubKey } = req.payload;

    if (!githubKey) {
      console.error("No githubKey provided in payload");
      return { success: false, message: "No GitHub key provided" };
    }

    const installContext = req.context.installContext;
    if (!installContext) {
      console.error(INSTALL_CONTEXT_NOT_FOUND);
      return {
        success: false,
        message: INSTALL_CONTEXT_NOT_FOUND,
      };
    }

    const uniqueKey = buildGithubKeyFromInstallContext(installContext);
    await kvs.setSecret(uniqueKey, githubKey);

    return {
      success: true,
      message: "GitHub key saved successfully",
      key: uniqueKey,
    };
  } catch (error) {
    console.error("Error saving GitHub key:", error);
    return {
      success: false,
      message: `Failed to save GitHub key`,
    };
  }
};

export const findReviewersForPr = async (req) => {
  const tokenResponse = await loadToken(req);
  if (!tokenResponse.success) {
    return tokenResponse;
  }
  const { id, full_name } = req.payload;
  const api = new GitHubApi(GITHUB_BASE_URL, tokenResponse.token);
  const response = await api.fetchPrReviewers(id, full_name);
  if (!response.ok) {
    console.error("Failed to fetch reviewers", response);
    return {
      success: false,
    };
  }
  const reviewers = await response.json();
  return {
    success: true,
    reviewers,
  };
};

export const findPrsForIssue = async (req) => {
  const issueKey = req.context.extension.issue.key;
  if (!issueKey) {
    console.error(ISSUE_KEY_NOT_FOUND);
    return {
      success: false,
      message: `Failed to get issue key`,
    };
  }
  const tokenResponse = await loadToken(req);
  if (!tokenResponse.success) {
    return tokenResponse;
  }
  const api = new GitHubApi(GITHUB_BASE_URL, tokenResponse.token);
  const repos = await api.fetchAllRepositories();
  const prs = await Promise.all(
    repos.map((repo) =>
      api.fetchPrsForRepo(repo.owner.login, repo.name, "all"),
    ),
  );
  const filtered = prs.flat().filter((pr) => pr.title.includes(issueKey));
  return {
    success: true,
    message: `PR received successfully successfully`,
    prs: filtered,
  };
};
