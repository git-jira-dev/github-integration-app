import React, { useEffect, useState } from "react";
import ForgeReconciler, { Text } from "@forge/react";
import { invoke } from "@forge/bridge";

const AppSettings = () => {
  const [tokenExists, setTokenExists] = useState(undefined);
  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
  }, []);

  if (tokenExists === undefined) return <>Loading...</>;

  return (
    <>
      <Text>Token exists: {tokenExists.toString()}</Text>
    </>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <AppSettings />
  </React.StrictMode>,
);
