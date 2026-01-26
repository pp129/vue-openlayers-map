import { unByKey } from "ol/Observable";

/**
 * 事件管理器 - 统一管理事件监听器
 * 避免事件监听器泄漏和重复绑定问题
 */
export class EventManager {
  constructor() {
    this.listeners = [];
    this.namedListeners = new Map();
  }

  /**
   * 添加事件监听器
   * @param {import('ol/events').EventsKey} listener - OpenLayers 事件监听器
   * @param {string} [name] - 监听器名称,用于按名称移除
   */
  add(listener, name) {
    if (name) {
      // 如果存在同名监听器,先移除
      if (this.namedListeners.has(name)) {
        const oldListener = this.namedListeners.get(name);
        unByKey(oldListener);
        const index = this.listeners.indexOf(oldListener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
      this.namedListeners.set(name, listener);
    }
    this.listeners.push(listener);
    return listener;
  }

  /**
   * 移除指定监听器
   * @param {import('ol/events').EventsKey|string} listenerOrName - 监听器对象或名称
   */
  remove(listenerOrName) {
    if (typeof listenerOrName === "string") {
      // 按名称移除
      const listener = this.namedListeners.get(listenerOrName);
      if (listener) {
        unByKey(listener);
        this.namedListeners.delete(listenerOrName);
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    } else {
      // 按对象移除
      unByKey(listenerOrName);
      const index = this.listeners.indexOf(listenerOrName);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    }
  }

  /**
   * 移除所有监听器
   */
  removeAll() {
    this.listeners.forEach((listener) => {
      if (listener) {
        unByKey(listener);
      }
    });
    this.listeners = [];
    this.namedListeners.clear();
  }

  /**
   * 检查是否存在指定名称的监听器
   * @param {string} name - 监听器名称
   * @returns {boolean}
   */
  has(name) {
    return this.namedListeners.has(name);
  }

  /**
   * 获取监听器数量
   * @returns {number}
   */
  getCount() {
    return this.listeners.length;
  }

  /**
   * 销毁管理器
   */
  dispose() {
    this.removeAll();
  }
}

export default EventManager;
