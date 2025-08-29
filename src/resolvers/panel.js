import Resolver from "@forge/resolver";
import StorageService from "../services/storage-service";
import GithubService from "../services/github-service";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", async () => {
  return StorageService.tokenExists();
});

resolver.define("getPrsForTicket", async (req) => {
  try {
    const issueKey = req.context.extension.issue.key;
    if (!issueKey) {
      console.error("No ticket key provided in payload");
      return { success: false, message: "No GitHub key provided" };
    }
    const prs = await GithubService.findPrsForIssue(issueKey);
    return {
      success: true,
      message: `Pull requests found successfully`,
      prs,
    };
  } catch (e) {
    console.error("Can't found pull requests", e);
    return {
      success: false,
      message: "Can't found pull requests",
    };
  }
});

resolver.define("getPrReviewers", async (req) => {
  try {
    const { id, full_name } = req.payload;
    const reviewers = await GithubService.fetchPrReviewers(id, full_name);
    return {
      success: true,
      reviewers,
    };
  } catch (e) {
    console.error("Can't found reviewers", e);
    return {
      success: false,
      message: "Can't found reviewers",
    };
  }
});

export const gitHubPanelHandler = resolver.getDefinitions();
