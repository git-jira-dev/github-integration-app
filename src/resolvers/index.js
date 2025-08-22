import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, world!';
});

resolver.define('saveGitHubKey', async (req) => {
  try {
    console.log('saveGitHubKey called with payload:', req.payload);
    const { githubKey } = req.payload;
    
    if (!githubKey) {
      console.error('No githubKey provided in payload');
      return { success: false, message: 'No GitHub key provided' };
    }
    
    console.log('Attempting to save githubKey to kvs...');
    await kvs.setSecret('app:github:personal-access-token', githubKey);
    console.log('GitHub key saved successfully to kvs');
    
    return { success: true, message: 'GitHub key saved successfully' };
  } catch (error) {
    console.error('Error saving GitHub key:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return { success: false, message: `Failed to save GitHub key: ${error.message}` };
  }
});

resolver.define('getGitHubKey', async (req) => {
  try {
    console.log('getGitHubKey called');
    
    const githubKey = await kvs.getSecret('app:github:personal-access-token');
    console.log('Retrieved githubKey from kvs:', githubKey ? 'exists' : 'not found');
    
    return { success: true, githubKey: githubKey || '' };
  } catch (error) {
    console.error('Error getting GitHub key:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return { success: false, message: `Failed to get GitHub key: ${error.message}` };
  }
});

resolver.define('testStorage', async (req) => {
  try {
    console.log('Testing kvs functionality...');
    
    const testValue = 'test-secret-value';
    
    // Test setting a value
    await kvs.setSecret('test:key', testValue);
    console.log('Test value set successfully');
    
    // Test getting the value
    const retrievedValue = await kvs.getSecret('test:key');
    console.log('Test value retrieved:', retrievedValue ? 'exists' : 'not found');
    
    // Verify the round-trip worked
    const isValid = retrievedValue === testValue;
    console.log('KVS round-trip test:', isValid ? 'PASSED' : 'FAILED');
    
    // Clean up
    await kvs.delete('test:key');
    console.log('Test value cleaned up');
    
    return { 
      success: true, 
      message: 'KVS test successful',
      testValue,
      roundTripValid: isValid
    };
  } catch (error) {
    console.error('KVS test failed:', error);
    return { 
      success: false, 
      message: `KVS test failed: ${error.message}`,
      error: error.message
    };
  }
});

export const handler = resolver.getDefinitions();
