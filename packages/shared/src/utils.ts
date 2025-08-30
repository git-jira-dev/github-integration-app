import type { FullContext } from '@forge/bridge/out/types';

export function extractAppIdAndEnvFromContext(context?: FullContext) {
  const m = context?.localId.match(/extension\/([^/]+)\/([^/]+)/);
  const appId = m?.[1];
  const envId = m?.[2];
  return { appId, envId };
}
