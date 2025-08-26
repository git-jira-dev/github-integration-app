import ForgeReconciler, { Button, Spinner, Stack } from "@forge/react";
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { PullRequests } from "../app-settings/pull-requests";

function resolvePrStatus(pr) {
  if (pr.state === "open") {
    return "OPEN";
  }
  if (pr.state === "closed" && !pr.merged_at) {
    return "DECLINED";
  }
  if (pr.state === "closed" && pr.merged_at) {
    return "MERGED";
  }
  return "UNKNOWN";
}

function mapPrs(prs) {
  return prs.map((pr) => ({
    id: pr.id,
    name: pr.title,
    status: resolvePrStatus(pr),
    updatedAt: pr.updated_at,
  }));
}

const GitHubPanel = () => {
  const [tokenExists, setTokenExists] = useState(undefined);
  const [prs, setPrs] = useState(undefined);
  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
    invoke("getPrsForTicket").then((res) => setPrs(mapPrs(res.prs)));
  }, []);
  if (tokenExists === undefined || prs === undefined) return <Spinner />;

  return (
    <Stack>
      <Button appearance="subtle" isDisabled={prs.length === 0}>
        <PullRequests prs={prs} />
      </Button>
    </Stack>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <GitHubPanel />
  </React.StrictMode>,
);
