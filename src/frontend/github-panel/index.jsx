import ForgeReconciler, { Spinner, Text } from "@forge/react";
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

const GitHubPanel = () => {
  const [tokenExists, setTokenExists] = useState(undefined);
  const [prs, setPrs] = useState(undefined);
  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
    invoke("getPrsForTicket").then((res) => setPrs(res.prs));
  }, []);
  if (tokenExists === undefined || prs === undefined) return <Spinner />;
  return (
    <>
      <Text>{prs.length}</Text>
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <GitHubPanel />
  </React.StrictMode>,
);
