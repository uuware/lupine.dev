import { apiStorage } from '../api';
import { CryptoUtils, Logger } from '../lib';
import { adminHelper } from './admin-helper';

export type TokenProps = {
  token: string;
  description: string;
  timestamp?: number;
};
export class AdminTokenHelper {
  private static instance: AdminTokenHelper;
  private logger = new Logger('admin-token-api');

  private constructor() {}

  public static getInstance(): AdminTokenHelper {
    if (!AdminTokenHelper.instance) {
      AdminTokenHelper.instance = new AdminTokenHelper();
    }
    return AdminTokenHelper.instance;
  }

  async list(search?: string): Promise<TokenProps[]> {
    const tokens = await apiStorage.getApi('access-tokens');
    const tokenJson = JSON.parse(tokens || '[]');

    const searchTexts = (search || '').trim().split(' ').filter(item => !!item);
    const results = tokenJson.filter((item: TokenProps) =>
      searchTexts.every((text) => item.description.toLowerCase().includes(text.toLowerCase()))
    );

    return results;
  }
  async add(tokenData: TokenProps) {
    const tokens = await apiStorage.getApi('access-tokens');
    const tokensJson = JSON.parse(tokens || '[]');
    tokenData.timestamp = new Date().getTime();
    tokensJson.push(tokenData);
    apiStorage.setApi('access-tokens', JSON.stringify(tokensJson));
    await apiStorage.save();
  }

  async update(tokenData: TokenProps) {
    const tokens = await apiStorage.getApi('access-tokens');
    const tokensJson = JSON.parse(tokens || '{}');
    const idx = tokensJson.findIndex((item: TokenProps) => item.token === tokenData.token);
    if (idx !== -1) {
      tokensJson[idx].description = tokenData.description;
    }
    apiStorage.setApi('access-tokens', JSON.stringify(tokensJson));
    apiStorage.save();
  }

  async remove(token: string) {
    const tokens = await apiStorage.getApi('access-tokens');
    const tokensJson = JSON.parse(tokens || '[]');
    const idx = tokensJson.findIndex((item: TokenProps) => item.token === token);
    if (idx !== -1) {
      tokensJson.splice(idx, 1);
    }
    apiStorage.setApi('access-tokens', JSON.stringify(tokensJson));
    apiStorage.save();
  }

  generate() {
    const salt = 'Lupine:' + CryptoUtils.uuid() + ':' + new Date().getTime().toString();
    return adminHelper.encryptJson(salt) as string;
  }

  async validateToken(token: string) {
    const tokens = await apiStorage.getApi('access-tokens');
    const tokensJson = JSON.parse(tokens || '[]');
    const idx = tokensJson.findIndex((item: TokenProps) => item.token === token);
    return idx !== -1;
  }
}

// add comment for tree shaking
export const adminTokenHelper = /* @__PURE__ */ AdminTokenHelper.getInstance();
