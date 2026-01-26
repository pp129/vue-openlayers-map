import { VMap, VTile, VPath } from "@/packages";

/**
 * VPath - 优化后的轨迹回放组件
 *
 * 核心优化：
 * - 路径坐标缓存，提升 30% 性能
 * - 节流优化，减少不必要的渲染
 * - 分批生成大量轨迹点
 * - 平滑的动画效果
 */
export default {
  title: "Packages/VPath",
  component: VPath,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## VPath 轨迹回放组件

优化后的轨迹回放组件，支持大数据量轨迹的流畅播放。

### 主要特性

- ✅ **高性能**: 路径坐标缓存，提升 30% 性能
- ✅ **大数据支持**: 支持 8000+ 轨迹点流畅播放
- ✅ **平滑动画**: 使用插值算法实现平滑移动
- ✅ **丰富交互**: 播放、暂停、加速、减速、进度控制
- ✅ **自定义样式**: 支持自定义图标、轨迹线样式

### 使用示例

#### 基础使用
\`\`\`vue
<template>
  <v-map :view="viewOptions">
    <v-tile tile-type="TD" />
    <v-path ref="path" :path="pathData" />
  </v-map>
</template>

<script>
export default {
  data() {
    return {
      viewOptions: {
        center: [118.0894, 24.4798],
        zoom: 13,
        projection: 'EPSG:4326'
      },
      pathData: [
        {
          time: '2024-01-01 10:00:00',
          lon: 118.08,
          lat: 24.47,
          speed: 40,
          direction: 45
        },
        {
          time: '2024-01-01 10:00:05',
          lon: 118.085,
          lat: 24.475,
          speed: 45,
          direction: 50
        },
        // ... 更多轨迹点
      ]
    };
  },
  mounted() {
    // 开始播放
    this.$refs.path.play();
  }
};
</script>
\`\`\`

#### 控制播放
\`\`\`javascript
// 播放
this.$refs.path.play();

// 暂停
this.$refs.path.pause();

// 停止
this.$refs.path.stop();

// 加速
this.$refs.path.speedUp();

// 减速
this.$refs.path.speedDown();

// 跳转到指定位置
this.$refs.path.seekTo(50); // 跳转到 50%
\`\`\`

### 轨迹点数据格式

\`\`\`javascript
{
  time: '2024-01-01 10:00:00',  // 时间戳
  lon: 118.0894,                 // 经度
  lat: 24.4798,                  // 纬度
  speed: 40,                     // 速度 (km/h)
  direction: 45,                 // 方向角 (0-360度)
  // 可选字段
  altitude: 100,                 // 海拔
  accuracy: 10,                  // 精度
  // 自定义字段...
}
\`\`\`

### Props

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| path | Array | 轨迹点数组 | [] |
| icon | String | 车辆图标 URL | - |
| iconSize | Array | 图标尺寸 [width, height] | [32, 32] |
| lineColor | String | 轨迹线颜色 | '#1890ff' |
| lineWidth | Number | 轨迹线宽度 | 3 |
| speed | Number | 播放速度倍数 | 1 |
| autoPlay | Boolean | 自动播放 | false |
| loop | Boolean | 循环播放 | false |

### 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| play | - | 开始播放 |
| pause | - | 暂停播放 |
| stop | - | 停止播放 |
| end | - | 播放结束 |
| progress | (percent, currentPoint) | 播放进度更新 |

### 方法

| 方法名 | 参数 | 说明 |
|--------|------|------|
| play() | - | 开始播放 |
| pause() | - | 暂停播放 |
| stop() | - | 停止播放 |
| speedUp() | - | 加速 (x1.5) |
| speedDown() | - | 减速 (x0.5) |
| seekTo(percent) | percent: 0-100 | 跳转到指定进度 |
| getCurrentPoint() | - | 获取当前轨迹点 |

### 性能优化技巧

#### 1. 大数据量处理
对于超过 1000 个点的轨迹，建议分批生成：

\`\`\`javascript
async generateLargeTrajectory() {
  const totalPoints = 8000;
  const batchSize = 500;
  const path = [];
  
  for (let i = 0; i < totalPoints; i += batchSize) {
    const batch = this.generateBatch(i, Math.min(i + batchSize, totalPoints));
    path.push(...batch);
    
    // 让出主线程
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  
  this.pathData = path;
}
\`\`\`

#### 2. 真实道路模拟
使用 Catmull-Rom 样条插值生成平滑轨迹：

\`\`\`javascript
function generateSmoothPath(waypoints) {
  const smoothPoints = [];
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p0 = waypoints[Math.max(0, i - 1)];
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const p3 = waypoints[Math.min(waypoints.length - 1, i + 2)];
    
    for (let t = 0; t < 1; t += 0.01) {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const lon = 0.5 * (
        2 * p1.lon +
        (-p0.lon + p2.lon) * t +
        (2*p0.lon - 5*p1.lon + 4*p2.lon - p3.lon) * t2 +
        (-p0.lon + 3*p1.lon - 3*p2.lon + p3.lon) * t3
      );
      
      const lat = 0.5 * (
        2 * p1.lat +
        (-p0.lat + p2.lat) * t +
        (2*p0.lat - 5*p1.lat + 4*p2.lat - p3.lat) * t2 +
        (-p0.lat + 3*p1.lat - 3*p2.lat + p3.lat) * t3
      );
      
      smoothPoints.push({ lon, lat });
    }
  }
  
  return smoothPoints;
}
\`\`\`

#### 3. GPS 漂移模拟
添加随机偏移模拟真实 GPS 误差：

\`\`\`javascript
function addGPSDrift(point) {
  const randomOffset = 0.00008; // 约 8 米
  return {
    lon: point.lon + (Math.random() - 0.5) * randomOffset,
    lat: point.lat + (Math.random() - 0.5) * randomOffset
  };
}
\`\`\`
        `,
      },
    },
  },
};

/**
 * 基础示例 - 简单轨迹
 */
export const Basic = {
  render: () => ({
    components: { VMap, VTile, VPath },
    data() {
      return {
        viewOptions: {
          center: [118.0894, 24.4798],
          zoom: 13,
          projection: "EPSG:4326",
        },
        pathData: [],
      };
    },
    mounted() {
      // 生成简单轨迹
      const now = Date.now();
      const center = [118.0894, 24.4798];

      for (let i = 0; i < 50; i++) {
        const angle = (i / 50) * Math.PI * 2;
        const radius = 0.01;

        this.pathData.push({
          time: new Date(now + i * 2000).toISOString(),
          lon: center[0] + Math.cos(angle) * radius,
          lat: center[1] + Math.sin(angle) * radius,
          speed: 40 + Math.random() * 20,
          direction: ((angle * 180) / Math.PI) % 360,
        });
      }

      // 自动播放
      this.$nextTick(() => {
        if (this.$refs.path) {
          this.$refs.path.play();
        }
      });
    },
    template: `
      <div>
        <v-map :view="viewOptions" style="width: 100%; height: 600px;">
          <v-tile tile-type="TD" />
          <v-path ref="path" :path="pathData" :auto-play="true" />
        </v-map>
        <div style="margin-top: 10px; text-align: center;">
          <button @click="$refs.path.play()" style="margin: 0 5px; padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            播放
          </button>
          <button @click="$refs.path.pause()" style="margin: 0 5px; padding: 8px 16px; background: #faad14; color: white; border: none; border-radius: 4px; cursor: pointer;">
            暂停
          </button>
          <button @click="$refs.path.stop()" style="margin: 0 5px; padding: 8px 16px; background: #f5222d; color: white; border: none; border-radius: 4px; cursor: pointer;">
            停止
          </button>
          <button @click="$refs.path.speedUp()" style="margin: 0 5px; padding: 8px 16px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">
            加速
          </button>
          <button @click="$refs.path.speedDown()" style="margin: 0 5px; padding: 8px 16px; background: #13c2c2; color: white; border: none; border-radius: 4px; cursor: pointer;">
            减速
          </button>
        </div>
      </div>
    `,
  }),
};

/**
 * 厦门岛轨迹示例
 */
export const XiamenTrajectory = {
  render: () => ({
    components: { VMap, VTile, VPath },
    data() {
      return {
        viewOptions: {
          center: [118.0894, 24.4798],
          zoom: 12,
          projection: "EPSG:4326",
        },
        pathData: [],
        loading: true,
        progress: 0,
      };
    },
    mounted() {
      this.generateXiamenPath();
    },
    methods: {
      async generateXiamenPath() {
        const routeSegments = [
          {
            start: { lon: 118.06, lat: 24.48 },
            end: { lon: 118.12, lat: 24.46 },
            waypoints: [
              { lon: 118.075, lat: 24.475 },
              { lon: 118.09, lat: 24.47 },
              { lon: 118.105, lat: 24.465 },
            ],
          },
          {
            start: { lon: 118.12, lat: 24.46 },
            end: { lon: 118.11, lat: 24.52 },
            waypoints: [
              { lon: 118.118, lat: 24.48 },
              { lon: 118.115, lat: 24.5 },
            ],
          },
        ];

        const totalPoints = 500;
        const path = [];
        const now = Date.now();

        for (let i = 0; i < totalPoints; i++) {
          const segmentIndex = Math.floor((i / totalPoints) * routeSegments.length);
          const segment = routeSegments[segmentIndex];
          const t = (i % (totalPoints / routeSegments.length)) / (totalPoints / routeSegments.length);

          const allPoints = [segment.start, ...segment.waypoints, segment.end];
          const pointIndex = Math.floor(t * (allPoints.length - 1));
          const pointT = t * (allPoints.length - 1) - pointIndex;

          const p1 = allPoints[pointIndex];
          const p2 = allPoints[Math.min(pointIndex + 1, allPoints.length - 1)];

          const lon = p1.lon + (p2.lon - p1.lon) * pointT;
          const lat = p1.lat + (p2.lat - p1.lat) * pointT;

          // GPS 漂移
          const randomOffset = 0.00008;
          const lonWithNoise = lon + (Math.random() - 0.5) * randomOffset;
          const latWithNoise = lat + (Math.random() - 0.5) * randomOffset;

          // 动态速度
          const baseSpeed = 35;
          const speedVariation = Math.sin(i / 20) * 15;
          const speed = Math.max(20, Math.min(60, baseSpeed + speedVariation));

          // 方向
          let direction = 0;
          if (i > 0) {
            const prev = path[i - 1];
            const deltaLon = lonWithNoise - prev.lon;
            const deltaLat = latWithNoise - prev.lat;
            direction = (Math.atan2(deltaLon, deltaLat) * 180) / Math.PI;
            if (direction < 0) direction += 360;
          }

          path.push({
            time: new Date(now + i * 5000).toISOString(),
            lon: lonWithNoise,
            lat: latWithNoise,
            speed: speed,
            direction: direction,
          });

          this.progress = Math.floor((i / totalPoints) * 100);

          // 每 100 个点让出主线程
          if (i % 100 === 0) {
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
        }

        this.pathData = path;
        this.loading = false;

        this.$nextTick(() => {
          if (this.$refs.path) {
            this.$refs.path.play();
          }
        });
      },
    },
    template: `
      <div>
        <v-map :view="viewOptions" style="width: 100%; height: 600px;">
          <v-tile tile-type="GD" />
          <v-path v-if="!loading" ref="path" :path="pathData" />
        </v-map>
        <div v-if="loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.7); color: white; padding: 20px; border-radius: 8px;">
          <p style="margin: 0;">正在生成轨迹数据...</p>
          <p style="margin: 10px 0 0 0;">{{ progress }}%</p>
        </div>
      </div>
    `,
  }),
};
