<template>
  <v-map :view="view">
    <v-tile tile-type="BD"></v-tile>
    <v-vector ref="vectorLayer" :features="features" @singleclick="onClickFeature" @pointermove="pointermove"></v-vector>
    <v-vector ref="vectorLayer2" :features="markers" @singleclick="onClickMarker" @dblclick="onDblclick"></v-vector>
    <v-vector ref="vectorLayer3" :features="features3"></v-vector>
  </v-map>
</template>

<script>
/**
 * 优化后的 FeatureClick 示例
 *
 * 性能优化要点：
 * 1. 使用 VVector 组件的 setHoverEffect 方法直接修改样式
 * 2. 避免修改 data 中的 features 数组，不触发 Vue 响应式
 * 3. pointermove 事件已在 VVector 组件内部使用 RAF 节流
 * 4. 使用样式缓存，避免重复创建样式对象
 * 5. 只在 hover 状态改变时才更新样式
 */
export default {
  name: "FeatureClickOptimized",
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      features: [
        {
          id: "point2",
          coordinates: [118.168742, 24.487505],
          style: {
            zIndex: 1,
            icon: {
              scale: 0.6,
              src: new URL("../../assets/img/point_4.png", import.meta.url).href,
            },
          },
          properties: {
            name: "feature2",
            level: 2,
          },
        },
      ],
      markers: [
        {
          id: "point3",
          coordinates: [118.1401534526062, 24.461376055501933],
          style: {
            icon: {
              scale: 0.6,
              src: new URL("../../assets/img/point_2.png", import.meta.url).href,
            },
          },
          properties: {
            level: 3,
            name: "point3",
          },
        },
      ],
      features3: [],
      // 缓存图片 URL，避免重复创建
      normalIconSrc: new URL("../../assets/img/point_4.png", import.meta.url).href,
      hoverIconSrc: new URL("../../assets/img/point_1.png", import.meta.url).href,
      currentHoverId: null, // 当前 hover 的要素ID
    };
  },
  methods: {
    onClickFeature(evt, feature) {
      console.log("feature", feature);
    },
    onClickMarker(evt, feature) {
      //   console.log("feature", feature);
      const hoveredId = feature ? feature.get("id") : null;
      // 只在 hover 状态改变时才更新
      if (hoveredId && hoveredId === this.currentHoverId) {
        return;
      }

      this.currentHoverId = hoveredId;

      // 使用 VVector 组件的高性能方法
      this.$refs.vectorLayer2.setHoverEffect(
        hoveredId,
        // hover 样式
        {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: this.hoverIconSrc,
          },
        },
        // 正常样式
        {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: new URL("../../assets/img/point_2.png", import.meta.url).href,
          },
        }
      );
    },
    onDblclick(evt, feature) {
      console.log("onDblclick", feature);
    },

    /**
     * 优化方案 1: 使用 setHoverEffect（推荐）
     * 性能最优，一次性处理所有要素的样式更新
     */
    pointermove(evt, feature) {
      const hoveredId = feature ? feature.get("id") : null;

      // 只在 hover 状态改变时才更新
      if (hoveredId === this.currentHoverId) {
        return;
      }

      this.currentHoverId = hoveredId;

      // 使用 VVector 组件的高性能方法
      this.$refs.vectorLayer.setHoverEffect(
        hoveredId,
        // hover 样式
        {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: this.hoverIconSrc,
          },
        },
        // 正常样式
        {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: this.normalIconSrc,
          },
        }
      );
    },

    /**
     * 优化方案 2: 使用 updateFeatureStyle（单个更新）
     * 适用于只需更新单个要素的场景
     */
    pointermoveAlt1(evt, feature) {
      const hoveredId = feature ? feature.get("id") : null;

      if (hoveredId === this.currentHoverId) {
        return;
      }

      // 恢复之前 hover 要素的样式
      if (this.currentHoverId) {
        this.$refs.vectorLayer.updateFeatureStyle(this.currentHoverId, {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: this.normalIconSrc,
          },
        });
      }

      // 设置新 hover 要素的样式
      if (hoveredId) {
        this.$refs.vectorLayer.updateFeatureStyle(hoveredId, {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: this.hoverIconSrc,
          },
        });
      }

      this.currentHoverId = hoveredId;
    },

    /**
     * 优化方案 3: 使用 batchUpdateFeatureStyles（批量更新）
     * 适用于需要同时更新多个要素的场景
     */
    pointermoveAlt2(evt, feature) {
      const hoveredId = feature ? feature.get("id") : null;

      if (hoveredId === this.currentHoverId) {
        return;
      }

      this.currentHoverId = hoveredId;

      // 批量更新所有要素
      const updates = this.features.map((f) => ({
        id: f.id,
        style: {
          zIndex: 1,
          icon: {
            scale: 0.6,
            src: f.id === hoveredId ? this.hoverIconSrc : this.normalIconSrc,
          },
        },
      }));

      this.$refs.vectorLayer.batchUpdateFeatureStyles(updates);
    },
  },
};
</script>

<style scoped></style>
