<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 图层分组 1: 兴趣点 -->
      <v-group-layer title="兴趣点图层组" :z-index="10" :visible="groupVisible.poi" @load="onGroupLoad('poi', $event)">
        <!-- 餐饮点 -->
        <v-vector :features="poiFeatures.restaurant" :z-index="1" />
        <!-- 商场点 -->
        <v-vector :features="poiFeatures.shopping" :z-index="2" />
      </v-group-layer>

      <!-- 图层分组 2: 交通设施 -->
      <v-group-layer title="交通设施图层组" :z-index="20" :visible="groupVisible.traffic" @load="onGroupLoad('traffic', $event)">
        <!-- 地铁站 -->
        <v-vector :features="trafficFeatures.subway" :z-index="1" />
        <!-- 公交站 -->
        <v-vector :features="trafficFeatures.bus" :z-index="2" />
      </v-group-layer>
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>图层分组控制</h3>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="groupVisible.poi" @change="toggleGroup('poi')" />
          兴趣点图层组
        </label>
        <div class="sub-controls" v-if="groupVisible.poi">
          <button @click="highlightGroup('poi')">高亮显示</button>
          <button @click="fitToGroup('poi')">缩放到此组</button>
        </div>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="groupVisible.traffic" @change="toggleGroup('traffic')" />
          交通设施图层组
        </label>
        <div class="sub-controls" v-if="groupVisible.traffic">
          <button @click="highlightGroup('traffic')">高亮显示</button>
          <button @click="fitToGroup('traffic')">缩放到此组</button>
        </div>
      </div>

      <div class="stats">
        <p>POI 图层: {{ poiFeatures.restaurant.length + poiFeatures.shopping.length }} 个点</p>
        <p>交通图层: {{ trafficFeatures.subway.length + trafficFeatures.bus.length }} 个点</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector } from "@/packages";
import VGroupLayer from "@/packages/components/layers/group/index.vue";

export default {
  name: "GroupExample",
  components: {
    VMap,
    VTile,
    VVector,
    VGroupLayer,
  },
  data() {
    return {
      map: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: "EPSG:4326",
      },
      groupVisible: {
        poi: true,
        traffic: true,
      },
      groupLayers: {
        poi: null,
        traffic: null,
      },
      poiFeatures: {
        restaurant: [],
        shopping: [],
      },
      trafficFeatures: {
        subway: [],
        bus: [],
      },
    };
  },
  mounted() {
    this.initFeatures();
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[GroupExample] 地图加载完成");
    },

    onGroupLoad(type, layer) {
      this.groupLayers[type] = layer;
      console.log(`[GroupExample] ${type} 图层组加载完成`);
    },

    /**
     * 初始化要素数据
     */
    initFeatures() {
      // 餐饮点
      this.poiFeatures.restaurant = this.generateFeatures(10, {
        type: "restaurant",
        color: "rgba(239, 68, 68, 0.8)",
        name: "餐厅",
      });

      // 商场点
      this.poiFeatures.shopping = this.generateFeatures(8, {
        type: "shopping",
        color: "rgba(234, 179, 8, 0.8)",
        name: "商场",
      });

      // 地铁站
      this.trafficFeatures.subway = this.generateFeatures(6, {
        type: "subway",
        color: "rgba(59, 130, 246, 0.8)",
        name: "地铁站",
      });

      // 公交站
      this.trafficFeatures.bus = this.generateFeatures(12, {
        type: "bus",
        color: "rgba(34, 197, 94, 0.8)",
        name: "公交站",
      });
    },

    /**
     * 生成随机要素
     */
    generateFeatures(count, config) {
      const features = [];
      const centerLon = 118.0894;
      const centerLat = 24.4798;
      const spread = 0.05;

      for (let i = 0; i < count; i++) {
        const randomLon = centerLon + (Math.random() - 0.5) * spread;
        const randomLat = centerLat + (Math.random() - 0.5) * spread;

        features.push({
          type: "point",
          coordinates: [randomLon, randomLat],
          id: `${config.type}-${i + 1}`,
          style: {
            circle: {
              radius: 7,
              fill: { color: config.color },
              stroke: { color: "#fff", width: 2 },
            },
            text: {
              text: `${i + 1}`,
              fill: { color: "#fff" },
              font: "bold 12px sans-serif",
            },
          },
          properties: {
            name: `${config.name} ${i + 1}`,
            type: config.type,
          },
        });
      }

      return features;
    },

    /**
     * 切换图层组显示
     */
    toggleGroup(type) {
      const layer = this.groupLayers[type];
      if (layer) {
        layer.setVisible(this.groupVisible[type]);
      }
    },

    /**
     * 高亮显示图层组
     */
    highlightGroup(type) {
      // 临时改变透明度实现闪烁效果
      const layer = this.groupLayers[type];
      if (!layer) return;

      const originalOpacity = layer.getOpacity();
      layer.setOpacity(0.3);

      setTimeout(() => {
        layer.setOpacity(originalOpacity);
      }, 500);
    },

    /**
     * 缩放到图层组
     */
    fitToGroup(type) {
      const layer = this.groupLayers[type];
      if (!layer || !this.map) return;

      // 获取图层组的所有子图层
      const childLayers = layer.getLayers().getArray();

      // 计算所有要素的边界
      let extent = null;
      childLayers.forEach((childLayer) => {
        const source = childLayer.getSource();
        if (source && typeof source.getExtent === "function") {
          const layerExtent = source.getExtent();
          if (!extent) {
            extent = layerExtent;
          } else {
            // 合并范围
            extent = [
              Math.min(extent[0], layerExtent[0]),
              Math.min(extent[1], layerExtent[1]),
              Math.max(extent[2], layerExtent[2]),
              Math.max(extent[3], layerExtent[3]),
            ];
          }
        }
      });

      if (extent) {
        this.map.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
        });
      }
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
  min-width: 250px;
}

.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #333;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.control-group {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.control-group label {
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #333;
  cursor: pointer;
}

.control-group label input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.sub-controls {
  margin-top: 10px;
  padding-left: 24px;
  display: flex;
  gap: 5px;
}

.sub-controls button {
  flex: 1;
  padding: 6px 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.sub-controls button:hover {
  background: #40a9ff;
}

.stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.stats p {
  margin: 5px 0;
  color: #666;
  font-size: 13px;
}
</style>
