import ForgeReconciler, {
  Box,
  Button,
  ErrorMessage,
  Form,
  FormFooter,
  FormSection,
  Label,
  RequiredAsterisk,
  Textfield,
  useForm,
  xcss,
} from '@forge/react';
import React, { useEffect, useState } from 'react';
import { invoke, showFlag } from '@forge/bridge';
import { FlagType } from '@forge/bridge/out/flag/flag';
import { ResolverResponse } from '@app/shared';

const formContainerStyles = xcss({
  maxWidth: '400px',
});

interface FormValues {
  token: string;
}

const UIKitPage = () => {
  const [tokenExists, setTokenExists] = useState<boolean | undefined>();
  const [tokenPlaceholder, setTokenPlaceholder] = useState<string | undefined>();
  const [webTriggerUrl, setWebTriggerUrl] = useState('');
  const { handleSubmit, register, getFieldId, formState } = useForm<FormValues>();
  const { errors } = formState;

  const flag = ({ type, title, isAutoDismiss }: {
    title?: string;
    type?: FlagType;
    isAutoDismiss?: boolean; }) => {
    showFlag({
      id: Math.floor(Math.random() * 1000),
      title,
      type,
      isAutoDismiss,
    });
  };

  useEffect(() => {
    invoke('gitHubTokenExists')
      .then((response) => {
        const { error, data } = response as ResolverResponse<boolean>;
        if (error) {
          flag({
            title: error.message,
            type: 'error',
            isAutoDismiss: false,
          });
        } else {
          setTokenExists(data);
        }
      })
      .catch(() => {
        flag({
          title: 'Failed to check if GitHub token exists',
          type: 'error',
          isAutoDismiss: false,
        });
      });
    invoke('getWebTriggerUrl')
      .then((url) => { setWebTriggerUrl(url as string); })
      .catch(() => {
        flag({
          title: 'Failed to fetch web trigger URL',
          type: 'error',
          isAutoDismiss: false,
        });
      });
  }, []);

  useEffect(() => {
    if (tokenExists) {
      setTokenPlaceholder('•'.repeat(40));
    }
  }, [tokenExists]);

  const saveSettings = async ({ token }: FormValues) => {
    try {
      const response = await invoke('saveGitHubToken', { token });
      const { error } = response as ResolverResponse<unknown>;

      if (error) {
        flag({
          type: 'error',
          title: error.message,
          isAutoDismiss: false,
        });
        return;
      }

      flag({
        type: 'info',
        title: 'GitHub settings have been updated successfully',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      flag({
        type: 'error',
        title: 'An unexpected error occurred while saving the settings',
        isAutoDismiss: false,
      });
    }
  };

  function hidePlaceholder() {
    setTokenPlaceholder(undefined);
  }

  return (
    <Box xcss={formContainerStyles}>
      <Form onSubmit={handleSubmit(saveSettings)}>
        <FormSection>
          <Label labelFor={getFieldId('token')}>
            GitHub Personal Access Token
            <RequiredAsterisk />
          </Label>
          <Textfield
            {...register('token', { required: true })}
            type="password"
            placeholder={tokenPlaceholder}
            onFocus={hidePlaceholder}
          />
          {errors.token && <ErrorMessage>Please enter a token</ErrorMessage>}
          <Label labelFor="webhook_url">Web trigger URL</Label>
          <Textfield id="webhook_url" value={webTriggerUrl} isReadOnly />
        </FormSection>
        <FormFooter>
          <Button appearance="primary" type="submit">
            Save
          </Button>
        </FormFooter>
      </Form>
    </Box>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <UIKitPage />
  </React.StrictMode>,
);
