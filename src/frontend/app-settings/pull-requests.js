import { Box, Inline, Lozenge, Text } from "@forge/react";
import React from "react";

const statusMap = {
  OPEN: "inprogress",
  MERGED: "success",
  DECLINED: "removed",
};

function mapStatus(status) {
  return statusMap[status] ?? "default";
}

export const PullRequests = ({ prs }) => {
  const latest = prs?.reduce(
    (a, b) => (new Date(a?.updatedAt) > new Date(b?.updatedAt) ? a : b),
    undefined,
  );
  return (
    <Inline space="space.100">
      <Box>
        <Text weight="bold">{prs.length}</Text>
      </Box>
      <Box>
        <Text>Pull requests</Text>
      </Box>
      {latest && (
        <Box>
          <Lozenge appearance={mapStatus(latest.status)} isBold>
            {latest.status}
          </Lozenge>
        </Box>
      )}
    </Inline>
  );
};
