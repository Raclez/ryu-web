/**
 * 访客ID工具类
 */

const VISITOR_ID_KEY = 'ryu_visitor_id';

/**
 * 获取或创建访客ID
 * @returns 访客ID
 */
export const getOrCreateVisitorId = (): string => {
    let visitorId = localStorage.getItem(VISITOR_ID_KEY);

    if (!visitorId) {
        // 生成一个随机ID
        visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    return visitorId;
};

/**
 * 获取访客ID
 * @returns 访客ID，如果不存在则返回null
 */
export const getVisitorId = (): string | null => {
    return localStorage.getItem(VISITOR_ID_KEY);
};

/**
 * 设置访客ID
 * @param id 访客ID
 */
export const setVisitorId = (id: string): void => {
    localStorage.setItem(VISITOR_ID_KEY, id);
};

/**
 * 清除访客ID
 */
export const clearVisitorId = (): void => {
    localStorage.removeItem(VISITOR_ID_KEY);
};
