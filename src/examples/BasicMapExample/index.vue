<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad" @click="onMapClick">
      <!-- 基础瓦片图层 -->
      <v-tile :tile-type="tileType" :z-index="0" />

      <!-- 矢量图层 - 显示点标记 -->
      <v-vector :features="pointFeatures" :z-index="10" @load="onVectorLoad" />

      <!-- 覆盖物 - 信息弹窗 -->
      <v-overlay
        v-if="overlayPosition"
        :position="overlayPosition"
        positioning="bottom-center"
        :offset="[0, -10]"
        class-name="map-overlay"
      >
        <div class="overlay-content">
          <h3>{{ overlayData.title }}</h3>
          <p>{{ overlayData.description }}</p>
          <button @click="closeOverlay">关闭</button>
        </div>
      </v-overlay>
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <div class="control-group">
        <label>地图类型:</label>
        <select v-model="tileType">
          <option value="TD">天地图</option>
          <option value="TD_IMG">天地图影像</option>
          <option value="GD">高德地图</option>
          <option value="BD">百度地图</option>
        </select>
      </div>

      <div class="control-group">
        <button @click="addRandomPoint">添加随机点</button>
        <button @click="clearFeatures">清除所有</button>
        <button @click="flyToCenter">飞到中心</button>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector, VOverlay } from "@/packages";

export default {
  name: "BasicMapExample",
  components: {
    VMap,
    VTile,
    VVector,
    VOverlay,
  },
  data() {
    return {
      map: null,
      tileType: "TD",
      viewOptions: {
        center: [118.0894, 24.4798], // 厦门
        zoom: 12,
        projection: "EPSG:4326",
        minZoom: 3,
        maxZoom: 18,
      },
      pointFeatures: [],
      overlayPosition: null,
      overlayData: {
        title: "",
        description: "",
      },
    };
  },
  methods: {
    /**
     * 地图加载完成
     */
    onMapLoad(map) {
      this.map = map;
      console.log("[BasicMapExample] 地图加载完成", map);

      // 添加初始标记
      this.addInitialMarkers();
    },

    /**
     * 地图点击事件
     */
    onMapClick(evt, map) {
      const coordinate = evt.coordinate;
      console.log("[BasicMapExample] 地图点击:", coordinate);

      // 检查是否点击到要素
      const features = map.getFeaturesAtPixel(evt.pixel);
      if (features && features.length > 0) {
        const feature = features[0];
        this.showOverlay(coordinate, feature);
      } else {
        this.closeOverlay();
      }
    },

    /**
     * 矢量图层加载完成
     */
    onVectorLoad(layer, map) {
      console.log("[BasicMapExample] 矢量图层加载完成", layer);
    },

    /**
     * 添加初始标记
     */
    addInitialMarkers() {
      const markers = [
        {
          type: "point",
          coordinates: [118.0894, 24.4798],
          id: "marker-center",
          style: {
            icon: {
              src: "https://openlayers.org/en/latest/examples/data/icon.png",
              scale: 0.8,
            },
          },
          properties: {
            name: "厦门市中心",
            description: "这是厦门市中心",
          },
        },
        {
          type: "point",
          coordinates: [118.1094, 24.4898],
          id: "marker-2",
          style: {
            circle: {
              radius: 8,
              fill: { color: "rgba(255, 0, 0, 0.6)" },
              stroke: { color: "#fff", width: 2 },
            },
          },
          properties: {
            name: "标记点 2",
            description: "这是第二个标记点",
          },
        },
        {
          type: "point",
          coordinates: [118.0794, 24.4698],
          id: "marker-3",
          style: {
            circle: {
              radius: 6,
              fill: { color: "rgba(0, 255, 0, 0.6)" },
              stroke: { color: "#fff", width: 2 },
            },
          },
          properties: {
            name: "标记点 3",
            description: "这是第三个标记点",
          },
        },
      ];

      this.pointFeatures = markers;
    },

    /**
     * 添加随机点
     */
    addRandomPoint() {
      const randomLon = 118.0894 + (Math.random() - 0.5) * 0.1;
      const randomLat = 24.4798 + (Math.random() - 0.5) * 0.1;

      const newPoint = {
        type: "point",
        coordinates: [randomLon, randomLat],
        id: `marker-random-${Date.now()}`,
        style: {
          circle: {
            radius: 7,
            fill: { color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.6)` },
            stroke: { color: "#fff", width: 2 },
          },
        },
        properties: {
          name: `随机点 ${this.pointFeatures.length + 1}`,
          description: `坐标: [${randomLon.toFixed(4)}, ${randomLat.toFixed(4)}]`,
        },
      };

      this.pointFeatures = [...this.pointFeatures, newPoint];
    },

    /**
     * 清除所有要素
     */
    clearFeatures() {
      this.pointFeatures = [];
      this.closeOverlay();
    },

    /**
     * 飞到中心
     */
    flyToCenter() {
      if (this.map) {
        this.map.getView().animate({
          center: [118.0894, 24.4798],
          zoom: 12,
          duration: 1000,
        });
      }
    },

    /**
     * 显示覆盖物
     */
    showOverlay(coordinate, feature) {
      const props = feature.get("properties") || {};
      this.overlayData = {
        title: props.name || "未命名",
        description: props.description || "无描述",
      };
      this.overlayPosition = coordinate;
    },

    /**
     * 关闭覆盖物
     */
    closeOverlay() {
      this.overlayPosition = null;
    },
  },
};
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100%;
  height: 600px;
}

.control-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.control-group {
  margin-bottom: 10px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.control-group select {
  width: 100%;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.control-group button {
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 8px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.control-group button:hover {
  background: #40a9ff;
}

/* Overlay 样式 */
:deep(.map-overlay) {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 0;
  min-width: 200px;
}

.overlay-content {
  padding: 15px;
}

.overlay-content h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.overlay-content p {
  margin: 0 0 10px 0;
  color: #666;
}

.overlay-content button {
  padding: 5px 15px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.overlay-content button:hover {
  background: #40a9ff;
}
</style>
