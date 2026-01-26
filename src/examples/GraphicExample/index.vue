<template>
  <div class="graphic-example">
    <v-map ref="map" :options="mapOptions" @bindbindbindbindbindbindMap="bindMap">
      <!-- 底图 -->
      <v-tile source-type="XYZ" :source="{ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }" :z-index="0" />

      <!-- Canvas 图形图层 -->
      <v-graphic
        v-if="showGraphic"
        ref="graphicLayer"
        :features="graphicFeatures"
        :feature-style="defaultGraphicStyle"
        :z-index="10"
        :opacity="graphicOpacity"
        @load="onGraphicLoad"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>VGraphic 组件示例</h3>

      <div class="control-group">
        <h4>基本设置</h4>
        <label>
          <input type="checkbox" v-model="showGraphic" />
          显示图形图层
        </label>
        <label>
          透明度: {{ graphicOpacity.toFixed(1) }}
          <input type="range" v-model.number="graphicOpacity" min="0" max="1" step="0.1" />
        </label>
      </div>

      <div class="control-group">
        <h4>图形数量: {{ graphicFeatures.length }}</h4>
        <button @click="addRandomFeatures(10)">添加 10 个点</button>
        <button @click="addRandomFeatures(100)">添加 100 个点</button>
        <button @click="clearFeatures">清除所有</button>
      </div>

      <div class="control-group">
        <h4>默认样式</h4>
        <label>
          圆点半径:
          <input type="number" v-model.number="circleRadius" min="3" max="20" @change="updateStyle" />
        </label>
        <label>
          填充颜色:
          <input type="color" v-model="fillColor" @change="updateStyle" />
        </label>
        <label>
          边框颜色:
          <input type="color" v-model="strokeColor" @change="updateStyle" />
        </label>
      </div>

      <div class="control-group">
        <h4>说明</h4>
        <p>
          VGraphic 使用 Canvas 渲染图形，适用于需要高性能渲染大量简单图形的场景。 相比 Vector 图层，Canvas
          渲染在大量点位时性能更好。
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VGraphic } from "@/packages";

export default {
  name: "GraphicExample",
  components: {
    VMap,
    VTile,
    VGraphic,
  },
  data() {
    return {
      mapOptions: {
        view: {
          center: [118.0894, 24.4798],
          zoom: 10,
          projection: "EPSG:4326",
        },
      },
      showGraphic: true,
      graphicOpacity: 1,
      graphicFeatures: [],
      circleRadius: 6,
      fillColor: "#3399CC",
      strokeColor: "#ffffff",
      defaultGraphicStyle: {
        circle: {
          radius: 6,
          fill: { color: "#3399CC" },
          stroke: { color: "#ffffff", width: 2 },
        },
      },
    };
  },
  created() {
    // 初始化一些随机点位
    this.addRandomFeatures(50);
  },
  methods: {
    bindMap(map) {
      console.log("[GraphicExample] Map bindbound:", map);
    },

    onGraphicLoad(layer, map) {
      console.log("[GraphicExample] Graphic layer loaded:", layer);
    },

    /**
     * 添加随机点位
     */
    addRandomFeatures(count) {
      const center = [118.0894, 24.4798];
      const features = [];

      for (let i = 0; i < count; i++) {
        const lng = center[0] + (Math.random() - 0.5) * 0.5;
        const lat = center[1] + (Math.random() - 0.5) * 0.5;

        features.push({
          id: `point-${Date.now()}-${i}`,
          coordinates: [lng, lat],
          name: `Point ${this.graphicFeatures.length + i + 1}`,
          // 可选：为每个点自定义样式
          // style: {
          //   circle: {
          //     radius: Math.random() * 10 + 3,
          //     fill: { color: this.getRandomColor() },
          //     stroke: { color: '#fff', width: 1 }
          //   }
          // }
        });
      }

      this.graphicFeatures = [...this.graphicFeatures, ...features];
    },

    /**
     * 清除所有点位
     */
    clearFeatures() {
      this.graphicFeatures = [];
    },

    /**
     * 更新默认样式
     */
    updateStyle() {
      this.defaultGraphicStyle = {
        circle: {
          radius: this.circleRadius,
          fill: { color: this.fillColor },
          stroke: { color: this.strokeColor, width: 2 },
        },
      };

      // 刷新图层
      this.$nextTick(() => {
        if (this.$refs.graphicLayer) {
          this.$refs.graphicLayer.refresh();
        }
      });
    },

    /**
     * 获取随机颜色
     */
    getRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
  },
};
</script>

<style scoped>
.graphic-example {
  width: 100%;
  height: 100%;
  position: relative;
}

.control-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  max-height: calc(100% - 40px);
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.control-group {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.control-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-group h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #666;
}

.control-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #555;
}

.control-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.control-group input[type="range"] {
  flex: 1;
  height: 4px;
}

.control-group input[type="number"] {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group input[type="color"] {
  width: 40px;
  height: 24px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.control-group button {
  padding: 6px 12px;
  margin-right: 8px;
  margin-bottom: 8px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.control-group button:hover {
  background: #66b1ff;
}

.control-group p {
  margin: 0;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}
</style>
