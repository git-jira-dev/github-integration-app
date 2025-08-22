import { tokenExists } from "./github";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", tokenExists);

export const gitHubPanelHandler = resolver.getDefinitions();
