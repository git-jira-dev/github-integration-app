import Resolver from "@forge/resolver";
import { saveToken, tokenExists } from "./github";
import { webTrigger } from "@forge/api";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", tokenExists);
resolver.define("saveGitHubToken", saveToken);
resolver.define("getWebTriggerUrl", () =>
  webTrigger.getUrl("github-pr-trigger"),
);

export const appSettingsHandler = resolver.getDefinitions();
