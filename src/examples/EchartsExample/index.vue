<template>
  <div class="echarts-example">
    <v-map ref="map" :options="mapOptions">
      <v-tile source-type="XYZ" :source="{ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png' }" :z-index="0" />
      <v-echarts
        v-if="showEcharts"
        ref="echartsLayer"
        :chart-options="chartOptions"
        :options="layerOptions"
        :visible="echartsVisible"
        :z-index="10"
      />
    </v-map>
    <div class="control-panel">
      <h3>VEcharts 组件示例</h3>
      <div class="control-group">
        <h4>基本设置</h4>
        <label>
          <input type="checkbox" v-model="showEcharts" />
          启用 ECharts 图层
        </label>
        <label>
          <input type="checkbox" v-model="echartsVisible" />
          显示/隐藏
        </label>
      </div>
      <div class="control-group">
        <h4>图表类型</h4>
        <select v-model="chartType" @change="updateChartType">
          <option value="effectScatter">涟漪散点图</option>
          <option value="lines">飞线图</option>
        </select>
      </div>
      <div class="control-group">
        <h4>说明</h4>
        <p>VEcharts 组件集成了 ol-echarts 库，支持在地图上叠加 ECharts 图表。</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VEcharts } from "@/packages";

export default {
  name: "EchartsExample",
  components: {
    VMap,
    VTile,
    VEcharts,
  },
  data() {
    return {
      mapOptions: {
        view: {
          center: [118.0894, 24.4798],
          zoom: 7,
          projection: "EPSG:4326",
        },
      },
      showEcharts: true,
      echartsVisible: true,
      chartType: "effectScatter",
      layerOptions: {
        stopEvent: true,
        hideOnMoving: false,
        hideOnZooming: false,
      },
      scatterData: [],
      chartOptions: {},
    };
  },
  created() {
    this.initScatterData();
    this.updateChartType();
  },
  methods: {
    initScatterData() {
      this.scatterData = [
        { name: "厦门", coord: [118.0894, 24.4798], value: 100 },
        { name: "泉州", coord: [118.6753, 24.8739], value: 80 },
        { name: "福州", coord: [119.2965, 26.0745], value: 120 },
        { name: "漳州", coord: [117.6476, 24.5126], value: 60 },
        { name: "莆田", coord: [119.0077, 25.4304], value: 50 },
        { name: "龙岩", coord: [117.0296, 25.0916], value: 40 },
        { name: "三明", coord: [117.6393, 26.2653], value: 35 },
        { name: "南平", coord: [118.1784, 26.6415], value: 30 },
        { name: "宁德", coord: [119.5219, 26.6566], value: 45 },
      ];
    },
    updateChartType() {
      if (this.chartType === "effectScatter") {
        this.chartOptions = this.getEffectScatterOptions();
      } else {
        this.chartOptions = this.getLinesOptions();
      }
    },
    getEffectScatterOptions() {
      return {
        tooltip: { trigger: "item" },
        series: [
          {
            name: "城市",
            type: "effectScatter",
            coordinateSystem: "bindbindBindOlGeo",
            showEffectOn: "render",
            rippleEffect: { brushType: "stroke", scale: 3 },
            symbol: "circle",
            symbolSize: function (val) {
              return val[2] / 5;
            },
            itemStyle: { color: "#409EFF", shadowBlur: 10, shadowColor: "#409EFF" },
            label: { formatter: "{b}", position: "right", show: true, fontSize: 12 },
            data: this.scatterData.map(function (item) {
              return { name: item.name, value: item.coord.concat([item.value]) };
            }),
          },
        ],
      };
    },
    getLinesOptions() {
      var center = [118.0894, 24.4798];
      var self = this;
      var linesData = this.scatterData
        .filter(function (item) {
          return item.name !== "厦门";
        })
        .map(function (item) {
          return { fromName: "厦门", toName: item.name, coords: [center, item.coord] };
        });
      return {
        tooltip: { trigger: "item" },
        series: [
          {
            name: "飞线",
            type: "lines",
            coordinateSystem: "bindbindBindOlGeo",
            zlevel: 1,
            effect: { show: true, period: 4, trailLength: 0.5, symbol: "arrow", symbolSize: 6, color: "#f0f" },
            lineStyle: { normal: { color: "#409EFF", width: 1.5, opacity: 0.6, curveness: 0.2 } },
            data: linesData,
          },
          {
            name: "起点",
            type: "effectScatter",
            coordinateSystem: "bindbindBindOlGeo",
            zlevel: 2,
            rippleEffect: { brushType: "stroke", scale: 4 },
            symbol: "circle",
            symbolSize: 20,
            itemStyle: { color: "#e74c3c" },
            label: { show: true, position: "right", formatter: "{b}" },
            data: [{ name: "厦门", value: center.concat([100]) }],
          },
          {
            name: "终点",
            type: "effectScatter",
            coordinateSystem: "bindbindBindOlGeo",
            zlevel: 2,
            rippleEffect: { brushType: "stroke" },
            label: { show: true, position: "right", formatter: "{b}" },
            symbolSize: function (val) {
              return val[2] / 5;
            },
            itemStyle: { color: "#67C23A" },
            data: self.scatterData
              .filter(function (item) {
                return item.name !== "厦门";
              })
              .map(function (item) {
                return { name: item.name, value: item.coord.concat([item.value]) };
              }),
          },
        ],
      };
    },
  },
};
</script>

<style scoped>
.echarts-example {
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
.control-group select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}
.control-group p {
  margin: 0;
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}
</style>
