/**
 * 性能优化工具集
 * 提供节流、防抖、RAF节流、LRU缓存等性能优化工具
 */

/**
 * 节流函数 - 确保函数在指定时间内只执行一次
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Function} fn - 要节流的函数
 * @returns {Function} 节流后的函数
 */
export function throttle(delay, fn) {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    }
  };
}

/**
 * 防抖函数 - 确保函数在停止调用后才执行
 * @param {number} delay - 延迟时间（毫秒）
 * @param {Function} fn - 要防抖的函数
 * @returns {Function} 防抖后的函数
 */
export function debounce(delay, fn) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * RAF节流 - 使用 requestAnimationFrame 进行节流
 * 确保函数在每个渲染帧最多执行一次
 * @param {Function} fn - 要节流的函数
 * @returns {Function} RAF节流后的函数
 */
export function rafThrottle(fn) {
  let rafId = null;
  let lastArgs = null;

  const throttled = function (...args) {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };

  // 取消方法
  throttled.cancel = function () {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
      lastArgs = null;
    }
  };

  return throttled;
}

/**
 * LRU缓存 - 最近最少使用缓存
 * 自动清理最久未使用的缓存项
 */
export class LRUCache {
  /**
   * @param {number} maxSize - 最大缓存数量
   */
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  /**
   * 获取缓存值
   * @param {string} key - 缓存键
   * @returns {*} 缓存值，不存在返回 undefined
   */
  get(key) {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // 移动到最新位置（Map 的迭代顺序是插入顺序）
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * 设置缓存值
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   */
  set(key, value) {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 添加到最新位置
    this.cache.set(key, value);

    // 检查是否超出最大容量
    if (this.cache.size > this.maxSize) {
      // 删除最旧的项（第一个）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
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
   * 清空缓存
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }
}

/**
 * 对象池 - 复用对象以减少 GC 压力
 */
export class ObjectPool {
  /**
   * @param {Function} factory - 创建对象的工厂函数
   * @param {Function} reset - 重置对象的函数
   * @param {number} maxSize - 池最大大小
   */
  constructor(factory, reset, maxSize = 50) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.pool = [];
  }

  /**
   * 获取对象
   * @returns {*} 对象实例
   */
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  /**
   * 释放对象回池中
   * @param {*} obj - 要释放的对象
   */
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * 清空对象池
   */
  clear() {
    this.pool = [];
  }

  /**
   * 获取池中可用对象数量
   * @returns {number}
   */
  get size() {
    return this.pool.length;
  }
}

/**
 * 批量操作工具 - 将多次操作合并为一次
 */
export class BatchProcessor {
  /**
   * @param {Function} processor - 批量处理函数
   * @param {number} delay - 延迟时间（毫秒）
   */
  constructor(processor, delay = 16) {
    this.processor = processor;
    this.delay = delay;
    this.queue = [];
    this.timerId = null;
  }

  /**
   * 添加项到队列
   * @param {*} item - 要处理的项
   */
  add(item) {
    this.queue.push(item);

    if (!this.timerId) {
      this.timerId = setTimeout(() => {
        this.flush();
      }, this.delay);
    }
  }

  /**
   * 立即处理所有队列项
   */
  flush() {
    if (this.queue.length > 0) {
      this.processor(this.queue);
      this.queue = [];
    }
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * 清空队列
   */
  clear() {
    this.queue = [];
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
  }

  /**
   * 开始计时
   * @param {string} name - 标记名称
   */
  start(name) {
    this.marks.set(name, performance.now());
  }

  /**
   * 结束计时并返回耗时
   * @param {string} name - 标记名称
   * @returns {number} 耗时（毫秒）
   */
  end(name) {
    const startTime = this.marks.get(name);
    if (startTime === undefined) {
      console.warn(`[PerformanceMonitor] No start mark found for: ${name}`);
      return 0;
    }
    const duration = performance.now() - startTime;
    this.marks.delete(name);
    return duration;
  }

  /**
   * 测量函数执行时间
   * @param {string} name - 标记名称
   * @param {Function} fn - 要测量的函数
   * @returns {*} 函数返回值
   */
  measure(name, fn) {
    this.start(name);
    const result = fn();
    const duration = this.end(name);
    console.log(`[PerformanceMonitor] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }

  /**
   * 异步测量函数执行时间
   * @param {string} name - 标记名称
   * @param {Function} fn - 要测量的异步函数
   * @returns {Promise<*>} 函数返回值
   */
  async measureAsync(name, fn) {
    this.start(name);
    const result = await fn();
    const duration = this.end(name);
    console.log(`[PerformanceMonitor] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  }
}
