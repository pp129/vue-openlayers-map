import { unByKey } from "ol/Observable";

/**
 * 图层管理器 - 统一管理图层的添加、移除和事件监听
 * 解决内存泄漏和重复代码问题
 */
export class LayerManager {
  constructor(map) {
    this.map = map;
    this.layers = new Map();
    this.listeners = new Map();
  }

  /**
   * 添加图层
   * @param {string} id - 图层唯一标识
   * @param {import('ol/layer/Base').default} layer - OpenLayers 图层对象
   * @param {Array} listeners - 事件监听器数组
   */
  addLayer(id, layer, listeners = []) {
    if (this.layers.has(id)) {
      console.warn(`Layer with id "${id}" already exists. Removing old layer.`);
      this.removeLayer(id);
    }

    this.layers.set(id, layer);
    this.listeners.set(id, listeners);
    this.map.addLayer(layer);
  }

  /**
   * 移除图层
   * @param {string} id - 图层唯一标识
   */
  removeLayer(id) {
    const layer = this.layers.get(id);
    const listeners = this.listeners.get(id);

    // 清理事件监听器
    if (listeners && listeners.length > 0) {
      listeners.forEach((listener) => {
        if (listener) {
          unByKey(listener);
        }
      });
    }

    // 清理图层
    if (layer) {
      const source = layer.getSource();
      if (source) {
        // 清空数据源
        if (typeof source.clear === "function") {
          source.clear();
        }
        // 释放数据源资源
        if (typeof source.dispose === "function") {
          source.dispose();
        }
      }

      // 清理渲染器
      const renderer = layer.getRenderer();
      if (renderer && typeof renderer.dispose === "function") {
        renderer.dispose();
      }

      // 从地图移除
      this.map.removeLayer(layer);
    }

    this.layers.delete(id);
    this.listeners.delete(id);
  }

  /**
   * 获取图层
   * @param {string} id - 图层唯一标识
   * @returns {import('ol/layer/Base').default|undefined}
   */
  getLayer(id) {
    return this.layers.get(id);
  }

  /**
   * 检查图层是否存在
   * @param {string} id - 图层唯一标识
   * @returns {boolean}
   */
  hasLayer(id) {
    return this.layers.has(id);
  }

  /**
   * 清理所有图层
   */
  dispose() {
    const ids = Array.from(this.layers.keys());
    ids.forEach((id) => this.removeLayer(id));
    this.layers.clear();
    this.listeners.clear();
  }

  /**
   * 获取所有图层ID
   * @returns {Array<string>}
   */
  getAllLayerIds() {
    return Array.from(this.layers.keys());
  }

  /**
   * 获取图层数量
   * @returns {number}
   */
  getLayerCount() {
    return this.layers.size;
  }
}

export default LayerManager;
