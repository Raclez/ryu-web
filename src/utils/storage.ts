/**
 * 本地存储工具类
 */

// 存储前缀，用于隔离不同项目的存储
const STORAGE_PREFIX = 'ryu_web_';

/**
 * 本地存储工具类
 */
export class Storage {
    /**
     * 设置localStorage
     * @param key 键名
     * @param value 值
     */
    static setLocal(key: string, value: any): void {
        const storageKey = this.getKey(key);
        localStorage.setItem(storageKey, JSON.stringify(value));
    }

    /**
     * 获取localStorage
     * @param key 键名
     * @param defaultValue 默认值
     */
    static getLocal<T = any>(key: string, defaultValue?: T): T {
        const storageKey = this.getKey(key);
        const value = localStorage.getItem(storageKey);
        if (value === null) {
            return defaultValue as T;
        }
        try {
            return JSON.parse(value) as T;
        } catch (error) {
            return value as unknown as T;
        }
    }

    /**
     * 移除localStorage
     * @param key 键名
     */
    static removeLocal(key: string): void {
        const storageKey = this.getKey(key);
        localStorage.removeItem(storageKey);
    }

    /**
     * 设置sessionStorage
     * @param key 键名
     * @param value 值
     */
    static setSession(key: string, value: any): void {
        const storageKey = this.getKey(key);
        sessionStorage.setItem(storageKey, JSON.stringify(value));
    }

    /**
     * 获取sessionStorage
     * @param key 键名
     * @param defaultValue 默认值
     */
    static getSession<T = any>(key: string, defaultValue?: T): T {
        const storageKey = this.getKey(key);
        const value = sessionStorage.getItem(storageKey);
        if (value === null) {
            return defaultValue as T;
        }
        try {
            return JSON.parse(value) as T;
        } catch (error) {
            return value as unknown as T;
        }
    }

    /**
     * 移除sessionStorage
     * @param key 键名
     */
    static removeSession(key: string): void {
        const storageKey = this.getKey(key);
        sessionStorage.removeItem(storageKey);
    }

    /**
     * 清空所有本项目相关存储
     */
    static clear(): void {
        // 清除localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });

        // 清除sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(STORAGE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });
    }

    /**
     * 获取存储key
     * @param key 键名
     */
    private static getKey(key: string): string {
        return `${STORAGE_PREFIX}${key}`;
    }
}
