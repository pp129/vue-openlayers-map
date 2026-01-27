<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 主地图瓦片图层（带鹰眼图配置） -->
      <v-tile :tile-type="mainTileType" :z-index="0" :overview-map="overviewMapConfig" />

      <!-- 矢量图层 - 显示一些标记 -->
      <v-vector :features="pointFeatures" :z-index="10" />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>鹰眼地图控制</h3>

      <div class="control-group">
        <h4>主地图类型</h4>
        <select v-model="mainTileType">
          <option value="TD">天地图</option>
          <option value="GD">高德</option>
          <option value="BD">百度</option>
          <option value="OSM">OpenStreetMap</option>
        </select>
      </div>

      <div class="control-group">
        <h4>鹰眼地图类型</h4>
        <select v-model="overviewTileType" @change="updateOverviewTileType">
          <option value="TD">天地图</option>
          <option value="GD">高德</option>
          <option value="BD">百度</option>
          <option value="OSM">OpenStreetMap</option>
        </select>
      </div>

      <div class="control-group">
        <h4>鹰眼配置</h4>
        <label>
          <input type="checkbox" v-model="collapsed" @change="updateCollapsed" />
          默认收起
        </label>
        <label>
          <input type="checkbox" v-model="collapsible" @change="updateCollapsible" />
          可折叠
        </label>
        <label>
          <input type="checkbox" v-model="rotateWithView" @change="updateRotateWithView" />
          跟随主地图旋转
        </label>
      </div>

      <div class="actions">
        <button @click="toggleOverview">切换鹰眼显示</button>
        <button @click="rotateMap">旋转主地图</button>
        <button @click="resetRotation">重置旋转</button>
      </div>

      <div class="info">
        <h4>💡 功能说明</h4>
        <ul>
          <li>鹰眼地图提供全局视图</li>
          <li>可独立配置地图类型</li>
          <li>支持收起/展开</li>
          <li>支持跟随主地图旋转</li>
          <li>点击鹰眼可快速定位</li>
        </ul>
      </div>

      <div class="tip">
        <h4>🔧 实现方式</h4>
        <p>使用 v-tile 组件的 <code>overviewMap</code> 属性配置鹰眼图</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VVector } from "v-ol-map";

export default {
  name: "OverviewMapExample",
  components: {
    VMap,
    VTile,
    VVector,
  },
  data() {
    return {
      map: null,
      overviewControl: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 12,
        projection: "EPSG:4326",
        rotation: 0,
      },
      mainTileType: "TD",
      overviewTileType: "GD",
      collapsed: false,
      collapsible: true,
      rotateWithView: false,
      pointFeatures: [],
      currentRotation: 0,
    };
  },
  computed: {
    /**
     * 鹰眼地图配置对象
     */
    overviewMapConfig() {
      return {
        collapsed: this.collapsed,
        collapsible: this.collapsible,
        rotateWithView: this.rotateWithView,
        view: {
          projection: "EPSG:4326",
        },
        tileType: this.overviewTileType,
        // 鹰眼图使用的地图类型通过 v-tile 的 tileType 动态切换
      };
    },
  },
  mounted() {
    this.initFeatures();
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[OverviewMapExample] 地图加载完成");

      // 获取鹰眼控件实例（需要在地图加载后获取）
      this.$nextTick(() => {
        this.getOverviewControl();
      });
    },

    /**
     * 获取鹰眼控件实例
     */
    getOverviewControl() {
      if (!this.map) return;

      const controls = this.map.getControls().getArray();
      this.overviewControl = controls.find((control) => control.constructor.name === "OverviewMap");

      if (this.overviewControl) {
        console.log("[OverviewMapExample] 鹰眼地图控件已获取");
      }
    },

    /**
     * 初始化标记点
     */
    initFeatures() {
      const centerLon = 118.0894;
      const centerLat = 24.4798;
      const spread = 0.1;

      for (let i = 0; i < 5; i++) {
        const randomLon = centerLon + (Math.random() - 0.5) * spread;
        const randomLat = centerLat + (Math.random() - 0.5) * spread;

        this.pointFeatures.push({
          type: "point",
          coordinates: [randomLon, randomLat],
          style: {
            circle: {
              radius: 8,
              fill: { color: "rgba(255, 0, 0, 0.8)" },
              stroke: { color: "#fff", width: 2 },
            },
            text: {
              text: `标记 ${i + 1}`,
              fill: { color: "#fff" },
              offsetY: -20,
              font: "bold 12px sans-serif",
              backgroundFill: { color: "rgba(0, 0, 0, 0.7)" },
              padding: [2, 4, 2, 4],
            },
          },
        });
      }
    },

    /**
     * 更新鹰眼地图类型（需要手动触发）
     */
    updateOverviewTileType() {
      // 注意：v-tile 的 overviewMap 会在 tileType watch 中自动重建
      // 这里只需要触发响应式更新
      console.log(`[OverviewMapExample] 鹰眼地图类型切换为: ${this.overviewTileType}`);
      // 实际实现中，需要 v-tile 支持动态切换鹰眼图层类型
      // 当前实现鹰眼图使用主图层相同的类型
    },

    /**
     * 更新折叠状态
     */
    updateCollapsed() {
      if (this.overviewControl) {
        this.overviewControl.setCollapsed(this.collapsed);
      }
    },

    /**
     * 更新可折叠状态
     */
    updateCollapsible() {
      if (this.overviewControl) {
        this.overviewControl.setCollapsible(this.collapsible);
      }
    },

    /**
     * 更新旋转跟随
     */
    updateRotateWithView() {
      if (this.overviewControl) {
        this.overviewControl.setRotateWithView(this.rotateWithView);
      }
    },

    /**
     * 切换鹰眼显示
     */
    toggleOverview() {
      if (!this.overviewControl) {
        this.getOverviewControl();
      }

      if (this.overviewControl) {
        const currentCollapsed = this.overviewControl.getCollapsed();
        this.overviewControl.setCollapsed(!currentCollapsed);
        this.collapsed = !currentCollapsed;
      }
    },

    /**
     * 旋转主地图
     */
    rotateMap() {
      if (!this.map) return;

      this.currentRotation += Math.PI / 4; // 每次旋转 45 度

      this.map.getView().animate({
        rotation: this.currentRotation,
        duration: 500,
      });
    },

    /**
     * 重置旋转
     */
    resetRotation() {
      if (!this.map) return;

      this.currentRotation = 0;

      this.map.getView().animate({
        rotation: 0,
        duration: 500,
      });
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
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 260px;
  max-height: 580px;
  overflow-y: auto;
}

.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
  border-bottom: 2px solid #1890ff;
  padding-bottom: 8px;
}

.control-panel h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  font-weight: 600;
}

.control-group {
  margin-bottom: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

.control-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.control-group label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
}

.control-group label:last-child {
  margin-bottom: 0;
}

.control-group input[type="checkbox"] {
  margin-right: 8px;
  cursor: pointer;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.actions button {
  padding: 10px 15px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.actions button:hover {
  background: #40a9ff;
}

.info {
  padding: 10px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  border-radius: 4px;
}

.info h4 {
  margin: 0 0 8px 0;
  color: #1890ff;
  font-size: 13px;
}

.info ul {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #666;
}

.info li {
  margin-bottom: 4px;
}

.info li:last-child {
  margin-bottom: 0;
}

.tip {
  padding: 10px;
  background: #fff7e6;
  border-left: 3px solid #faad14;
  border-radius: 4px;
  margin-top: 15px;
}

.tip h4 {
  margin: 0 0 8px 0;
  color: #faad14;
  font-size: 13px;
}

.tip p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.tip code {
  padding: 2px 6px;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  color: #d4380d;
}

/* 自定义鹰眼地图样式 */
:deep(.ol-overviewmap) {
  bottom: 10px;
  left: 10px;
  right: auto;
}

:deep(.ol-overviewmap:not(.ol-collapsed)) {
  border: 2px solid #1890ff;
  border-radius: 4px;
}

:deep(.ol-overviewmap button) {
  background-color: #1890ff;
  color: white;
}

:deep(.ol-overviewmap button:hover) {
  background-color: #40a9ff;
}
</style>
