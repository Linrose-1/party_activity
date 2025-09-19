// src/utils/user.js

/**
 * @description 从本地缓存中获取解析后的用户信息对象
 * @returns {object|null} 用户信息对象或 null
 */
export function getCachedUserInfo() {
    const userInfoStr = uni.getStorageSync('userInfo');
    if (userInfoStr) {
        try {
            return JSON.parse(userInfoStr);
        } catch (e) {
            console.error('解析缓存的用户信息失败:', e);
            return null;
        }
    }
    return null;
}

/**
 * @description 从本地缓存中直接获取用户的邀请码
 * @returns {string} 邀请码或空字符串
 */
export function getInviteCode() {
    const userInfo = getCachedUserInfo();
    return userInfo ? userInfo.shardCode || '' : '';
}