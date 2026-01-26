# VVector 组件事件回调测试说明

## 问题说明

用户反馈：**singleclick 回调没有返回 feature**

## 问题原因

经过检查，发现是**用户代码逻辑错误**，而不是组件 bug。

### VVector 组件的事件处理机制（正确）

```javascript
// src/packages/components/layers/vector/index.vue (第 440-444 行)
eventHandler(listenerKey, evt) {
  const { pixel } = evt;
  const feature = this.getFeatureAtPixel(pixel);  // ✅ 正确获取 feature
  this.$emit(listenerKey, evt, feature);          // ✅ 正确传递 feature
}
```

**流程**：

1. 地图事件触发（singleclick、pointermove、dblclick）
2. `eventHandler` 被调用
3. 通过 `getFeatureAtPixel` 获取点击位置的 feature
4. 通过 `$emit` 将 `evt` 和 `feature` 一起传递给父组件

**结论**：✅ VVector 组件的事件传递机制是**完全正确**的。

---

## 用户代码错误

### 错误代码（用户添加的）

```javascript
onClickFeature(evt, feature) {
  console.log("feature", feature);
  const hoveredId = feature ? feature.get("id") : null;

  // ❌ 错误：这是 hover 效果的逻辑，不应该在 click 事件中
  if (hoveredId === this.currentHoverId) {
    return;
  }

  this.currentHoverId = hoveredId;

  // ❌ 错误：在 click 事件中调用 hover 样式更新
  this.$refs.vectorLayer.setHoverEffect(
    hoveredId,
    { icon: { scale: 0.6, src: this.hoverIconSrc } },
    { icon: { scale: 0.6, src: this.normalIconSrc } }
  );
}
```

**问题分析**：

1. 用户误将 `pointermove` 的逻辑复制到了 `onClickFeature`
2. `onClickFeature` 应该处理点击业务逻辑，而不是 hover 样式
3. feature 参数是**正确传递**的，但被错误使用了

---

## 正确用法

### 1. 点击事件（onClickFeature）

```javascript
onClickFeature(evt, feature) {
  console.log("feature", feature);  // ✅ feature 正确传递

  // ✅ 正确：处理点击业务逻辑
  if (feature) {
    const featureId = feature.get("id");
    const featureName = feature.get("name") || feature.getProperties().name;

    console.log("点击了要素:", {
      id: featureId,
      name: featureName,
      properties: feature.getProperties()
    });

    // 可以添加点击后的业务逻辑
    // - 显示详情弹窗
    // - 高亮选中
    // - 跳转到详情页
    // - 播放动画等
  } else {
    console.log("点击了空白区域");
  }
}
```

---

### 2. 移动事件（pointermove）

```javascript
pointermove(evt, feature) {
  const hoveredId = feature ? feature.get("id") : null;

  // ✅ 正确：只在 hover 状态改变时更新
  if (hoveredId === this.currentHoverId) {
    return;
  }

  this.currentHoverId = hoveredId;

  // ✅ 正确：在 hover 事件中更新样式
  this.$refs.vectorLayer.setHoverEffect(
    hoveredId,
    { icon: { scale: 0.6, src: this.hoverIconSrc } },  // hover 样式
    { icon: { scale: 0.6, src: this.normalIconSrc } }   // 正常样式
  );
}
```

---

## 测试验证

### 测试步骤

1. **打开浏览器控制台**
2. **点击地图上的要素**
3. **查看控制台输出**

### 预期结果

```javascript
// ✅ 点击要素时应该看到：
feature Feature {
  values_: {
    id: "point2",
    name: "feature2",
    coordinates: [118.168742, 24.487505],
    // ...
  }
}

点击了要素: {
  id: "point2",
  name: "feature2",
  properties: { ... }
}
```

```javascript
// ✅ 点击空白区域时应该看到：
feature undefined

点击了空白区域
```

---

## 事件回调参数说明

VVector 组件的所有事件回调都遵循相同的参数格式：

```javascript
@singleclick="onSingleClick"   // (evt, feature) => void
@pointermove="onPointerMove"   // (evt, feature) => void
@dblclick="onDblClick"         // (evt, feature) => void
```

### 参数说明

| 参数      | 类型                 | 说明                                                           |
| --------- | -------------------- | -------------------------------------------------------------- |
| `evt`     | Object               | OpenLayers 事件对象，包含 pixel、coordinate 等信息             |
| `feature` | Feature \| undefined | 点击位置的 OpenLayers Feature 对象，如果点击空白则为 undefined |

### Feature 对象方法

```javascript
feature.get("id"); // 获取属性值
feature.getId(); // 获取 Feature ID
feature.getProperties(); // 获取所有属性
feature.getGeometry(); // 获取几何对象
feature.getGeometry().getType(); // 获取几何类型
```

---

## 常见误区

### ❌ 误区 1：认为组件没有传递 feature

**错误理解**：以为组件的事件回调不会传递 feature

**实际情况**：✅ 组件**正确传递**了 feature，是用户代码逻辑错误

---

### ❌ 误区 2：在错误的事件中处理逻辑

**错误做法**：在 `onClickFeature` 中处理 hover 样式

**正确做法**：

- `onClickFeature` → 处理点击业务逻辑
- `pointermove` → 处理 hover 样式

---

### ❌ 误区 3：修改 data 数组触发响应式

**错误做法**：

```javascript
this.features[0].style.icon.src = newIcon; // ❌ 触发 Vue 响应式
```

**正确做法**：

```javascript
this.$refs.vectorLayer.updateFeatureStyle("id", {
  icon: { src: newIcon },
}); // ✅ 直接操作 OpenLayers
```

---

## 总结

1. ✅ **VVector 组件的事件机制完全正确**
2. ✅ **feature 参数正确传递**
3. ❌ **用户代码逻辑错误**：误将 hover 逻辑放在 click 事件中
4. ✅ **已修复**：将点击事件和移动事件的逻辑正确分离

---

## 相关文件

- 组件实现：`/src/packages/components/layers/vector/index.vue` (第 440-444 行)
- 原始示例：`/src/examples/FeatureClick/index.vue`
- 优化示例：`/src/examples/FeatureClick/index-optimized.vue` (已修复)
