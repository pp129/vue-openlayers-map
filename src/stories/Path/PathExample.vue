<template>
  <div class="path-example">
    <v-map :view="view" style="width: 100%; height: 600px">
      <v-tile tile-type="TD" />
      <v-path
        ref="pathRef"
        :path="pathData"
        :options="pathOptions"
        :show-trace-point="showTracePoint"
        :trace-points-mode-play="playMode"
        @load="onPathLoad"
        @bindMove="onMove"
        @bindEnd="onEnd"
      />
    </v-map>
    <div class="controls">
      <div class="control-row">
        <button @click="start" :disabled="!isLoaded">播放</button>
        <button @click="pause" :disabled="!isPlaying">暂停</button>
        <button @click="resume" :disabled="isPlaying || !isPaused">继续</button>
        <button @click="stop" :disabled="!isLoaded">停止</button>
      </div>
      <div class="control-row">
        <label>倍速:</label>
        <select v-model="speedUp" @change="changeSpeedUp">
          <option :value="1">1x</option>
          <option :value="2">2x</option>
          <option :value="4">4x</option>
          <option :value="8">8x</option>
          <option :value="16">16x</option>
        </select>
        <label>
          <input type="checkbox" v-model="showTracePoint" />
          显示轨迹点
        </label>
      </div>
      <div class="progress-row">
        <span>进度: {{ currentIndex }} / {{ totalPoints }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VMap, VTile, VPath } from "v-ol-map";

export default {
  name: "PathExample",
  components: { VMap, VTile, VPath },
  data() {
    return {
      view: {
        center: [118.0894, 24.4798],
        zoom: 14,
        projection: "EPSG:4326",
      },
      pathData: [],
      pathOptions: {
        lineColor: "rgba(24, 144, 255, 0.8)",
        lineWidth: 6,
        passlineColor: "#52c41a",
        passlineWidth: 4,
        nodeFillColor: "rgba(255, 255, 255, 0.8)",
        nodeStrokeColor: "#1890ff",
        nodeStrokeWidth: 2,
        carIcon: {
          src: new URL("../../assets/img/car.png", import.meta.url).href,
          scale: 0.1,
          rotation: 0,
        },
      },
      showTracePoint: true,
      playMode: "animation",
      speedUp: 1,
      isLoaded: false,
      isPlaying: false,
      isPaused: false,
      currentIndex: 0,
      totalPoints: 0,
    };
  },
  computed: {
    progressPercent() {
      if (this.totalPoints === 0) return 0;
      return ((this.currentIndex / this.totalPoints) * 100).toFixed(1);
    },
  },
  mounted() {
    this.generatePathData();
  },
  methods: {
    // 生成 8000 个轨迹点，时间间隔 5 秒
    generatePathData() {
      const points = [];
      const centerLon = 118.0894;
      const centerLat = 24.4798;
      const startTime = Date.now();
      const count = 8000;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 8;
        const radius = 0.01 + (i / count) * 0.02;
        points.push({
          longitude: centerLon + Math.cos(angle) * radius,
          latitude: centerLat + Math.sin(angle) * radius,
          gnssTime: startTime + i * 5000, // 5 秒间隔
          speed: 30 + Math.random() * 20,
        });
      }

      this.pathData = points;
      this.totalPoints = count;
    },
    onPathLoad(pathObj) {
      console.log("轨迹加载完成", pathObj);
      this.isLoaded = true;
    },
    onMove(e) {
      this.currentIndex = e.currentIndex || 0;
      this.isPlaying = true;
      this.isPaused = false;
    },
    onEnd() {
      console.log("播放结束");
      this.isPlaying = false;
      this.isPaused = false;
    },
    start() {
      this.$refs.pathRef?.start();
      this.isPlaying = true;
      this.isPaused = false;
    },
    pause() {
      this.$refs.pathRef?.pause();
      this.isPlaying = false;
      this.isPaused = true;
    },
    resume() {
      this.$refs.pathRef?.resume();
      this.isPlaying = true;
      this.isPaused = false;
    },
    stop() {
      this.$refs.pathRef?.stop();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentIndex = 0;
    },
    changeSpeedUp() {
      this.$refs.pathRef?.setSpeedUp(this.speedUp);
    },
  },
};
</script>

<style scoped>
.path-example {
  position: relative;
}
.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
}
.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.control-row button {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}
.control-row button:hover:not(:disabled) {
  background: #40a9ff;
}
.control-row button:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
.control-row select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
.control-row label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}
.progress-row {
  font-size: 14px;
  color: #666;
}
.progress-bar {
  margin-top: 8px;
  height: 8px;
  background: #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #1890ff;
  transition: width 0.3s ease;
}
</style>
