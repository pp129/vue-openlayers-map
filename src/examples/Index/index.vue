<template>
  <div class="examples-index">
    <div class="header">
      <h1>Vue OpenLayers 组件示例</h1>
      <p class="subtitle">选择一个示例查看效果</p>
    </div>
    <div class="categories">
      <div class="category">
        <h2>基础组件</h2>
        <div class="example-grid">
          <router-link to="/Home" class="example-card"
            ><span class="icon">🗺️</span><span class="title">Home</span><span class="desc">综合演示</span></router-link
          >
          <router-link to="/BasicMapExample" class="example-card"
            ><span class="icon">📍</span><span class="title">BasicMap</span><span class="desc">基础地图</span></router-link
          >
          <router-link to="/MultiMap" class="example-card"
            ><span class="icon">🗂️</span><span class="title">MultiMap</span><span class="desc">多地图</span></router-link
          >
        </div>
      </div>
      <div class="category">
        <h2>图层组件</h2>
        <div class="example-grid">
          <router-link to="/GroupExample" class="example-card"
            ><span class="icon">📂</span><span class="title">GroupLayer</span><span class="desc">图层分组</span></router-link
          >
          <router-link to="/ImageLayerExample" class="example-card"
            ><span class="icon">🖼️</span><span class="title">ImageLayer</span><span class="desc">图片图层</span></router-link
          >
          <router-link to="/WMS" class="example-card"
            ><span class="icon">🌐</span><span class="title">WMS</span><span class="desc">WMS服务</span></router-link
          >
          <router-link to="/Heatmap" class="example-card"
            ><span class="icon">🔥</span><span class="title">Heatmap</span><span class="desc">热力图</span></router-link
          >
        </div>
      </div>
      <div class="category">
        <h2>矢量与聚合</h2>
        <div class="example-grid">
          <router-link to="/Points" class="example-card"
            ><span class="icon">📌</span><span class="title">Points</span><span class="desc">点位标注</span></router-link
          >
          <router-link to="/ClusterExample" class="example-card"
            ><span class="icon">🎯</span><span class="title">Cluster</span><span class="desc">聚合图层</span></router-link
          >
          <router-link to="/FeatureClick" class="example-card"
            ><span class="icon">👆</span><span class="title">FeatureClick</span><span class="desc">要素点击</span></router-link
          >
          <router-link to="/GraphicExample" class="example-card"
            ><span class="icon">🎨</span><span class="title">Graphic</span><span class="desc">Canvas图形</span></router-link
          >
        </div>
      </div>
      <div class="category">
        <h2>绘制与测量</h2>
        <div class="example-grid">
          <router-link to="/DrawExample" class="example-card"
            ><span class="icon">✏️</span><span class="title">Draw</span><span class="desc">绘制工具</span></router-link
          >
          <router-link to="/MeasureExample" class="example-card"
            ><span class="icon">📐</span><span class="title">Measure</span><span class="desc">测量工具</span></router-link
          >
          <router-link to="/ModifyLine" class="example-card"
            ><span class="icon">✂️</span><span class="title">ModifyLine</span><span class="desc">线编辑</span></router-link
          >
        </div>
      </div>
      <div class="category">
        <h2>路线与交通</h2>
        <div class="example-grid">
          <router-link to="/PathExample" class="example-card"
            ><span class="icon">🛤️</span><span class="title">Path</span><span class="desc">轨迹回放</span></router-link
          >
          <router-link to="/TrafficImageWMS" class="example-card"
            ><span class="icon">🛣️</span><span class="title">TrafficImageWMS</span
            ><span class="desc">以ImageWMS形式渲染路况</span></router-link
          >
        </div>
      </div>
      <div class="category">
        <h2>其他功能</h2>
        <div class="example-grid">
          <router-link to="/OverviewMapExample" class="example-card"
            ><span class="icon">🔍</span><span class="title">OverviewMap</span><span class="desc">鹰眼地图</span></router-link
          >
          <router-link to="/EchartsExample" class="example-card"
            ><span class="icon">📊</span><span class="title">ECharts</span><span class="desc">ECharts集成</span></router-link
          >
          <router-link to="/AMap" class="example-card"
            ><span class="icon">🌏</span><span class="title">AMap</span><span class="desc">高德底图</span></router-link
          >
          <router-link to="/Mobile" class="example-card"
            ><span class="icon">📱</span><span class="title">Mobile</span><span class="desc">移动端</span></router-link
          >
        </div>
      </div>
    </div>
    <div class="footer">Vue OpenLayers Components v1.0.0</div>
  </div>
</template>

<script>
export default { name: "ExamplesIndex" };
</script>

<style scoped>
.examples-index {
  padding: 20px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  box-sizing: border-box;
}
.header {
  text-align: center;
  padding: 20px;
  flex-shrink: 0;
}
.header h1 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 10px 0;
}
.subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}
.categories {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 10px;
  box-sizing: border-box;
}
.category {
  margin-bottom: 30px;
}
.category h2 {
  font-size: 20px;
  color: #303133;
  margin: 0 0 15px 0;
  padding-left: 10px;
  border-left: 4px solid #409eff;
}
.example-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}
@media (max-width: 900px) {
  .example-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 600px) {
  .example-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.example-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  background: #fff;
  border-radius: 8px;
  text-decoration: none;
  color: #303133;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
.example-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}
.icon {
  font-size: 36px;
  margin-bottom: 10px;
}
.title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
}
.desc {
  font-size: 12px;
  color: #909399;
  text-align: center;
}
.footer {
  text-align: center;
  padding: 15px 20px;
  color: #909399;
  font-size: 14px;
  flex-shrink: 0;
}
</style>
