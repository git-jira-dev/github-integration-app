import { findPrsForIssue, findReviewersForPr, tokenExists } from "./github";
import Resolver from "@forge/resolver";

const resolver = new Resolver();

resolver.define("gitHubTokenExists", tokenExists);
resolver.define("getPrsForTicket", findPrsForIssue);
resolver.define("getPrReviewers", findReviewersForPr);

export const gitHubPanelHandler = resolver.getDefinitions();
