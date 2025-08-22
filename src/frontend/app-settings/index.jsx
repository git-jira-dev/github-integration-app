import React, { useEffect, useState } from 'react';
import ForgeReconciler, { Text, Button, Strong } from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [data, setData] = useState(null);
  const [githubKey, setGithubKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inputMode, setInputMode] = useState('view'); // 'view' or 'edit'

  useEffect(() => {
    invoke('getText', { example: 'my-invoke-variable' }).then(setData);
    loadGitHubKey();
  }, []);

  const loadGitHubKey = async () => {
    try {
      const result = await invoke('getGitHubKey');
      if (result.success) {
        setSavedKey(result.githubKey);
        setGithubKey(result.githubKey);
      }
    } catch (error) {
      console.error('Error loading GitHub key:', error);
    }
  };

  const handleSave = async () => {
    if (!githubKey.trim()) {
      setMessage('Please enter a GitHub key');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const result = await invoke('saveGitHubKey', { githubKey: githubKey.trim() });
      if (result.success) {
        setMessage(result.message);
        setSavedKey(githubKey.trim());
        setInputMode('view');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error saving GitHub key:', error);
      setMessage('Failed to save GitHub key');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = () => {
    setInputMode('edit');
    setGithubKey('');
    setMessage('');
  };

  const cancelEdit = () => {
    setInputMode('view');
    setGithubKey(savedKey);
    setMessage('');
  };

  return (
    <>
      <Text>Hello world!</Text>
      <Text>{data ? data : 'Loading...'}</Text>
      
      <Text>
        <Strong>GitHub Integration</Strong>
      </Text>
      
      {inputMode === 'view' ? (
        <>
          <Text>
            Current GitHub Key: {savedKey ? '••••••••' + savedKey.substring(savedKey.length - 4) : 'Not set'}
          </Text>
          <Text>
            <Button 
              onClick={startEdit}
              appearance="primary"
            >
              {savedKey ? 'Change GitHub Key' : 'Set GitHub Key'}
            </Button>
            <Button 
              onClick={async () => {
                try {
                  const result = await invoke('testStorage');
                  setMessage(`Storage test: ${result.success ? 'PASSED' : 'FAILED'} - ${result.message}`);
                } catch (error) {
                  setMessage(`Storage test error: ${error.message}`);
                }
              }}
              appearance="secondary"
              style={{ marginLeft: '8px' }}
            >
              Test Storage
            </Button>
          </Text>
        </>
      ) : (
        <>
          <Text>
            Enter new GitHub Personal Access Token:
          </Text>
          <Text>
            <Button 
              onClick={() => {
                const newKey = prompt('Enter your GitHub Personal Access Token:');
                if (newKey) {
                  setGithubKey(newKey);
                }
              }}
              appearance="secondary"
            >
              Enter Token
            </Button>
          </Text>
          {githubKey && (
            <Text>
              Token entered: {githubKey.substring(0, 8)}...
            </Text>
          )}
          <Text>
            <Button 
              onClick={handleSave}
              appearance="primary"
              isLoading={isLoading}
              disabled={!githubKey}
            >
              Save
            </Button>
            <Button 
              onClick={cancelEdit}
              appearance="secondary"
              style={{ marginLeft: '8px' }}
            >
              Cancel
            </Button>
          </Text>
        </>
      )}
      
      {message && (
        <Text>{message}</Text>
      )}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
