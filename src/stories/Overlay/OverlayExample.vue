<template>
  <div class="overlay-example">
    <v-map ref="map" :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-vector :features="features" @singleclick="onClickFeature" />
      <v-overlay
        ref="popup"
        :position="popupPosition"
        :positioning="'bottom-center'"
        :offset="[0, -10]"
        :auto-pan="true"
        class-name="custom-popup"
      >
        <div v-if="selectedFeature" class="popup-content">
          <div class="popup-header">
            <span>{{ selectedFeature.name }}</span>
            <button class="close-btn" @click="closePopup">×</button>
          </div>
          <div class="popup-body">
            <p>坐标: {{ formatCoords(selectedFeature.coordinates) }}</p>
            <p>等级: {{ selectedFeature.level }}</p>
          </div>
        </div>
      </v-overlay>
    </v-map>
    <div class="tip">点击地图上的点标记查看弹窗</div>
  </div>
</template>

<script>
import { VMap, VTile, VVector, VOverlay } from "v-ol-map";

export default {
  name: "OverlayExample",
  components: { VMap, VTile, VVector, VOverlay },
  data() {
    return {
      view: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: "EPSG:4326",
      },
      map: null,
      features: [
        {
          id: "point1",
          coordinates: [118.08, 24.47],
          style: {
            circle: {
              radius: 10,
              fill: { color: "#1890ff" },
              stroke: { color: "#fff", width: 2 },
            },
          },
          properties: { name: "点位 A", level: 1 },
        },
        {
          id: "point2",
          coordinates: [118.1, 24.49],
          style: {
            circle: {
              radius: 10,
              fill: { color: "#52c41a" },
              stroke: { color: "#fff", width: 2 },
            },
          },
          properties: { name: "点位 B", level: 2 },
        },
        {
          id: "point3",
          coordinates: [118.09, 24.46],
          style: {
            circle: {
              radius: 10,
              fill: { color: "#f5222d" },
              stroke: { color: "#fff", width: 2 },
            },
          },
          properties: { name: "点位 C", level: 3 },
        },
      ],
      popupPosition: undefined,
      selectedFeature: null,
    };
  },
  methods: {
    onClickFeature(evt, feature) {
      if (feature) {
        const coordinates = feature.get("coordinates") || feature.getGeometry()?.getCoordinates();
        this.selectedFeature = {
          name: feature.get("name") || feature.get("properties")?.name || "未知",
          coordinates: coordinates,
          level: feature.get("level") || feature.get("properties")?.level || "-",
        };
        this.popupPosition = coordinates;
      } else {
        this.closePopup();
      }
    },
    closePopup() {
      this.popupPosition = undefined;
      this.selectedFeature = null;
    },
    formatCoords(coords) {
      if (!coords) return "-";
      return `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
    },
  },
};
</script>

<style scoped>
.overlay-example {
  position: relative;
}
.tip {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
}
</style>

<style>
/* Popup 样式需要全局 */
.custom-popup {
  background: transparent;
}
.popup-content {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  overflow: hidden;
}
.popup-content::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-top-color: #fff;
  border-bottom: 0;
}
.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #1890ff;
  color: #fff;
  font-weight: bold;
}
.close-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}
.popup-body {
  padding: 15px;
}
.popup-body p {
  margin: 5px 0;
  font-size: 14px;
  color: #333;
}
</style>
