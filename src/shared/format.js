/**
 * @file format.js
 * @description 数字格式化工具，提供千分位分隔输出。
 */

/**
 * 将数字格式化为带千分位分隔符的字符串（美式格式，如 1,234,567）。
 * @param {number} value - 待格式化的数字。
 * @returns {string} 千分位分隔后的字符串。
 */
export const formatNumber = (value) => value.toLocaleString('en-US');
