import ForgeReconciler, {
  Button,
  SectionMessage,
  Spinner,
  Stack,
  Text,
} from "@forge/react";
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";
import { PullRequests } from "../settings/components/pull-requests";
import PullRequestsModal from "../settings/components/pull-requests-modal";

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
  }, []);

  useEffect(() => {
    if (tokenExists) {
      invoke("getPrsForTicket").then((res) => {
        if (res.success) {
          setPrs(mapPrs(res.prs));
        }
      });
    }
  }, [tokenExists]);

  if (tokenExists === false) {
    return (
      <SectionMessage appearance="error">
        <Text>
          No token specified. Please navigate to App Settings and enter your
          token.
        </Text>
      </SectionMessage>
    );
  }

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
