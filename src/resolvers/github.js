import { kvs } from "@forge/kvs";

const INSTALL_CONTEXT_NOT_FOUND =
  "Installation context is required but missing";
const TOKEN_NOT_FOUND = "Token not found";
const GITHUB_TOKEN_KEY_PREFIX = "github:token:";

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
