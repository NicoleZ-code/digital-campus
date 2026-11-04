/**
 * @file download.js
 * @description 浏览器文件下载工具，将 Blob 以指定文件名保存。
 */

/**
 * 通过临时创建 <a> 元素触发浏览器下载，将 Blob 保存为指定文件名的本地文件。
 * @param {Blob} blob - 待下载的二进制内容
 * @param {string} filename - 保存时使用的文件名（含扩展名）
 * @returns {void}
 */
export function downloadBlob(blob, filename) {
  // 为 Blob 生成临时对象 URL
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    // 无论点击是否成功都移除节点，并延迟释放对象 URL
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
