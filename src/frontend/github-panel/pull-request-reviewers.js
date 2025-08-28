import { Box, Inline, Lozenge, Spinner, Tooltip } from "@forge/react";
import React, { useEffect, useState } from "react";
import Avatar from "./avatar";
import { invoke } from "@forge/bridge";

// APPROVED, CHANGES_REQUESTED, COMMENTED, DISMISSED, PENDING.
const stateMap = {
  APPROVED: "success",
  CHANGES_REQUESTED: "moved",
  PENDING: "new",
  DISMISSED: "removed",
};

function mapAppearance(status) {
  return stateMap[status] ?? "default";
}

const PullRequestReviewer = ({ avatar, status, username }) => (
  <Tooltip content={username}>
    <Box
      xcss={{
        backgroundColor: "elevation.surface",
        boxShadow: "elevation.shadow.raised",
        padding: "space.050",
        minWidth: "110px",
        borderRadius: "border.radius",
      }}
    >
      <Inline space="space.050" alignBlock="center">
        <Avatar src={avatar} />
        <Lozenge appearance={mapAppearance(status)}>{status}</Lozenge>
      </Inline>
    </Box>
  </Tooltip>
);

const PullRequestReviewers = ({ pr }) => {
  const [reviewers, setReviewers] = useState(undefined);

  useEffect(() => {
    invoke("getPrReviewers", {
      id: pr.id,
      full_name: pr.repository.full_name,
    }).then((res) => {
      if (res.success) {
        setReviewers(res.reviewers);
      }
    });
  }, [pr]);

  if (!reviewers) {
    return <Spinner />;
  }

  return (
    <Inline space="space.050" shouldWrap>
      {reviewers.map(({ id, user, state }) => (
        <PullRequestReviewer
          key={id}
          avatar={user.avatar_url}
          status={state}
          username={user.login}
        />
      ))}
    </Inline>
  );
};

export default PullRequestReviewers;
