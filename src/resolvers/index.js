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
    
    // Extract and validate installation context
    const installContext = req.context.installContext;
    if (!installContext) {
      console.error('installContext is missing from request');
      return { success: false, message: 'Installation context is required but missing' };
    }
    
    // Create unique key using installation context (replace / with - for KVS compatibility)
    const sanitizedContext = installContext.replace(/\//g, '-');
    const uniqueKey = `github:token:${sanitizedContext}`;
    console.log('Using unique key:', uniqueKey);
    console.log('Original install context:', installContext);
    console.log('Sanitized context:', sanitizedContext);
    
    console.log('Attempting to save githubKey to kvs...');
    await kvs.setSecret(uniqueKey, githubKey);
    console.log('GitHub key saved successfully to kvs');
    
    return { success: true, message: 'GitHub key saved successfully', key: uniqueKey };
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
    
    // Extract and validate installation context
    const installContext = req.context.installContext;
    if (!installContext) {
      console.error('installContext is missing from request');
      return { success: false, message: 'Installation context is required but missing' };
    }
    
    // Create unique key using installation context (replace / with - for KVS compatibility)
    const sanitizedContext = installContext.replace(/\//g, '-');
    const uniqueKey = `github:token:${sanitizedContext}`;
    console.log('Using unique key:', uniqueKey);
    console.log('Original install context:', installContext);
    console.log('Sanitized context:', sanitizedContext);
    
    const githubKey = await kvs.getSecret(uniqueKey);
    console.log('Retrieved githubKey from kvs:', githubKey ? 'exists' : 'not found');
    
    return { success: true, githubKey: githubKey || '', key: uniqueKey };
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
    
    // Extract and validate installation context
    const installContext = req.context.installContext;
    if (!installContext) {
      console.error('installContext is missing from request');
      return { success: false, message: 'Installation context is required but missing' };
    }
    
    const testValue = 'test-secret-value';
    const sanitizedContext = installContext.replace(/\//g, '-');
    const testKey = `test:storage:${sanitizedContext}`;
    
    console.log('Using test key:', testKey);
    console.log('Original install context:', installContext);
    console.log('Sanitized context:', sanitizedContext);
    
    // Test setting a value
    await kvs.setSecret(testKey, testValue);
    console.log('Test value set successfully');
    
    // Test getting the value
    const retrievedValue = await kvs.getSecret(testKey);
    console.log('Test value retrieved:', retrievedValue ? 'exists' : 'not found');
    
    // Verify the round-trip worked
    const isValid = retrievedValue === testValue;
    console.log('KVS round-trip test:', isValid ? 'PASSED' : 'FAILED');
    
    // Clean up
    await kvs.delete(testKey);
    console.log('Test value cleaned up');
    
    return { 
      success: true, 
      message: 'KVS test successful',
      testValue,
      testKey,
      installContext,
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
