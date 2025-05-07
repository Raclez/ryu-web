import {Storage} from './storage';

// Token相关常量
const TOKEN_KEY = 'token';
const USER_INFO_KEY = 'user_info';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * 默认token，在未登录时使用
 * 这里仅用于开发阶段，生产环境应该移除
 */
const DEFAULT_TOKEN = import.meta.env.VITE_DEFAULT_TOKEN || '';

/**
 * Token工具类
 */
export class TokenService {
    /**
     * 获取token
     * @returns token字符串
     */
    static getToken(): string {
        // 开发环境下，如果本地没有token，则使用默认token
        if (import.meta.env.DEV) {
            return Storage.getLocal<string>(TOKEN_KEY, DEFAULT_TOKEN);
        }

        return Storage.getLocal<string>(TOKEN_KEY, '');
    }

    /**
     * 设置token
     * @param token token字符串
     */
    static setToken(token: string): void {
        Storage.setLocal(TOKEN_KEY, token);
    }

    /**
     * 移除token
     */
    static removeToken(): void {
        Storage.removeLocal(TOKEN_KEY);
    }

    /**
     * 获取刷新token
     */
    static getRefreshToken(): string {
        return Storage.getLocal<string>(REFRESH_TOKEN_KEY, '');
    }

    /**
     * 设置刷新token
     * @param token 刷新token字符串
     */
    static setRefreshToken(token: string): void {
        Storage.setLocal(REFRESH_TOKEN_KEY, token);
    }

    /**
     * 移除刷新token
     */
    static removeRefreshToken(): void {
        Storage.removeLocal(REFRESH_TOKEN_KEY);
    }

    /**
     * 获取用户信息
     */
    static getUserInfo<T = any>(): T | null {
        return Storage.getLocal<T | null>(USER_INFO_KEY, null);
    }

    /**
     * 设置用户信息
     * @param info 用户信息
     */
    static setUserInfo<T = any>(info: T): void {
        Storage.setLocal(USER_INFO_KEY, info);
    }

    /**
     * 移除用户信息
     */
    static removeUserInfo(): void {
        Storage.removeLocal(USER_INFO_KEY);
    }

    /**
     * 清除所有认证相关信息
     */
    static clearAll(): void {
        this.removeToken();
        this.removeRefreshToken();
        this.removeUserInfo();
    }
}
