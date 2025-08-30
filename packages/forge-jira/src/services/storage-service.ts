import kvs from '@forge/kvs';
import { GITHUB_TOKEN_KEY } from '../constants';

class StorageService {
  async loadToken(): Promise<string | undefined> {
    return await kvs.getSecret(GITHUB_TOKEN_KEY);
  }

  async tokenExists() {
    const token = await this.loadToken();
    return !!token;
  }

  async saveToken(token: string) {
    await kvs.setSecret(GITHUB_TOKEN_KEY, token);
  }
}

export default new StorageService();
