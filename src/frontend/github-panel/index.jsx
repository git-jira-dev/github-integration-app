import ForgeReconciler, { Button, Spinner, Stack } from "@forge/react";
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { PullRequests } from "./pull-requests";
import PullRequestsModal from "./pull-requests-modal";

function mapPrs(prs) {
  return prs.map((pr) => ({
    id: `${pr.number}`,
    title: pr.title,
    link: pr.html_url,
    user: pr.user,
    repository: pr.head.repo,
    state: pr.state,
    mergedAt: pr.merged_at,
    updatedAt: pr.updated_at,
  }));
}

const GitHubPanel = () => {
  const [tokenExists, setTokenExists] = useState(undefined);
  const [prs, setPrs] = useState(undefined);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
    invoke("getPrsForTicket").then((res) => setPrs(mapPrs(res.prs)));
  }, []);
  if (tokenExists === undefined || prs === undefined) return <Spinner />;

  return (
    <>
      <Stack>
        <Button
          appearance="subtle"
          onClick={() => setModalIsOpen(true)}
          isDisabled={prs.length === 0}
        >
          <PullRequests prs={prs} />
        </Button>
      </Stack>
      <PullRequestsModal
        prs={prs}
        modalIsOpen={modalIsOpen}
        closeModal={() => setModalIsOpen(false)}
      />
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <GitHubPanel />
  </React.StrictMode>,
);
