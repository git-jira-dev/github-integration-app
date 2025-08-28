import Resolver from "@forge/resolver";
import { webTrigger } from "@forge/api";
import StorageService from "../services/storage-service";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", async () => {
  return StorageService.tokenExists();
});

resolver.define("saveGitHubToken", async (req) => {
  const { token } = req.payload;
  if (!token) {
    console.error("No github token provided in payload");
    return { success: false, message: "No GitHub token provided" };
  }
  try {
    await StorageService.saveToken(token);
    return {
      success: true,
      message: "GitHub key saved successfully",
    };
  } catch (error) {
    console.error("Failed to save GitHub key:", error);
    return {
      success: false,
      message: "Failed to save GitHub key",
    };
  }
});
resolver.define("getWebTriggerUrl", () =>
  webTrigger.getUrl("github-pr-trigger"),
);

export const appSettingsHandler = resolver.getDefinitions();
