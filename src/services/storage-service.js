import { kvs } from "@forge/kvs";
import { GITHUB_TOKEN_KEY } from "../../common/constants";

class StorageService {
  async loadToken() {
    return await kvs.getSecret(GITHUB_TOKEN_KEY);
  }

  async tokenExists() {
    const token = await this.loadToken();
    return !!token;
  }

  async saveToken(token) {
    await kvs.setSecret(GITHUB_TOKEN_KEY, token);
  }
}

export default new StorageService();
