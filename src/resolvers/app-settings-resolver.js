import Resolver from "@forge/resolver";
import { saveToken, tokenExists } from "./github";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", tokenExists);
resolver.define("saveGitHubToken", saveToken);

export const appSettingsHandler = resolver.getDefinitions();
