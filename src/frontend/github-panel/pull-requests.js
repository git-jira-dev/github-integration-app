import { Box, Inline, Text } from "@forge/react";
import React from "react";
import { PullRequestStatus } from "./pull-request-status";

export const PullRequests = ({ prs }) => {
  const latest = prs?.reduce(
    (a, b) => (new Date(a?.updatedAt) > new Date(b?.updatedAt) ? a : b),
    undefined,
  );
  return (
    <>
      <Inline space="space.100">
        <Box>
          <Text weight="bold">{prs.length}</Text>
        </Box>
        <Box>
          <Text>Pull requests</Text>
        </Box>
        {latest && (
          <Box>
            <PullRequestStatus pr={latest} />
          </Box>
        )}
      </Inline>
    </>
  );
};
