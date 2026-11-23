import * as Keychain from 'react-native-keychain';

const SERVICE_NAME = 'campus_erp_secure';

export const storage = {
  async setAccessToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('access_token', token, {
      service: SERVICE_NAME,
    });
  },

  async getAccessToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({service: SERVICE_NAME});
      if (!credentials || credentials.username !== 'access_token') return null;
      return credentials.password;
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('refresh_token', token, {
      service: `${SERVICE_NAME}_refresh`,
    });
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: `${SERVICE_NAME}_refresh`,
      });
      if (!credentials || credentials.username !== 'refresh_token') return null;
      return credentials.password;
    } catch {
      return null;
    }
  },

  async clear(): Promise<void> {
    await Keychain.resetGenericPassword({service: SERVICE_NAME});
    await Keychain.resetGenericPassword({service: `${SERVICE_NAME}_refresh`});
  },
};

export const tokenStorage = storage;
