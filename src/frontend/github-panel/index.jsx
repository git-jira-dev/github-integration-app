import ForgeReconciler, { Text } from "@forge/react";
import React, { useEffect, useState } from "react";
import { invoke } from "@forge/bridge";

const GitHubPanel = () => {
  const [tokenExists, setTokenExists] = useState(undefined);
  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
  }, []);

  if (tokenExists === undefined) return <>Loading...</>;
  return (
    <>
      <Text>Hello world!</Text>
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <GitHubPanel />
  </React.StrictMode>,
);
