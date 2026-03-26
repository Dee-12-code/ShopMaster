import * as SecureStore from "expo-secure-store";

const KEYS = {
  USER_TOKEN: "userToken",
  USER_DATA: "userData",
  CART_ITEMS: "cartItems",
  THEME: "appTheme",
} as const;

export const StorageService = {
  // Auth
  async setToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_TOKEN, token);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(KEYS.USER_TOKEN);
  },

  async removeToken(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.USER_TOKEN);
  },

  // User Data
  async setUserData(user: any): Promise<void> {
    await SecureStore.setItemAsync(KEYS.USER_DATA, JSON.stringify(user));
  },

  async getUserData(): Promise<any | null> {
    const data = await SecureStore.getItemAsync(KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },

  async removeUserData(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.USER_DATA);
  },

  // Cart (using SecureStore for sensitive persistence)
  async setCartItems(items: any[]): Promise<void> {
    await SecureStore.setItemAsync(KEYS.CART_ITEMS, JSON.stringify(items));
  },

  async getCartItems(): Promise<any[]> {
    const data = await SecureStore.getItemAsync(KEYS.CART_ITEMS);
    return data ? JSON.parse(data) : [];
  },

  async removeCartItems(): Promise<void> {
    await SecureStore.deleteItemAsync(KEYS.CART_ITEMS);
  },
};
