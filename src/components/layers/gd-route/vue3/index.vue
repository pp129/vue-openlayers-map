<script lang="ts" setup>
import { inject, onMounted, onBeforeUnmount, ShallowRef, ref, watch, watchEffect } from "vue";
import ImageLayer from "ol/layer/Image";
import ImageCanvas from "ol/source/ImageCanvas";
import type { Extent } from "ol/extent";
import type { Size } from "ol/size";
import type { TrafficOptions } from "@/packages/types/Traffic";
import { create, compose } from "ol/transform";
import CanvasImmediateRenderer from "ol/render/canvas/Immediate";
import LineString from "ol/geom/LineString";
import Feature from "ol/Feature";
import { Style, Stroke } from "ol/style";
import useBaseLayer from "@/packages/layers/baseLayer";
import { useParent } from "@/packages/hooks/parent.ts";
import { debounce } from "throttle-debounce";

defineOptions({
  name: "OlTraffic",
});

// 定义emit事件
const emit = defineEmits<{
  click: [
    featureInfo: {
      road_name: string;
      speed: number;
      state: number;
      travel_time: string;
      length: string;
      color: string;
      stateText: string;
      coordinate: number[];
      feature_id: string;
    },
  ];
}>();

const map = inject("VMap") as ShallowRef<import("@/packages/lib").default>;

const props = withDefaults(defineProps<TrafficOptions>(), {
  visible: true,
  opacity: 0.8,
  updateInterval: 30000, // 30秒更新一次
  showLegend: false,
  colors: () => ["#34b000", "#fecb00", "#df0100", "#8e0e0b", "#8f979c"],
  lineWidth: 1.5,
  requestParams: () => ({
    f: "geojson",
    returnGeometry: true,
    resultRecordCount: 50000,
  }),
  // url 是必填参数，不设默认值
});

const trafficLayer = ref<ImageLayer<ImageCanvas>>();
const updateTimer = ref<NodeJS.Timeout>();
const trafficFeatures = ref<Feature[]>([]);

// 存储当前悬浮的要素ID
const hoveredFeatureId = ref<string | null>(null);

// 检测鼠标位置是否在要素上
const getFeatureAtPixel = (pixel: any): Feature | null => {
  if (!map.value?.map) return null;

  // 将像素坐标转换为地图坐标
  const coordinate = map.value.map.getCoordinateFromPixel(pixel);
  if (!coordinate) return null;

  // 设置容差值（单位：地图单位）
  const tolerance = (map.value.map.getView().getResolution() || 1) * 10; // 10像素的容差

  // 检查每个交通要素是否在点击范围内
  for (const feature of trafficFeatures.value) {
    const geometry = feature.getGeometry();
    if (geometry && geometry.getType() === "LineString") {
      // @ts-ignore - 忽略LineString类型检查
      const coordinates = geometry.getCoordinates();

      // 检查点击点是否在线段附近
      for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];

        // 计算点到线段的距离
        const distance = distanceToLineSegment(coordinate, start, end);
        if (distance <= tolerance) {
          // @ts-ignore - 忽略Feature类型兼容性问题
          return feature;
        }
      }
    }
  }

  return null;
};

// 计算点到线段的距离
const distanceToLineSegment = (point: number[], start: number[], end: number[]): number => {
  const [px, py] = point;
  const [sx, sy] = start;
  const [ex, ey] = end;

  // 线段的长度平方
  const lengthSquared = (ex - sx) * (ex - sx) + (ey - sy) * (ey - sy);

  if (lengthSquared === 0) {
    // 线段是一个点
    return Math.sqrt((px - sx) * (px - sx) + (py - sy) * (py - sy));
  }

  // 计算投影点
  const t = Math.max(0, Math.min(1, ((px - sx) * (ex - sx) + (py - sy) * (ey - sy)) / lengthSquared));
  const projectionX = sx + t * (ex - sx);
  const projectionY = sy + t * (ey - sy);

  // 返回距离
  return Math.sqrt((px - projectionX) * (px - projectionX) + (py - projectionY) * (py - projectionY));
};

// 鼠标移动事件处理
const handleMouseMove = (event: any) => {
  if (!map.value?.map) return;

  const pixel = map.value.map.getEventPixel(event.originalEvent);
  const feature = getFeatureAtPixel(pixel);

  if (feature) {
    // 鼠标悬浮在要素上
    const featureId = feature.get("gid") || "unknown";
    if (hoveredFeatureId.value !== featureId) {
      hoveredFeatureId.value = featureId;
      map.value.map.getTargetElement().style.cursor = "pointer";
    }
  } else {
    // 鼠标不在要素上
    if (hoveredFeatureId.value !== null) {
      hoveredFeatureId.value = null;
      map.value.map.getTargetElement().style.cursor = "default";
    }
  }
};

// 鼠标点击事件处理
const handleMapClick = (event: any) => {
  if (!map.value?.map) return;

  const pixel = map.value.map.getEventPixel(event.originalEvent);
  const feature = getFeatureAtPixel(pixel);

  if (feature) {
    // 点击到了要素，emit事件给父组件
    const featureInfo = {
      road_name: feature.get("road_name") || "未知道路",
      speed: feature.get("speed") || 0,
      state: feature.get("state") || -1,
      travel_time: feature.get("travel_time") || "未知",
      length: feature.get("length") || "未知",
      color: getColorByState(feature.get("state") || -1),
      stateText: getStateText(feature.get("state") || -1),
      coordinate: event.coordinate,
      feature_id: feature.get("feature_id") || "",
      gid: feature.get("gid") || "",
    };

    // emit点击事件
    emit("click", featureInfo);
  }
};

// 获取状态文本
const getStateText = (state: number): string => {
  const stateMap: { [key: number]: string } = {
    1: "畅通",
    2: "缓慢",
    3: "拥堵",
    4: "严重拥堵",
    [-1]: "无数据",
  };
  return stateMap[state] || "未知";
};

// 使用 useParent 处理图层添加到父级组件
const { addLayer } = useParent();

// 根据地图缩放级别生成道路级别过滤参数
const generateWhereParam = (zoom: number): string => {
  // 根据缩放级别确定显示的道路级别
  // 低层级(1-8): 只显示主要道路 roadclass in (1,2,3)
  // 中层级(9-12): 显示更多道路 roadclass in (1,2,3,4)
  // 高层级(13+): 显示所有道路 roadclass in (1,2,3,4,5)

  if (zoom <= 14) {
    return "roadclass in (1,2,3)";
  } else if (zoom <= 16) {
    return "roadclass in (1,2,3,4)";
  } else {
    return "roadclass in (1,2,3,4,5)";
  }
};

// 获取完整的where参数，包含层级过滤和附加条件
const getCurrentWhereParam = (): string => {
  // 获取当前地图缩放级别
  const currentZoom = map.value?.map?.getView().getZoom() || 10;

  // 基础的层级过滤条件（总是包含）
  const baseWhere = generateWhereParam(currentZoom);

  // 如果有附加条件，使用 AND 连接
  if (props.where && props.where.trim()) {
    return `${baseWhere} AND (${props.where.trim()})`;
  }

  return baseWhere;
};

// 根据当前地图视窗范围生成Polygon GeoJSON
const getCurrentExtentGeometry = (): string => {
  if (!map.value?.map) {
    return "";
  }

  try {
    // 获取当前地图视窗范围
    const view = map.value.map.getView();
    const extent = view.calculateExtent(map.value.map.getSize());

    // 将extent转换为Polygon坐标
    const [minX, minY, maxX, maxY] = extent;

    // 创建GeoJSON Polygon格式
    const polygon = {
      type: "Polygon",
      coordinates: [
        [
          [minX, minY], // 左下角
          [maxX, minY], // 右下角
          [maxX, maxY], // 右上角
          [minX, maxY], // 左上角
          [minX, minY], // 闭合多边形
        ],
      ],
    };

    return JSON.stringify(polygon);
  } catch (error) {
    console.warn("Failed to generate extent geometry:", error);
    return "";
  }
};

// 获取当前的geometry参数
const getCurrentGeometryParam = (): string => {
  if (props.geometry && props.geometry.trim()) {
    // 如果用户指定了geometry参数，优先使用
    return props.geometry.trim();
  }

  // 否则使用当前地图视窗范围
  return getCurrentExtentGeometry();
};

// 使用 useBaseLayer 处理基础图层属性
watchEffect(() => {
  // @ts-ignore - 忽略ImageLayer类型兼容性问题
  useBaseLayer(trafficLayer.value, props);
});

// 交通数据接口（基于真实数据结构）
interface TrafficDataItem {
  geometry: {
    coordinates: number[][];
    type: string;
  };
  properties: {
    road_name: string;
    speed: string;
    state: number;
    travel_time: string;
    length: string;
    gid: number;
  };
}

// 根据state值获取对应的颜色
const getColorByState = (state: number): string => {
  const colorMap: { [key: number]: number } = {
    1: 0, // 畅通 - colors[0]
    2: 1, // 缓慢 - colors[1]
    3: 2, // 拥堵 - colors[2]
    4: 3, // 严重拥堵 - colors[3]
    [-1]: 4, // 无数据 - colors[4]
  };

  const colorIndex = colorMap[state];
  return colorIndex !== undefined ? props.colors[colorIndex] : props.colors[4]; // 默认返回无数据颜色
};

// 生成Canvas矢量上下文
const getCanvasVectorContext = (canvas: HTMLCanvasElement, extent: Extent, resolution: number, pixelRatio: number) => {
  if (!map.value?.map || trafficFeatures.value.length === 0) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 创建坐标变换矩阵
  const transform = create();
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // 计算从世界坐标到Canvas坐标的变换
  const extentWidth = extent[2] - extent[0];
  const extentHeight = extent[3] - extent[1];
  const scaleX = canvasWidth / extentWidth;
  const scaleY = canvasHeight / extentHeight;

  // 设置变换矩阵：平移到原点，然后缩放，再翻转 Y 轴
  compose(transform, 0, canvasHeight, scaleX, -scaleY, 0, -extent[0], -extent[1]);

  // 创建直接渲染器
  const immediateRenderer = new CanvasImmediateRenderer(
    ctx,
    pixelRatio,
    extent,
    transform,
    0, // rotation
  );

  // 渲染所有交通要素
  trafficFeatures.value.forEach(feature => {
    const geometry = feature.getGeometry();
    const style = feature.getStyle();

    if (geometry && style) {
      // 使用OpenLayers的矢量渲染器渲染要素
      // @ts-ignore - 忽略OpenLayers 类型兼容性问题
      immediateRenderer.setStyle(style);
      // @ts-ignore - 忽略OpenLayers 类型兼容性问题
      immediateRenderer.drawGeometry(geometry);
    }
  });
};

// 加载真实交通数据并生成Feature
const loadTrafficDataFromJson = async (): Promise<Feature[]> => {
  try {
    // 使用url参数加载数据
    const dataUrl = props.url;

    let response;
    // 对于真实的路况服务，使用 FormData 传参
    const formData = new FormData();

    // 添加基础请求参数
    Object.entries(props.requestParams || {}).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    // 添加动态where参数
    const whereParam = getCurrentWhereParam();
    formData.append("where", whereParam);

    // 添加geometry参数
    const geometryParam = getCurrentGeometryParam();
    if (geometryParam) {
      formData.append("geometry", geometryParam);
    }

    response = await fetch(dataUrl, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const features: Feature[] = [];

    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((item: TrafficDataItem) => {
        if (item.geometry && item.geometry.type === "LineString") {
          // 创建线几何
          const lineString = new LineString(item.geometry.coordinates);

          // 获取交通信息
          const state = item.properties.state || -1;
          const color = getColorByState(state);

          // 创建样式
          const style = new Style({
            stroke: new Stroke({
              color: color,
              width: props.lineWidth,
            }),
          });

          // 创建要素
          const feature = new Feature({
            // @ts-ignore - 忽略LineString类型兼容性问题
            geometry: lineString,
            road_name: item.properties.road_name,
            speed: parseFloat(item.properties.speed) || 0,
            state: item.properties.state,
            travel_time: item.properties.travel_time,
            length: item.properties.length,
            // 使用数据中的gid字段作为Feature的唯一ID
            feature_id: item.properties.gid.toString(),
            gid: item.properties.gid,
          });

          feature.setStyle(style);
          features.push(feature);
        }
      });
    }

    return features;
  } catch (error) {
    console.warn("Failed to load traffic data from URL:", error);
    return [];
  }
};

// 初始化交通层
const initTrafficLayer = () => {
  if (!map.value?.map) return;

  // 创建ImageCanvas源
  const imageCanvasSource = new ImageCanvas({
    canvasFunction: (extent: Extent, resolution: number, pixelRatio: number, size: Size) => {
      const canvas = document.createElement("canvas");
      canvas.width = size[0];
      canvas.height = size[1];

      // 绘制交通数据
      getCanvasVectorContext(canvas, extent, resolution, pixelRatio);

      return canvas;
    },
    ratio: 1,
  });

  // 创建图像层
  trafficLayer.value = new ImageLayer({
    source: imageCanvasSource,
  });

  // 使用 useParent 添加到正确的父级组件
  // @ts-ignore - 忽略ImageLayer类型兼容性问题
  addLayer(trafficLayer.value);
  debouncedUpdateTrafficData();
};

// 更新交通数据
const updateTrafficData = async () => {
  if (!trafficLayer.value) return;

  try {
    // 加载真实交通数据
    trafficFeatures.value = await loadTrafficDataFromJson();

    // 触发图层重新绘制
    const source = trafficLayer.value!.getSource() as ImageCanvas;
    source.changed();
  } catch (error) {
    console.warn("Failed to update traffic data:", error);
  }
};

// 创建防抖版本的数据更新函数，2秒内只会触发一次请求
const debouncedUpdateTrafficData = debounce(2000, updateTrafficData);

// 启动定时更新
const startUpdate = () => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value);
  }

  updateTimer.value = setInterval(() => {
    updateTrafficData();
  }, props.updateInterval);
};

// 停止定时更新
const stopUpdate = () => {
  if (updateTimer.value) {
    clearInterval(updateTimer.value);
    updateTimer.value = undefined;
  }
};

// 监听visible属性变化
watch(
  () => props.visible,
  visible => {
    if (trafficLayer.value) {
      // 由 useBaseLayer 统一管理 visible 属性
      // trafficLayer.value.setVisible(visible);
      if (visible) {
        startUpdate();
      } else {
        stopUpdate();
      }
    }
  },
);

// 监听updateInterval属性变化
watch(
  () => props.updateInterval,
  () => {
    if (props.visible) {
      startUpdate();
    }
  },
);

// 监听colors属性变化
watch(
  () => props.colors,
  () => {
    debouncedUpdateTrafficData();
  },
  { deep: true },
);

// 监听lineWidth属性变化
watch(
  () => props.lineWidth,
  () => {
    debouncedUpdateTrafficData();
  },
);

// 监听url属性变化
watch(
  () => props.url,
  () => {
    debouncedUpdateTrafficData();
  },
);

// 监听requestParams属性变化
watch(
  () => props.requestParams,
  () => {
    debouncedUpdateTrafficData();
  },
  { deep: true },
);

// 监听where属性变化
watch(
  () => props.where,
  () => {
    debouncedUpdateTrafficData();
  },
);

// 监听geometry属性变化
watch(
  () => props.geometry,
  () => {
    debouncedUpdateTrafficData();
  },
);

// 监听地图缩放级别变化，自动调整道路级别显示
const mapZoomHandler = () => {
  // 地图缩放级别变化时，使用统一的防抖更新
  debouncedUpdateTrafficData();
};

// 监听地图移动，如果使用的是当前视窗范围则更新数据
const mapMoveHandler = () => {
  if (!props.geometry) {
    // 只有在没有自定义geometry参数时才在地图移动时更新
    debouncedUpdateTrafficData();
  }
};

// 不再需要单独的节流和防抖函数，所有操作都使用统一的debouncedUpdateTrafficData
// 这样可以确保2秒内只会触发一次请求

onMounted(() => {
  if (map.value?.map) {
    initTrafficLayer();

    // 直接绑定事件处理函数，所有操作都使用统一的debouncedUpdateTrafficData防抖
    map.value.map.getView().on("change:resolution", mapZoomHandler);
    map.value.map.getView().on("change:center", mapMoveHandler);

    // 绑定鼠标事件监听器
    map.value.map.on("pointermove", handleMouseMove);
    map.value.map.on("click", handleMapClick);

    if (props.visible) {
      startUpdate();
    }
  }
});

onBeforeUnmount(() => {
  stopUpdate();

  // 移除地图事件监听
  if (map.value?.map) {
    map.value.map.getView().un("change:resolution", mapZoomHandler);
    map.value.map.getView().un("change:center", mapMoveHandler);

    // 移除鼠标事件监听器
    map.value.map.un("pointermove", handleMouseMove);
    map.value.map.un("click", handleMapClick);

    // 重置鼠标样式
    map.value.map.getTargetElement().style.cursor = "default";
  }

  // 取消未完成的防抖操作
  debouncedUpdateTrafficData.cancel();

  // 由于 useParent 可能将图层添加到不同的父级组件，清理时需要更加谨慎
  if (trafficLayer.value) {
    try {
      // 如果是直接添加到地图上
      // @ts-ignore - 忽略ImageLayer类型兼容性问题
      if (map.value?.map && map.value.map.getLayers().getArray().includes(trafficLayer.value)) {
        // @ts-ignore - 忽略ImageLayer类型兼容性问题
        map.value.map.removeLayer(trafficLayer.value);
      }
      // TODO: 如果是添加到 GroupLayer，可能需要其他清理方式
    } catch (error) {
      console.warn("Failed to remove traffic layer:", error);
    }
  }
});

// 暴露方法给父组件
defineExpose({
  /**
   * 获取交通图层实例
   */
  getLayer: () => trafficLayer.value,
  /**
   * 手动更新交通数据
   */
  updateData: updateTrafficData,
  /**
   * 开始自动更新
   */
  startAutoUpdate: startUpdate,
  /**
   * 停止自动更新
   */
  stopAutoUpdate: stopUpdate,
  /**
   * 获取当前的where参数
   */
  getCurrentWhere: getCurrentWhereParam,
  /**
   * 获取当前的geometry参数
   */
  getCurrentGeometry: getCurrentGeometryParam,
  /**
   * 获取当前地图缩放级别
   */
  getCurrentZoom: () => map.value?.map?.getView().getZoom() || 10,
  /**
   * 获取当前地图视窗范围
   */
  getCurrentExtent: () => map.value?.map?.getView().calculateExtent(map.value.map.getSize()),
});
</script>

<template>
  <div v-if="showLegend" class="traffic-legend">
    <div class="legend-title">交通状况</div>
    <div class="legend-item">
      <span class="legend-color" :style="{ backgroundColor: colors[0] }"></span>
      <span class="legend-text">畅通</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" :style="{ backgroundColor: colors[1] }"></span>
      <span class="legend-text">缓慢</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" :style="{ backgroundColor: colors[2] }"></span>
      <span class="legend-text">拥堵</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" :style="{ backgroundColor: colors[3] }"></span>
      <span class="legend-text">严重拥堵</span>
    </div>
    <div class="legend-item">
      <span class="legend-color" :style="{ backgroundColor: colors[4] }"></span>
      <span class="legend-text">无数据</span>
    </div>
  </div>
  <slot></slot>
</template>

<style scoped>
.traffic-legend {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  font-size: 12px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.legend-color {
  width: 16px;
  height: 3px;
  margin-right: 6px;
  border-radius: 2px;
}

.legend-text {
  color: #666;
}
</style>
