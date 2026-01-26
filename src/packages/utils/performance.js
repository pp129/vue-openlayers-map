import { throttle as _throttle, debounce as _debounce } from "throttle-debounce";

/**
 * 性能优化工具函数
 */

/**
 * 节流函数 - 包装 throttle-debounce 库
 * @param {number} delay - 延迟时间(毫秒)
 * @param {Function} fn - 需要节流的函数
 * @param {Object} options - 配置选项
 * @returns {Function}
 */
export function throttle(delay, fn, options = {}) {
  return _throttle(delay, fn, options);
}

/**
 * 防抖函数 - 包装 throttle-debounce 库
 * @param {number} delay - 延迟时间(毫秒)
 * @param {Function} fn - 需要防抖的函数
 * @param {Object} options - 配置选项
 * @returns {Function}
 */
export function debounce(delay, fn, options = {}) {
  return _debounce(delay, fn, options);
}

/**
 * 创建帧节流函数 - 使用 requestAnimationFrame
 * @param {Function} fn - 需要节流的函数
 * @returns {Function}
 */
export function rafThrottle(fn) {
  let rafId = null;
  let lastArgs = null;

  return function throttled(...args) {
    lastArgs = args;

    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

/**
 * 批量操作优化 - 将多次操作合并为一次
 * @param {Function} fn - 批量处理函数
 * @param {number} delay - 延迟时间(毫秒)
 * @returns {Object}
 */
export function createBatchProcessor(fn, delay = 100) {
  let items = [];
  let timeoutId = null;

  const process = () => {
    if (items.length > 0) {
      fn(items);
      items = [];
    }
    timeoutId = null;
  };

  return {
    add(item) {
      items.push(item);

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(process, delay);
    },

    flush() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      process();
    },

    clear() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      items = [];
      timeoutId = null;
    },
  };
}

/**
 * 空闲时执行任务 - 使用 requestIdleCallback
 * @param {Function} fn - 任务函数
 * @param {Object} options - 配置选项
 */
export function runWhenIdle(fn, options = {}) {
  if (typeof requestIdleCallback !== "undefined") {
    return requestIdleCallback(fn, options);
  } else {
    // 降级方案: 使用 setTimeout
    return setTimeout(fn, 1);
  }
}

/**
 * 取消空闲任务
 * @param {number} id - 任务ID
 */
export function cancelIdleCallback(id) {
  if (typeof cancelIdleCallback !== "undefined") {
    return window.cancelIdleCallback(id);
  } else {
    return clearTimeout(id);
  }
}

/**
 * 浅比较数组 - 优化 watch 性能
 * @param {Array} arr1 - 数组1
 * @param {Array} arr2 - 数组2
 * @returns {boolean}
 */
export function shallowArrayEqual(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
    return false;
  }

  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

/**
 * 浅比较对象
 * @param {Object} obj1 - 对象1
 * @param {Object} obj2 - 对象2
 * @returns {boolean}
 */
export function shallowObjectEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (!obj1 || !obj2) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * 创建性能监控器
 * @param {string} name - 监控名称
 * @returns {Object}
 */
export function createPerformanceMonitor(name) {
  const marks = new Map();

  return {
    start(label = "default") {
      const key = `${name}-${label}`;
      marks.set(key, performance.now());
    },

    end(label = "default", shouldLog = true) {
      const key = `${name}-${label}`;
      const startTime = marks.get(key);

      if (startTime !== undefined) {
        const duration = performance.now() - startTime;
        marks.delete(key);

        if (shouldLog && process.env.NODE_ENV === "development") {
          console.log(`[Performance] ${key}: ${duration.toFixed(2)}ms`);
        }

        return duration;
      }

      return null;
    },

    clear() {
      marks.clear();
    },
  };
}

export default {
  throttle,
  debounce,
  rafThrottle,
  createBatchProcessor,
  runWhenIdle,
  cancelIdleCallback,
  shallowArrayEqual,
  shallowObjectEqual,
  createPerformanceMonitor,
};
