import Resolver from '@forge/resolver';
import { storage } from '@forge/api';

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
    
    console.log('Attempting to save githubKey to storage...');
    await storage.set('app:github:personal-access-token', githubKey);
    console.log('GitHub key saved successfully to storage');
    
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
    
    const githubKey = await storage.get('app:github:personal-access-token');
    console.log('Retrieved githubKey from storage:', githubKey ? 'exists' : 'not found');
    
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
    console.log('Testing storage functionality...');
    
    // Test setting a value
    await storage.set('test:key', 'test-value');
    console.log('Test value set successfully');
    
    // Test getting the value
    const testValue = await storage.get('test:key');
    console.log('Test value retrieved:', testValue);
    
    // Clean up
    await storage.delete('test:key');
    console.log('Test value cleaned up');
    
    return { 
      success: true, 
      message: 'Storage test successful',
      testValue: testValue
    };
  } catch (error) {
    console.error('Storage test failed:', error);
    return { 
      success: false, 
      message: `Storage test failed: ${error.message}`,
      error: error.message
    };
  }
});

export const handler = resolver.getDefinitions();
