<template>
  <div class="geojson-example">
    <v-map :view="view">
      <v-tile tile-type="BD"></v-tile>
      <!-- GeoJSON 图层 - 普通模式 -->
      <v-vector
        ref="geoJsonLayer"
        :geoJson="geoJsonData"
        :layerStyle="defaultStyle"
        @singleclick="onFeatureClick"
        @geojson-change="onGeoJsonChange"
      ></v-vector>
      <!-- GeoJSON 图层 - 聚合模式 -->
      <v-vector v-if="showCluster" :geoJson="clusterGeoJson" :cluster="clusterOptions"></v-vector>
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>GeoJSON 示例</h3>
      <div class="btn-group">
        <button @click="loadPoints">加载点数据</button>
        <button @click="loadLines">加载线数据</button>
        <button @click="loadPolygons">加载面数据</button>
        <button @click="loadMixed">加载混合数据</button>
        <button @click="loadArrowLines">加载箭头线</button>
        <button @click="toggleCluster">{{ showCluster ? "关闭" : "开启" }}聚合</button>
      </div>
      <div class="info" v-if="clickedFeature">
        <h4>点击的要素:</h4>
        <pre>{{ clickedFeature }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "GeoJsonExample",
  data() {
    return {
      view: {
        center: [116.4, 39.9],
        zoom: 10,
        projection: "EPSG:4326",
      },
      // 默认图层样式
      defaultStyle: {
        stroke: { color: "rgba(67,126,255,1)", width: 2 },
        fill: { color: "rgba(67,126,255,0.3)" },
        circle: {
          radius: 8,
          fill: { color: "rgba(255,100,100,0.8)" },
          stroke: { color: "#fff", width: 2 },
        },
      },
      // GeoJSON 数据
      geoJsonData: null,
      // 聚合相关
      showCluster: false,
      clusterGeoJson: null,
      clusterOptions: {
        distance: 40,
        style: {
          circle: {
            radius: 15,
            fill: { color: "rgba(255,153,0,0.8)" },
            stroke: { color: "#fff", width: 2 },
          },
          text: {
            font: "12px sans-serif",
            fill: { color: "#fff" },
            stroke: { color: "#333", width: 2 },
          },
        },
      },
      // 点击的要素信息
      clickedFeature: null,
    };
  },
  mounted() {
    // 初始加载点数据
    this.loadPoints();
  },
  methods: {
    // 加载点数据
    loadPoints() {
      this.geoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "point-1",
              name: "天安门",
              // 要素级别样式（优先级最高）
              style: {
                icon: {
                  src: new URL("../../assets/img/point_1.png", import.meta.url).href,
                  scale: 0.6,
                  anchor: [0.5, 1],
                },
              },
            },
            geometry: {
              type: "Point",
              coordinates: [116.397, 39.908],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "point-2",
              name: "故宫",
              // 不设置样式，使用 layerStyle
            },
            geometry: {
              type: "Point",
              coordinates: [116.403, 39.924],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "point-3",
              name: "颐和园",
              style: {
                icon: {
                  src: new URL("../../assets/img/point_2.png", import.meta.url).href,
                  scale: 0.6,
                  anchor: [0.5, 1],
                },
              },
            },
            geometry: {
              type: "Point",
              coordinates: [116.275, 39.999],
            },
          },
        ],
      };
    },

    // 加载线数据
    loadLines() {
      this.geoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "line-1",
              name: "长安街",
              style: {
                stroke: { color: "#ff0000", width: 4 },
              },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [116.3, 39.908],
                [116.397, 39.908],
                [116.5, 39.908],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "line-2",
              name: "二环路段",
              // 使用默认 layerStyle
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [116.35, 39.95],
                [116.4, 39.97],
                [116.45, 39.95],
              ],
            },
          },
        ],
      };
    },

    // 加载面数据
    loadPolygons() {
      this.geoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "polygon-1",
              name: "区域A",
              style: {
                stroke: { color: "#00ff00", width: 2 },
                fill: { color: "rgba(0,255,0,0.3)" },
              },
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [116.35, 39.88],
                  [116.42, 39.88],
                  [116.42, 39.93],
                  [116.35, 39.93],
                  [116.35, 39.88],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "polygon-2",
              name: "区域B",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [116.44, 39.9],
                  [116.52, 39.9],
                  [116.52, 39.96],
                  [116.44, 39.96],
                  [116.44, 39.9],
                ],
              ],
            },
          },
        ],
      };
    },

    // 加载混合数据
    loadMixed() {
      this.geoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { id: "mix-point", name: "混合点" },
            geometry: { type: "Point", coordinates: [116.4, 39.92] },
          },
          {
            type: "Feature",
            properties: {
              id: "mix-line",
              name: "混合线",
              style: { stroke: { color: "#9933ff", width: 3 } },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [116.35, 39.85],
                [116.45, 39.88],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "mix-polygon",
              name: "混合面",
              style: {
                stroke: { color: "#ff9933", width: 2 },
                fill: { color: "rgba(255,153,51,0.4)" },
              },
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [116.3, 39.9],
                  [116.35, 39.9],
                  [116.35, 39.95],
                  [116.3, 39.95],
                  [116.3, 39.9],
                ],
              ],
            },
          },
        ],
      };
    },

    // 加载带箭头的线数据
    loadArrowLines() {
      this.geoJsonData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "arrow-line-1",
              name: "箭头路线A",
              style: {
                stroke: { color: "#ff6600", width: 3 },
              },
              // 箭头配置
              arrow: {
                spacing: 80,
                color: "#ff6600",
                size: 12,
              },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [116.3, 39.9],
                [116.4, 39.92],
                [116.5, 39.88],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "arrow-line-2",
              name: "箭头路线B",
              style: {
                stroke: { color: "#0066ff", width: 3 },
              },
              arrow: {
                spacing: 60,
                color: "#0066ff",
                size: 10,
              },
            },
            geometry: {
              type: "LineString",
              coordinates: [
                [116.32, 39.95],
                [116.42, 39.97],
                [116.52, 39.93],
              ],
            },
          },
        ],
      };
    },

    // 切换聚合模式
    toggleCluster() {
      this.showCluster = !this.showCluster;
      if (this.showCluster) {
        // 生成聚合点数据
        const points = [];
        for (let i = 0; i < 100; i++) {
          points.push({
            type: "Feature",
            properties: {
              id: `cluster-point-${i}`,
              name: `聚合点${i}`,
            },
            geometry: {
              type: "Point",
              coordinates: [116.2 + Math.random() * 0.4, 39.8 + Math.random() * 0.3],
            },
          });
        }
        this.clusterGeoJson = {
          type: "FeatureCollection",
          features: points,
        };
      }
    },

    // 要素点击事件
    onFeatureClick(evt, feature) {
      if (feature) {
        this.clickedFeature = {
          id: feature.get("id"),
          name: feature.get("name"),
          type: feature.get("type"),
        };
      } else {
        this.clickedFeature = null;
      }
    },

    // GeoJSON 数据变化事件
    onGeoJsonChange(features) {
      console.log("GeoJSON 要素已更新:", features.length, "个要素");
    },
  },
};
</script>

<style scoped>
.geojson-example {
  width: 100%;
  height: 100vh;
  position: relative;
}

.control-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  max-width: 320px;
  z-index: 100;
}

.control-panel h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-group button {
  padding: 8px 12px;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s;
}

.btn-group button:hover {
  background: #357abd;
}

.info {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
}

.info pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  margin: 0;
  overflow-x: auto;
}
</style>
