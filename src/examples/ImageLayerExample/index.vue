<template>
  <div class="map-container">
    <v-map :width="'100%'" :height="'600px'" :view="viewOptions" @load="onMapLoad">
      <!-- 基础瓦片图层 -->
      <v-tile tile-type="TD" :z-index="0" />

      <!-- 静态图片图层 -->
      <v-image
        v-if="showStaticImage"
        source-type="Static"
        :image-url="staticImageUrl"
        :image-extent="staticImageExtent"
        :opacity="imageOpacity"
        :z-index="10"
        @load="onImageLoad"
      />

      <!-- WMS 图层 -->
      <v-image v-if="showWMSImage" source-type="WMS" :wms="wmsConfig" :opacity="wmsOpacity" :z-index="11" @load="onWMSLoad" />

      <!-- GeoImage 图层 (ol-ext) -->
      <v-image
        v-if="showGeoImage"
        source-type="GeoImage"
        :source="geoImageConfig"
        :opacity="geoImageOpacity"
        :z-index="12"
        ref="geoImageLayer"
        @load="onGeoImageLoad"
      />
    </v-map>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>图片图层控制</h3>

      <!-- 静态图片控制 -->
      <div class="control-group">
        <h4>静态图片图层</h4>
        <label>
          <input type="checkbox" v-model="showStaticImage" />
          显示静态图片
        </label>
        <div v-if="showStaticImage" class="sub-controls">
          <label>
            透明度: {{ imageOpacity.toFixed(2) }}
            <input type="range" v-model.number="imageOpacity" min="0" max="1" step="0.1" />
          </label>
          <select v-model="currentStaticImage">
            <option value="0">示例图片 1</option>
            <option value="1">示例图片 2</option>
          </select>
        </div>
      </div>

      <!-- WMS 图层控制 -->
      <div class="control-group">
        <h4>WMS 图层</h4>
        <label>
          <input type="checkbox" v-model="showWMSImage" />
          显示 WMS 图层
        </label>
        <div v-if="showWMSImage" class="sub-controls">
          <label>
            透明度: {{ wmsOpacity.toFixed(2) }}
            <input type="range" v-model.number="wmsOpacity" min="0" max="1" step="0.1" />
          </label>
          <button @click="refreshWMS">刷新 WMS</button>
        </div>
      </div>

      <!-- GeoImage 控制 -->
      <div class="control-group">
        <h4>GeoImage 图层 (ol-ext)</h4>
        <label>
          <input type="checkbox" v-model="showGeoImage" />
          显示 GeoImage
        </label>
        <div v-if="showGeoImage" class="sub-controls">
          <label>
            透明度: {{ geoImageOpacity.toFixed(2) }}
            <input type="range" v-model.number="geoImageOpacity" min="0" max="1" step="0.1" />
          </label>
          <label>
            旋转角度: {{ geoImageRotation }}°
            <input type="range" v-model.number="geoImageRotation" min="0" max="360" step="15" @input="updateGeoImageRotation" />
          </label>
          <label>
            缩放比例: {{ geoImageScale.toFixed(2) }}
            <input type="range" v-model.number="geoImageScale" min="0.5" max="3" step="0.1" @input="updateGeoImageScale" />
          </label>
        </div>
      </div>

      <!-- 信息展示 -->
      <div class="info">
        <h4>💡 使用说明</h4>
        <ul>
          <li><b>Static</b>: 显示指定范围的静态图片</li>
          <li><b>WMS</b>: Web Map Service 服务</li>
          <li><b>GeoImage</b>: 支持旋转、缩放的图片 (ol-ext)</li>
        </ul>
      </div>

      <!-- 坐标信息 -->
      <div class="coordinate-info" v-if="currentCoordinate">
        <h4>当前坐标</h4>
        <p>经度: {{ currentCoordinate[0].toFixed(6) }}</p>
        <p>纬度: {{ currentCoordinate[1].toFixed(6) }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile } from "@/packages";
import VImage from "@/packages/components/layers/image/index.vue";

export default {
  name: "ImageLayerExample",
  components: {
    VMap,
    VTile,
    VImage,
  },
  data() {
    return {
      map: null,
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: "EPSG:4326",
      },
      // 静态图片配置
      showStaticImage: true,
      imageOpacity: 0.7,
      currentStaticImage: "0",
      staticImages: [
        {
          url: "https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.png",
          extent: [117.9, 24.3, 118.3, 24.7],
        },
        {
          url: "https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.png",
          extent: [117.8, 24.2, 118.4, 24.8],
        },
      ],
      // WMS 配置
      showWMSImage: false,
      wmsOpacity: 0.8,
      wmsConfig: {
        url: "https://ahocevar.com/geoserver/wms",
        params: {
          LAYERS: "ne:NE1_HR_LC_SR_W_DR",
          TILED: true,
        },
        serverType: "geoserver",
        crossOrigin: "anonymous",
      },
      // GeoImage 配置 (ol-ext)
      showGeoImage: false,
      geoImageOpacity: 0.8,
      geoImageRotation: 0,
      geoImageScale: 1,
      geoImageConfig: {
        url: "https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.png",
        imageCenter: [118.0894, 24.4798],
        imageRotate: 0,
        imageScale: [0.001, 0.001],
      },
      currentCoordinate: null,
    };
  },
  computed: {
    staticImageUrl() {
      return this.staticImages[this.currentStaticImage].url;
    },
    staticImageExtent() {
      return this.staticImages[this.currentStaticImage].extent;
    },
  },
  watch: {
    currentStaticImage() {
      // 切换图片时自动缩放到图片范围
      if (this.map && this.showStaticImage) {
        this.$nextTick(() => {
          this.fitToImageExtent();
        });
      }
    },
  },
  methods: {
    onMapLoad(map) {
      this.map = map;
      console.log("[ImageLayerExample] 地图加载完成");

      // 监听鼠标移动，显示坐标
      map.on("pointermove", (evt) => {
        this.currentCoordinate = evt.coordinate;
      });
    },

    onImageLoad(layer, map) {
      console.log("[ImageLayerExample] 静态图片图层加载完成");
      this.fitToImageExtent();
    },

    onWMSLoad(layer, map) {
      console.log("[ImageLayerExample] WMS 图层加载完成");
    },

    onGeoImageLoad(layer, map) {
      console.log("[ImageLayerExample] GeoImage 图层加载完成");
    },

    /**
     * 更新 GeoImage 旋转角度
     */
    updateGeoImageRotation() {
      if (this.$refs.geoImageLayer) {
        const radians = (this.geoImageRotation * Math.PI) / 180;
        this.$refs.geoImageLayer.setImageRotation(radians);
      }
    },

    /**
     * 更新 GeoImage 缩放比例
     */
    updateGeoImageScale() {
      if (this.$refs.geoImageLayer) {
        const scale = this.geoImageScale * 0.001;
        this.$refs.geoImageLayer.setImageScale([scale, scale]);
      }
    },

    /**
     * 缩放到图片范围
     */
    fitToImageExtent() {
      if (!this.map) return;

      const extent = this.staticImageExtent;
      this.map.getView().fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    },

    /**
     * 刷新 WMS 图层
     */
    refreshWMS() {
      console.log("[ImageLayerExample] 刷新 WMS 图层");
      // 可以通过修改 WMS 参数来刷新
      this.wmsConfig = {
        ...this.wmsConfig,
        params: {
          ...this.wmsConfig.params,
          _t: Date.now(), // 添加时间戳强制刷新
        },
      };
    },

    /**
     * 切换到图片中心
     */
    centerOnImage() {
      if (!this.map) return;

      const extent = this.staticImageExtent;
      const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2];

      this.map.getView().animate({
        center: center,
        zoom: 14,
        duration: 1000,
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
  min-width: 280px;
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

.control-group input[type="range"] {
  flex: 1;
  margin-left: 10px;
}

.sub-controls {
  margin-top: 10px;
  padding-left: 10px;
  border-left: 2px solid #1890ff;
}

.sub-controls select {
  width: 100%;
  padding: 6px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  margin-top: 8px;
}

.sub-controls button {
  width: 100%;
  padding: 8px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  transition: background 0.3s;
}

.sub-controls button:hover {
  background: #40a9ff;
}

.info {
  padding: 10px;
  background: #e6f7ff;
  border-left: 3px solid #1890ff;
  border-radius: 4px;
  margin-bottom: 15px;
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

.coordinate-info {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

.coordinate-info h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
}

.coordinate-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #333;
  font-family: monospace;
}
</style>
