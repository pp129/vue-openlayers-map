/**
 * 通用辅助工具函数
 * 从 src/utils/index.js 中提取核心功能并优化
 */

import { nanoid } from "nanoid";
import { Feature } from "ol";
import { Point, LineString, Polygon, Circle, MultiPoint, MultiPolygon } from "ol/geom";
import { Fill, Icon, Stroke, Style, Text, RegularShape } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { transform } from "ol/proj";
import coordtransform from "@/utils/coordtransform";

/**
 * Feature 扩展类
 * 优化: 简化原有的 FeatureExt 实现
 */
export class FeatureExt extends Feature {
  /**
   * 更新元素位置
   */
  setPosition(coordinates) {
    this.getGeometry().setCoordinates(coordinates);
  }

  /**
   * 获取元素位置
   */
  getPosition() {
    return this.getGeometry().getCoordinates();
  }

  /**
   * 设置旋转角度 (度数)
   */
  setRotateAngle(angle) {
    const image = this.getStyle()?.getImage();
    if (image && typeof image.setRotation === "function") {
      // 转换为弧度 (deg * π / 180)
      image.setRotation(angle * 0.01745329251);
    }
  }

  /**
   * 更新元素属性
   */
  update(key, value) {
    if (key === "style") {
      this.setStyle(setStyle(value));
    } else if (key === "position") {
      this.setPosition(value);
    } else {
      this.set(key, value);
    }
  }
}

/**
 * 判断对象有效 key
 * @param {Object} obj - 对象
 * @param {string} key - 键名
 * @returns {boolean}
 */
export const validObjKey = (obj, key) => {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    if (typeof obj[key] === "object") {
      return Object.keys(obj[key]).length > 0;
    } else if (typeof obj[key] === "boolean") {
      return obj[key];
    } else {
      return true;
    }
  }
  return false;
};

/**
 * 判断是否为函数
 */
export const isFunction = (obj) => {
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

/**
 * 坐标转换
 * @param {Array} coordinate - 坐标 [lon, lat]
 * @param {string} convert - 转换类型
 * @returns {Array} 转换后的坐标
 */
export const convertCoordinate = (coordinate, convert) => {
  if (!convert || !coordinate) return coordinate;

  switch (convert) {
    case "bd-84":
      return coordtransform.bd09towgs84(coordinate[0], coordinate[1]);
    case "bd-gd":
      return coordtransform.bd09togcj02(coordinate[0], coordinate[1]);
    case "gd-84":
      return coordtransform.gcj02towgs84(coordinate[0], coordinate[1]);
    case "gd-bd":
      return coordtransform.gcj02tobd09(coordinate[0], coordinate[1]);
    case "84-gd":
      return coordtransform.wgs84togcj02(coordinate[0], coordinate[1]);
    case "84-bd":
      return coordtransform.wgs84tobd09(coordinate[0], coordinate[1]);
    case "3857-4326":
      return transform(coordinate, "EPSG:3857", "EPSG:4326");
    case "4326-3857":
      return transform(coordinate, "EPSG:4326", "EPSG:3857");
    default:
      return coordinate;
  }
};

/**
 * 设置文本样式
 * @param {Object} option - 文本选项
 * @returns {Text}
 */
export const setText = (option) => {
  const defaultParam = {
    font: "14px sans-serif",
    padding: [2, 5, 2, 5],
  };
  const defaultOption = { ...defaultParam, ...option };
  const textStyle = new Text(defaultOption);

  if (validObjKey(option, "fill")) {
    textStyle.setFill(new Fill(option.fill));
  }
  if (validObjKey(option, "backgroundFill")) {
    textStyle.setBackgroundFill(new Fill(option.backgroundFill));
  }
  if (validObjKey(option, "stroke")) {
    textStyle.setStroke(new Stroke(option.stroke));
  }
  if (validObjKey(option, "backgroundStroke")) {
    textStyle.setBackgroundStroke(new Stroke(option.backgroundStroke));
  }

  return textStyle;
};

/**
 * 设置圆形样式
 * @param {Object} option - 圆形选项
 * @returns {CircleStyle}
 */
export const setCircleStyle = (option) => {
  const optionCircle = {
    radius: option.radius || 2,
    fill: new Fill(option.fill || { color: "blue" }),
    stroke: new Stroke(option.stroke || { color: "white" }),
  };
  return new CircleStyle(optionCircle);
};

/**
 * 设置样式
 * @param {Object} option - 样式选项
 * @returns {Style}
 */
export const setStyle = (option) => {
  const style = new Style();

  // Fill
  if (validObjKey(option, "fill")) {
    style.setFill(new Fill(option.fill));
  } else {
    style.setFill(new Fill({ color: "rgba(67,126,255,0.15)" }));
  }

  // Stroke
  if (validObjKey(option, "stroke")) {
    style.setStroke(new Stroke(option.stroke));
  } else {
    style.setStroke(new Stroke({ color: "rgba(67,126,255,1)", width: 1 }));
  }

  // Icon
  if (validObjKey(option, "icon")) {
    style.setImage(new Icon(option.icon));
  }

  // Circle
  if (validObjKey(option, "circle")) {
    style.setImage(setCircleStyle(option.circle));
  }

  // Text
  if (validObjKey(option, "text")) {
    style.setText(setText(option.text));
  }

  // Shape (RegularShape)
  if (validObjKey(option, "shape")) {
    let shapeFill, shapeStroke;
    if (validObjKey(option.shape, "fill")) {
      shapeFill = new Fill(option.shape.fill);
    }
    if (validObjKey(option.shape, "stroke")) {
      shapeStroke = new Stroke(option.shape.stroke);
    }
    const shapeOptions = {
      ...option.shape,
      stroke: shapeStroke,
      fill: shapeFill,
    };
    style.setImage(new RegularShape(shapeOptions));
  }

  return style;
};

/**
 * 设置 Feature 样式
 * @param {Feature} feature - 要素
 * @param {Object} style - 样式配置
 * @param {Map} map - 地图实例
 */
export const setFeatureStyle = (feature, style, map) => {
  const featureStyle = setStyle(style);

  if (validObjKey(style, "styleFunction")) {
    feature.setStyle((feature, resolution) => {
      return style.styleFunction(feature, resolution, map, featureStyle);
    });
  } else {
    feature.setStyle(featureStyle);
  }
};

/**
 * 创建点要素
 * @param {Object} option - 点选项
 * @param {Map} map - 地图实例
 * @param {boolean} hasStyle - 是否已有样式
 * @returns {FeatureExt}
 */
export const setPointFeature = (option, map, hasStyle = false) => {
  const coordinates = convertCoordinate(option.coordinates, option.convert);
  const feature = new FeatureExt({
    geometry: new Point(coordinates),
  });

  // 设置样式
  if (validObjKey(option, "style")) {
    setFeatureStyle(feature, option.style, map);
  } else if (!hasStyle) {
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color: "blue" }),
        }),
      })
    );
  }

  // 设置 ID
  feature.setId(option.id || `feature-${nanoid()}`);

  // 设置属性
  if (typeof option === "object") {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        feature.set(key, option[key]);
      }
    }
  }

  return feature;
};

/**
 * 创建线要素
 * @param {Object} option - 线选项
 * @returns {FeatureExt}
 */
export const setPolyline = (option) => {
  let coordinates = [];
  if (validObjKey(option, "convert") && option.convert) {
    option.coordinates.forEach((coordinate) => {
      coordinates.push(convertCoordinate(coordinate, option.convert));
    });
  } else {
    coordinates = option.coordinates;
  }

  const feature = new FeatureExt({
    geometry: new LineString(coordinates),
  });

  feature.setId(option.id || `polyline-${nanoid()}`);

  // 设置属性
  if (typeof option === "object") {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        feature.set(key, option[key]);
      }
    }
  }

  return feature;
};

/**
 * 创建面要素
 * @param {Object} option - 面选项
 * @returns {FeatureExt}
 */
export const setPolygon = (option) => {
  let coordinates = [];
  if (validObjKey(option, "convert") && option.convert) {
    option.coordinates.forEach((coordinate) => {
      coordinates.push(convertCoordinate(coordinate, option.convert));
    });
  } else {
    coordinates = option.coordinates;
  }

  const feature = new FeatureExt({
    geometry: new Polygon(coordinates),
  });

  feature.setId(option.id || `polygon-${nanoid()}`);

  // 设置属性
  if (typeof option === "object") {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        feature.set(key, option[key]);
      }
    }
  }

  return feature;
};

/**
 * 创建圆要素
 * @param {Object} option - 圆选项
 * @param {Map} map - 地图实例
 * @returns {FeatureExt}
 */
export const setCircle = (option, map) => {
  const coordinates = convertCoordinate(option.center, option.convert);
  const feature = new FeatureExt({
    geometry: new Circle(coordinates, getRadiusByUnit(map, option.radius)),
  });

  feature.setId(option.id || `circle-${nanoid()}`);
  feature.set("type", "circle");

  return feature;
};

/**
 * 获取以米为单位的半径
 * @param {Map} map - 地图实例
 * @param {number} radius - 半径
 * @returns {number}
 */
export const getRadiusByUnit = (map, radius) => {
  const metersPerUnit = map.getView().getProjection().getMetersPerUnit();
  return radius / metersPerUnit;
};

/**
 * 创建要素 (自动判断类型)
 * @param {Object} option - 要素选项
 * @param {Map} map - 地图实例
 * @param {boolean} hasStyle - 是否已有样式
 * @returns {FeatureExt}
 */
export const setFeature = (option, map, hasStyle = false) => {
  if (!validObjKey(option, "type")) {
    return setPointFeature(option, map, hasStyle);
  }

  const type = option.type.toLowerCase();
  const typeMap = {
    point: () => setPointFeature(option, map, hasStyle),
    multipoint: () => setMultiPoint(option, map, hasStyle),
    polygon: () => setPolygon(option),
    multipolygon: () => setMultiPolygon(option),
    polyline: () => setPolyline(option),
    linestring: () => setPolyline(option),
    circle: () => setCircle(option, map),
  };

  return typeMap[type] ? typeMap[type]() : setPointFeature(option, map, hasStyle);
};

/**
 * 批量创建要素
 * @param {Array} features - 要素数组
 * @param {Map} map - 地图实例
 * @param {boolean} hasStyle - 是否已有样式
 * @returns {Array<FeatureExt>}
 */
export const setFeatures = (features, map, hasStyle = false) => {
  return features.map((feature) => setFeature(feature, map, hasStyle));
};

/**
 * 创建多点要素
 * @param {Object} option - 多点选项
 * @param {Map} map - 地图实例
 * @param {boolean} hasStyle - 是否已有样式
 * @returns {FeatureExt}
 */
export const setMultiPoint = (option, map, hasStyle = false) => {
  let coordinates = [];
  if (validObjKey(option, "convert") && option.convert) {
    option.coordinates.forEach((coordinate) => {
      coordinates.push(convertCoordinate(coordinate, option.convert));
    });
  } else {
    coordinates = option.coordinates;
  }

  const feature = new FeatureExt({
    geometry: new MultiPoint(coordinates),
  });

  if (validObjKey(option, "style")) {
    setFeatureStyle(feature, option.style, map);
  } else if (!hasStyle) {
    feature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color: "blue" }),
        }),
      })
    );
  }

  feature.setId(option.id || `multipoint-${nanoid()}`);

  // 设置属性
  if (typeof option === "object") {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        feature.set(key, option[key]);
      }
    }
  }

  return feature;
};

/**
 * 创建多面要素
 * @param {Object} option - 多面选项
 * @returns {FeatureExt}
 */
export const setMultiPolygon = (option) => {
  let coordinates = [];
  if (validObjKey(option, "convert") && option.convert) {
    option.coordinates.forEach((coordinate) => {
      coordinates.push(convertCoordinate(coordinate, option.convert));
    });
  } else {
    coordinates = option.coordinates;
  }

  const feature = new FeatureExt({
    geometry: new MultiPolygon(coordinates),
  });

  feature.setId(option.id || `multipolygon-${nanoid()}`);

  // 设置属性
  if (typeof option === "object") {
    for (const key in option) {
      if (Object.prototype.hasOwnProperty.call(option, key)) {
        feature.set(key, option[key]);
      }
    }
  }

  return feature;
};

/**
 * 地图飞行到指定位置
 * @param {Map} map - 地图实例
 * @param {Object} param - 参数配置
 */
export const flyTo = (map, param) => {
  const duration = param.duration || 2000;
  const view = map.getView();
  const zoom = param.zoom || view.getZoom();
  let parts = 2;
  let called = false;

  function callback() {
    --parts;
    if (called) return;
    if (parts === 0) {
      called = true;
      if (param.callback) param.callback();
    }
  }

  view.animate(
    {
      center: param.center,
      duration,
    },
    callback
  );

  view.animate(
    {
      zoom: param.flyZoom || zoom - 1,
      duration: duration / 2,
    },
    {
      zoom,
      duration: duration / 2,
    },
    callback
  );
};

/**
 * 地图平移到指定位置
 * @param {Map} map - 地图实例
 * @param {Object} param - 参数配置
 */
export const panTo = (map, param) => {
  map.getView().animate(param);
};
