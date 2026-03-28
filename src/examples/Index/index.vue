<template>
  <div class="examples-index">
    <header class="header">
      <h1>v-ol-map 组件示例</h1>
      <p>基于 Vue 2 + OpenLayers 的地图组件库</p>
    </header>

    <main class="main">
      <section v-for="group in exampleGroups" :key="group.title" class="group">
        <h2 class="group-title">{{ group.title }}</h2>
        <div class="card-grid">
          <router-link v-for="item in group.items" :key="item.path" :to="item.path" class="card">
            <div class="card-icon">{{ item.icon }}</div>
            <div class="card-content">
              <h3>{{ item.name }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </router-link>
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>v-ol-map &copy; {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: "ExamplesIndex",
  data() {
    return {
      exampleGroups: [
        {
          title: "基础组件",
          items: [
            { path: "/Home", name: "Home", desc: "首页示例", icon: "🏠" },
            { path: "/BasicMapExample", name: "BasicMap", desc: "基础地图配置", icon: "🗺️" },
            { path: "/MultiMap", name: "MultiMap", desc: "多地图实例", icon: "📍" },
          ],
        },
        {
          title: "图层组件",
          items: [
            { path: "/GroupLayer", name: "GroupLayer", desc: "图层分组管理", icon: "📁" },
            { path: "/GroupExample", name: "GroupExample", desc: "图层组示例", icon: "📂" },
            { path: "/WMS", name: "WMS", desc: "WMS 图层加载", icon: "🌐" },
            { path: "/ImageLayerExample", name: "ImageLayer", desc: "图片图层叠加", icon: "🖼️" },
          ],
        },
        {
          title: "矢量与要素",
          items: [
            { path: "/Points", name: "Points", desc: "点要素渲染", icon: "📌" },
            { path: "/FeatureClick", name: "FeatureClick", desc: "要素点击交互", icon: "👆" },
            { path: "/ClusterExample", name: "Cluster", desc: "点聚合效果", icon: "🔵" },
            { path: "/GeoJsonExample", name: "GeoJSON", desc: "GeoJSON 数据加载", icon: "📄" },
          ],
        },
        {
          title: "绑制与测量",
          items: [
            { path: "/DrawExample", name: "Draw", desc: "绑制图形工具", icon: "✏️" },
            { path: "/MeasureExample", name: "Measure", desc: "测距测面积", icon: "📏" },
            { path: "/ModifyLine", name: "ModifyLine", desc: "线段编辑修改", icon: "〰️" },
            { path: "/ModifyCircle", name: "ModifyCircle", desc: "圆编辑修改", icon: "◯" },
          ],
        },
        {
          title: "可视化",
          items: [
            { path: "/Heatmap", name: "Heatmap", desc: "热力图效果", icon: "🔥" },
            { path: "/EchartsExample", name: "ECharts", desc: "ECharts 集成", icon: "📊" },
            { path: "/GraphicExample", name: "Graphic", desc: "Canvas 图形", icon: "🎨" },
          ],
        },
        {
          title: "轨迹与动画",
          items: [{ path: "/PathExample", name: "Path", desc: "轨迹回放动画", icon: "🚗" }],
        },
        {
          title: "其他",
          items: [
            { path: "/AMap", name: "AMap", desc: "高德地图底图", icon: "🇨🇳" },
            { path: "/Mobile", name: "Mobile", desc: "移动端适配", icon: "📱" },
            { path: "/OverviewMapExample", name: "OverviewMap", desc: "鹰眼控件", icon: "🔍" },
            { path: "/TrafficImageWMS", name: "TrafficWMS", desc: "交通态势图层", icon: "🚦" },
            { path: "/OptimizedMap", name: "OptimizedMap", desc: "性能优化示例", icon: "⚡" },
          ],
        },
      ],
    };
  },
};
</script>

<style scoped>
.examples-index {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-y: auto;
}

.header {
  text-align: center;
  padding: 40px 20px 30px;
  color: #fff;
}

.header h1 {
  margin: 0 0 10px;
  font-size: 32px;
  font-weight: 600;
}

.header p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.group {
  margin-bottom: 30px;
}

.group-title {
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 15px;
  padding-left: 10px;
  border-left: 4px solid rgba(255, 255, 255, 0.8);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: #fff;
}

.card-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 10px;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.card-content p {
  margin: 0;
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.footer p {
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .header {
    padding: 30px 15px 20px;
  }

  .header h1 {
    font-size: 24px;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
