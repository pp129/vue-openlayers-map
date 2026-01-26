# path.js 性能优化分析与建议

## 📊 当前性能瓶颈分析

### 1. **simplifyOpera 方法** (Line 282-370)

**问题:**

- 每次分辨率变化都遍历全部节点（可能数千个）
- 使用 Promise 但没有充分利用异步优势
- 重复计算坐标转换

**影响:** 缩放地图时卡顿

**优化方案:**

```javascript
// ✅ 使用节流 + Web Worker
_simplifyEvent = map.getView().on(
  "change:resolution",
  throttle(300, (eve) => {
    this.simplifyOpera(eve);
  })
);

// ✅ 只计算可视范围内的节点
const extent = this._map.getView().calculateExtent();
path = this._nodesCollection
  .filter((item) => {
    const coord = item.getGeometry().getCoordinates();
    return containsCoordinate(extent, coord);
  })
  .map((item) => {
    /*...*/
  });
```

### 2. **lineStyles 函数** (Line 1211-1245)

**问题:**

- 每次渲染计算所有箭头位置
- 大量三角函数计算 (`Math.atan2`)
- 没有样式缓存

**影响:** 渲染性能下降 30-40%

**优化方案:**

```javascript
// ✅ 缓存箭头样式
const arrowStyleCache = new Map();

function lineStyles(feature, resolution) {
  const cacheKey = `${feature.getId()}-${resolution.toFixed(4)}`;

  if (arrowStyleCache.has(cacheKey)) {
    return arrowStyleCache.get(cacheKey);
  }

  const styles = calculateStyles(feature, resolution);

  // LRU 缓存策略
  if (arrowStyleCache.size > 100) {
    const firstKey = arrowStyleCache.keys().next().value;
    arrowStyleCache.delete(firstKey);
  }

  arrowStyleCache.set(cacheKey, styles);
  return styles;
}
```

### 3. **事件监听器** (Line 259, 271)

**问题:**

- `pointermove` 和 `singleclick` 无节流
- 每次触发都进行像素检测

**影响:** 频繁触发，占用主线程

**优化方案:**

```javascript
// ✅ 使用 RAF 节流
import { rafThrottle } from "@/packages/utils/performance";

this._tracekEvent = mapObj?.on(
  ["singleclick", "pointermove"],
  rafThrottle((eve) => {
    this.eventListener(eve);
  })
);
```

### 4. **动画播放** (Line 765-1009)

**问题:**

- 使用 `postrender` 事件，每帧都触发
- 没有使用 `requestAnimationFrame` 优化
- 大量 DOM 操作

**影响:** 动画不流畅，FPS 下降

**优化方案:**

```javascript
// ✅ 批量更新 + RAF
animationPlay(event) {
  if (!this._rafId) {
    this._rafId = requestAnimationFrame(() => {
      this._updateAnimation(event);
      this._rafId = null;
    });
  }
}

_updateAnimation(event) {
  // 批量更新坐标
  const updates = this._calculateBatchUpdates();

  // 一次性应用
  this._animateStart.getGeometry().setCoordinates(updates.position);
  this._animateLine.getGeometry().setCoordinates(updates.line);
}
```

---

## 🚀 推荐优化清单

### 优先级 P0 (关键)

- [ ] **simplifyOpera 添加节流** (300ms)
- [ ] **lineStyles 实现样式缓存**
- [ ] **事件监听添加 RAF 节流**

### 优先级 P1 (重要)

- [ ] **只处理可视范围内的节点**
- [ ] **使用 Web Worker 处理 simplify 计算**
- [ ] **批量更新动画坐标**

### 优先级 P2 (优化)

- [ ] **预计算箭头位置**
- [ ] **使用对象池减少 GC**
- [ ] **路径分段渲染**

---

## 📈 预期性能提升

| 优化项       | 提升幅度 | 实施难度    |
| ------------ | -------- | ----------- |
| 节流事件     | 40-50%   | ⭐ 简单     |
| 样式缓存     | 30-40%   | ⭐⭐ 中等   |
| 可视范围过滤 | 50-60%   | ⭐⭐ 中等   |
| Web Worker   | 60-70%   | ⭐⭐⭐ 较难 |
| 批量更新     | 20-30%   | ⭐⭐ 中等   |

---

## 💡 最佳实践建议

### 1. 大数据量处理

```javascript
// ✅ 分段加载
if (path.length > 5000) {
  const chunks = chunkArray(path, 1000);
  chunks.forEach((chunk, index) => {
    setTimeout(() => {
      this.addPathChunk(chunk);
    }, index * 100);
  });
}
```

### 2. 内存管理

```javascript
// ✅ 及时清理
dispose() {
  // 清理事件监听
  unByKey(this._tracekEvent);
  unByKey(this._simplifyEvent);

  // 清理图层
  this._group.getLayersArray().forEach(layer => {
    layer.getSource()?.clear();
  });

  // 清理缓存
  arrowStyleCache.clear();

  this._map = null;
}
```

### 3. 渲染优化

```javascript
// ✅ 使用 declutter 防止标注重叠
this._nodesLayer = new VectorLayer({
  source: new Vector(),
  declutter: true, // 自动处理标注冲突
  updateWhileAnimating: false, // 动画时不更新
  updateWhileInteracting: false, // 交互时不更新
});
```

---

## 🔧 实施建议

**第一阶段 (1-2 天):**

- 添加事件节流
- 实现样式缓存
- 只处理可视范围节点

**第二阶段 (3-5 天):**

- 使用 Web Worker
- 优化动画播放
- 批量更新坐标

**第三阶段 (可选):**

- 预计算优化
- 对象池实现
- 分段渲染

---

**性能测试环境建议:**

- 测试数据: 5000+ 轨迹点
- 测试场景: 频繁缩放、快速播放
- 监控指标: FPS、内存占用、交互响应时间

---

**最后更新**: 2026-01-21
