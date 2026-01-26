/**
 * 样式缓存管理器
 * 防止样式缓存无限增长导致内存溢出
 */
export class StyleCache {
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = []; // 记录访问顺序,用于 LRU 淘汰
  }

  /**
   * 获取缓存的样式
   * @param {string} key - 缓存键
   * @returns {any}
   */
  get(key) {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 更新访问顺序 (LRU)
      this._updateAccessOrder(key);
    }
    return value;
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   */
  set(key, value) {
    // 检查是否超出最大缓存数量
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictOldest();
    }

    this.cache.set(key, value);
    this._updateAccessOrder(key);
  }

  /**
   * 检查缓存是否存在
   * @param {string} key - 缓存键
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * 删除指定缓存
   * @param {string} key - 缓存键
   */
  delete(key) {
    this.cache.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * 获取缓存大小
   * @returns {number}
   */
  size() {
    return this.cache.size;
  }

  /**
   * 更新访问顺序
   * @private
   */
  _updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * 淘汰最旧的缓存项 (LRU)
   * @private
   */
  _evictOldest() {
    if (this.accessOrder.length > 0) {
      // 淘汰最早访问的项
      const oldestKey = this.accessOrder.shift();
      this.cache.delete(oldestKey);
    } else {
      // 如果访问顺序为空,删除第一个缓存项
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * 批量淘汰缓存 (淘汰一半)
   */
  evictHalf() {
    const halfSize = Math.floor(this.cache.size / 2);
    for (let i = 0; i < halfSize && this.accessOrder.length > 0; i++) {
      const key = this.accessOrder.shift();
      this.cache.delete(key);
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      utilizationRate: ((this.cache.size / this.maxSize) * 100).toFixed(2) + "%",
    };
  }
}

export default StyleCache;
