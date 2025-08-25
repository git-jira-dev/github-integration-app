import React, { useEffect, useState } from "react";
import ForgeReconciler, {
  Box,
  Button,
  ErrorMessage,
  Form,
  FormFooter,
  FormSection,
  Label,
  RequiredAsterisk,
  Spinner,
  Textfield,
  useForm,
  xcss,
} from "@forge/react";
import { invoke, showFlag } from "@forge/bridge";

const formContainerStyles = xcss({
  maxWidth: "400px",
});

const AppSettings = () => {
  const [tokenPlaceholder, setTokenPlaceholder] = useState("");
  const [webTriggerUrl, setWebTriggerUrl] = useState("");
  const [tokenExists, setTokenExists] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const { handleSubmit, register, getFieldId, formState } = useForm();
  const { errors } = formState;

  useEffect(() => {
    invoke("gitHubTokenExists").then(setTokenExists);
    invoke("getWebTriggerUrl").then(setWebTriggerUrl);
  }, []);

  function hidePlaceholder() {
    setTokenPlaceholder("");
  }

  useEffect(() => {
    if (tokenExists !== undefined) {
      if (tokenExists) {
        setTokenPlaceholder("••••••••••••••••••••••••••••••••");
      }
      setIsLoading(false);
    }
  }, [tokenExists]);

  const flag = ({ type, title, isAutoDismiss = true }) => {
    showFlag({
      id: Math.floor(Math.random() * 1000),
      title,
      type,
      isAutoDismiss,
    });
  };

  const saveSettings = ({ token }) => {
    invoke("saveGitHubToken", { githubKey: token }).then((result) => {
      if (!result.success) {
        flag({ type: "error", title: result.message, isAutoDismiss: false });
      } else {
        flag({ type: "info", title: "GitHub settings have been updated" });
      }
    });
  };

  if (isLoading) return <Spinner />;

  return (
    <Box xcss={formContainerStyles}>
      <Form onSubmit={handleSubmit(saveSettings)}>
        <FormSection>
          <Label labelFor={getFieldId("token")}>
            GitHub Personal Access Token
            <RequiredAsterisk />
          </Label>
          <Textfield
            {...register("token", { required: true })}
            placeholder={tokenPlaceholder}
            onFocus={hidePlaceholder}
            type="password"
          />
          {errors["token"] && <ErrorMessage>Please enter a token</ErrorMessage>}
        </FormSection>
        <FormFooter>
          <Button appearance="primary" type="submit">
            Save
          </Button>
        </FormFooter>
      </Form>
      <Label labelFor="webhook_url">Web trigger URL</Label>
      <Textfield id="webhook_url" value={webTriggerUrl} isReadOnly />
    </Box>
  );
};
ForgeReconciler.render(
  <React.StrictMode>
    <AppSettings />
  </React.StrictMode>,
);
