<template>
  <div class="path-example">
    <v-map :view="view" style="width: 100%; height: 100%">
      <v-tile tile-type="BD"></v-tile>
      <v-path
        v-if="pathReady"
        ref="path"
        :path="pathData"
        :options="pathOptions"
        :trace-points-mode-play="playMode"
        :show-trace-point="showPoints"
        :auto-play="false"
        @load="onPathLoad"
        @move="onMove"
      />
    </v-map>

    <div v-if="!pathReady" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>正在生成轨迹数据...</p>
        <p class="progress">{{ generatedCount }} / 8000</p>
      </div>
    </div>

    <div class="control-panel">
      <h3>轨迹路径回放</h3>

      <div class="control-group">
        <label>播放模式</label>
        <div class="mode-btns">
          <button :class="{ active: playMode === 'animation' }" @click="playMode = 'animation'">动画</button>
          <button :class="{ active: playMode === 'skip' }" @click="playMode = 'skip'">跳点</button>
        </div>
      </div>

      <div class="control-group">
        <label>倍速: {{ speedUp }}x</label>
        <div class="speed-btns">
          <button v-for="s in [1, 2, 4, 8]" :key="s" :class="{ active: speedUp === s }" @click="setSpeedUp(s)">{{ s }}x</button>
        </div>
      </div>

      <div class="control-group">
        <label>
          <input type="checkbox" v-model="showPoints" />
          显示轨迹点
        </label>
      </div>

      <div class="action-btns">
        <button class="btn-start" @click="start" :disabled="isPlaying">开始</button>
        <button class="btn-pause" @click="pause" :disabled="!isPlaying">暂停</button>
        <button class="btn-resume" @click="resume" :disabled="!isPaused">继续</button>
        <button class="btn-stop" @click="stop">停止</button>
      </div>

      <div class="info">
        <p>轨迹点数: {{ pathData.length }}</p>
        <p>当前索引: {{ currentIndex }}</p>
        <p>状态: {{ status }}</p>
        <p>已行驶: {{ distance.toFixed(2) }}m</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PathExample",
  data() {
    return {
      view: {
        center: [118.089425, 24.479833], // 厦门岛中心
        zoom: 13,
      },
      playMode: "animation",
      isPlaying: false,
      isPaused: false,
      speedUp: 1,
      showPoints: true,
      pathInstance: null,
      pathData: [],
      pathReady: false, // 路径是否准备完成
      generatedCount: 0, // 已生成的点数
      currentIndex: 0,
      distance: 0,
      pathOptions: {
        lineColor: "rgba(0, 123, 255, 0.7)",
        lineWidth: 8,
        passlineColor: "#ff5722",
        passlineWidth: 4,
        nodeStrokeColor: "#2196f3",
        nodeStrokeWidth: 2,
        nodeFillColor: "rgba(33, 150, 243, 0.3)",
        carIcon: {
          src: new URL("../../assets/img/car.png", import.meta.url).href,
          scale: 0.1,
          rotation: 0,
        },
        speed: 2000,
        arrowPixel: 0.15,
      },
    };
  },
  computed: {
    status() {
      if (this.isPlaying) return "播放中";
      if (this.isPaused) return "已暂停";
      return "已停止";
    },
  },
  created() {
    this.generateMockPath();
  },
  methods: {
    generateMockPath() {
      // 厦门岛边界坐标范围（WGS84坐标系）
      const xiamenBounds = {
        minLon: 118.04,
        maxLon: 118.18,
        minLat: 24.42,
        maxLat: 24.55,
      };

      const now = Date.now();
      const totalPoints = 8000;

      // 使用 setTimeout 分批生成，避免阻塞 UI
      const batchSize = 500;
      let currentBatch = 0;

      // 定义几条主要路线段（模拟厦门岛内主干道）
      const routeSegments = [
        // 路线1: 从西北到东南（思明区主干道）
        {
          start: { lon: 118.06, lat: 24.48 },
          end: { lon: 118.12, lat: 24.46 },
          waypoints: [
            { lon: 118.075, lat: 24.475 },
            { lon: 118.09, lat: 24.47 },
            { lon: 118.105, lat: 24.465 },
          ],
        },
        // 路线2: 东西向（环岛路段）
        {
          start: { lon: 118.12, lat: 24.46 },
          end: { lon: 118.15, lat: 24.465 },
          waypoints: [
            { lon: 118.13, lat: 24.461 },
            { lon: 118.14, lat: 24.463 },
          ],
        },
        // 路线3: 向北（会展中心方向）
        {
          start: { lon: 118.15, lat: 24.465 },
          end: { lon: 118.16, lat: 24.5 },
          waypoints: [
            { lon: 118.155, lat: 24.48 },
            { lon: 118.158, lat: 24.49 },
          ],
        },
        // 路线4: 向西（湖滨路段）
        {
          start: { lon: 118.16, lat: 24.5 },
          end: { lon: 118.1, lat: 24.505 },
          waypoints: [
            { lon: 118.145, lat: 24.502 },
            { lon: 118.13, lat: 24.503 },
            { lon: 118.115, lat: 24.504 },
          ],
        },
        // 路线5: 向南（返回市区）
        {
          start: { lon: 118.1, lat: 24.505 },
          end: { lon: 118.085, lat: 24.475 },
          waypoints: [
            { lon: 118.095, lat: 24.495 },
            { lon: 118.09, lat: 24.485 },
          ],
        },
        // 路线6: 最后一段（环岛）
        {
          start: { lon: 118.085, lat: 24.475 },
          end: { lon: 118.06, lat: 24.48 },
          waypoints: [
            { lon: 118.075, lat: 24.477 },
            { lon: 118.065, lat: 24.479 },
          ],
        },
      ];

      // 使用贝塞尔曲线生成平滑路径的函数
      const generateSmoothPath = (segments, totalPoints) => {
        const allPoints = [];

        // 将所有路线段的关键点连接起来
        const keyPoints = [];
        segments.forEach((segment) => {
          keyPoints.push(segment.start);
          if (segment.waypoints) {
            keyPoints.push(...segment.waypoints);
          }
        });
        keyPoints.push(segments[segments.length - 1].end);

        // 使用Catmull-Rom样条插值生成平滑曲线
        const pointsPerSegment = Math.floor(totalPoints / (keyPoints.length - 1));

        for (let i = 0; i < keyPoints.length - 1; i++) {
          const p0 = i > 0 ? keyPoints[i - 1] : keyPoints[i];
          const p1 = keyPoints[i];
          const p2 = keyPoints[i + 1];
          const p3 = i < keyPoints.length - 2 ? keyPoints[i + 2] : keyPoints[i + 1];

          // 对每个段生成插值点
          for (let j = 0; j < pointsPerSegment; j++) {
            const t = j / pointsPerSegment;
            const t2 = t * t;
            const t3 = t2 * t;

            // Catmull-Rom样条公式（张力系数0.5）
            const lon =
              0.5 *
              (2 * p1.lon +
                (-p0.lon + p2.lon) * t +
                (2 * p0.lon - 5 * p1.lon + 4 * p2.lon - p3.lon) * t2 +
                (-p0.lon + 3 * p1.lon - 3 * p2.lon + p3.lon) * t3);

            const lat =
              0.5 *
              (2 * p1.lat +
                (-p0.lat + p2.lat) * t +
                (2 * p0.lat - 5 * p1.lat + 4 * p2.lat - p3.lat) * t2 +
                (-p0.lat + 3 * p1.lat - 3 * p2.lat + p3.lat) * t3);

            // 添加微小的随机扰动（模拟GPS漂移）
            const randomOffset = 0.00008; // 约8米的GPS误差
            const lonWithNoise = lon + (Math.random() - 0.5) * randomOffset;
            const latWithNoise = lat + (Math.random() - 0.5) * randomOffset;

            allPoints.push({
              lon: Math.max(xiamenBounds.minLon, Math.min(xiamenBounds.maxLon, lonWithNoise)),
              lat: Math.max(xiamenBounds.minLat, Math.min(xiamenBounds.maxLat, latWithNoise)),
            });
          }
        }

        return allPoints;
      };

      // 生成所有路径点
      const smoothPoints = generateSmoothPath(routeSegments, totalPoints);

      const generateBatch = () => {
        const startIdx = currentBatch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, totalPoints);

        for (let i = startIdx; i < endIdx; i++) {
          const time = new Date(now + i * 5000); // 5秒间隔
          const point = smoothPoints[i] || smoothPoints[smoothPoints.length - 1];

          // 计算行驶方向（基于前后点）
          let direction = 0;
          if (i > 0 && i < smoothPoints.length - 1) {
            const prev = smoothPoints[i - 1];
            const next = smoothPoints[i + 1];
            const deltaLon = next.lon - prev.lon;
            const deltaLat = next.lat - prev.lat;
            direction = (Math.atan2(deltaLon, deltaLat) * 180) / Math.PI;
            if (direction < 0) direction += 360;
          }

          // 根据路段特征动态调整速度（城市道路：20-60 km/h）
          const baseSpeed = 35;
          const speedVariation = Math.sin(i / 100) * 15; // 平滑的速度变化
          const randomSpeed = (Math.random() - 0.5) * 5; // 小幅随机波动
          const speed = Math.max(20, Math.min(60, baseSpeed + speedVariation + randomSpeed));

          this.pathData.push({
            longitude: point.lon,
            latitude: point.lat,
            gnssTime: this.formatTime(time),
            speed: speed,
            direction: direction,
          });
        }

        this.generatedCount = endIdx;

        // 如果还有更多点需要生成，继续下一批
        if (endIdx < totalPoints) {
          currentBatch++;
          setTimeout(generateBatch, 0);
        } else {
          // 全部生成完成
          this.pathReady = true;
          console.log(`[PathExample] 轨迹生成完成（WGS84坐标系），共 ${totalPoints} 个点`);
        }
      };

      // 开始生成第一批
      generateBatch();
    },
    formatTime(date) {
      const h = String(date.getHours()).padStart(2, "0");
      const m = String(date.getMinutes()).padStart(2, "0");
      const s = String(date.getSeconds()).padStart(2, "0");
      return `${h}:${m}:${s}`;
    },
    onPathLoad(path) {
      this.pathInstance = path;
      console.log("[PathExample] 路径加载完成");
    },
    onMove(event) {
      // event.target 包含: { index, status, position, lngLat, passNode, length }
      const info = event.target;
      this.currentIndex = info.index || 0;
      this.distance = info.length || 0;
    },
    start() {
      if (this.$refs.path) {
        this.$refs.path.start();
        this.isPlaying = true;
        this.isPaused = false;
      }
    },
    pause() {
      if (this.$refs.path) {
        this.$refs.path.pause();
        this.isPlaying = false;
        this.isPaused = true;
      }
    },
    resume() {
      if (this.$refs.path) {
        this.$refs.path.resume();
        this.isPlaying = true;
        this.isPaused = false;
      }
    },
    stop() {
      if (this.$refs.path) {
        this.$refs.path.stop();
        this.isPlaying = false;
        this.isPaused = false;
        this.currentIndex = 0;
        this.distance = 0;
      }
    },
    setSpeedUp(speed) {
      this.speedUp = speed;
      if (this.pathInstance) {
        this.pathInstance.setSpeedUp(speed);
      }
    },
  },
};
</script>

<style scoped>
.path-example {
  width: 100%;
  height: 100vh;
  position: relative;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.loading-content {
  text-align: center;
}
.spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.loading-content p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
}
.loading-content .progress {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}
.control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 240px;
  z-index: 100;
}
.control-panel h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.control-group {
  margin-bottom: 15px;
}
.control-group > label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}
.control-group label input[type="checkbox"] {
  margin-right: 6px;
}
.mode-btns,
.speed-btns {
  display: flex;
  gap: 8px;
}
.mode-btns button,
.speed-btns button {
  flex: 1;
  padding: 6px 0;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.mode-btns button:hover,
.speed-btns button:hover {
  border-color: #409eff;
  color: #409eff;
}
.mode-btns button.active,
.speed-btns button.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
.action-btns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 15px;
}
.action-btns button {
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.action-btns button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-start {
  background: #67c23a;
  color: #fff;
}
.btn-start:hover:not(:disabled) {
  background: #85ce61;
}
.btn-pause {
  background: #e6a23c;
  color: #fff;
}
.btn-pause:hover:not(:disabled) {
  background: #ebb563;
}
.btn-resume {
  background: #409eff;
  color: #fff;
}
.btn-resume:hover:not(:disabled) {
  background: #66b1ff;
}
.btn-stop {
  background: #f56c6c;
  color: #fff;
}
.btn-stop:hover {
  background: #f78989;
}
.info {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
}
.info p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}
.info p:first-child {
  margin-top: 0;
}
.info p:last-child {
  margin-bottom: 0;
}
</style>
