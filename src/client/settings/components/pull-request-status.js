import { Lozenge } from "@forge/react";
import React from "react";

const statusMap = {
  OPEN: "inprogress",
  MERGED: "success",
  DECLINED: "removed",
};

function mapAppearance(status) {
  return statusMap[status] ?? "default";
}

function resolvePrStatus(pr) {
  if (pr.state === "open") {
    return "OPEN";
  }
  if (pr.state === "closed" && !pr.mergedAt) {
    return "DECLINED";
  }
  if (pr.state === "closed" && pr.mergedAt) {
    return "MERGED";
  }
  return "UNKNOWN";
}

export const PullRequestStatus = ({ pr }) => {
  const status = resolvePrStatus(pr);
  return (
    <Lozenge appearance={mapAppearance(status)} isBold>
      {status}
    </Lozenge>
  );
};
