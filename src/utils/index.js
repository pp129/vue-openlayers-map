import "ol/ol.css";
import { Feature, Map, View } from "ol";
import { defaults as defaultInteraction, DragRotateAndZoom } from "ol/interaction";
import { Attribution, FullScreen, Rotate, ScaleLine, Zoom, ZoomSlider } from "ol/control";
import { getCenterByCity } from "@/utils/cityMap.js";
import projzh from "@/utils/projConvert";
import { addCoordinateTransforms, addProjection, Projection, transform } from "ol/proj";
import { applyTransform, containsCoordinate, containsExtent, getHeight, getWidth, getCenter } from "ol/extent";
import { distance, point, polygon, centroid } from "@turf/turf";
import coordtransform, { gcj02towgs84 } from "@/utils/coordtransform";
import { Circle, LineString, MultiPoint, MultiPolygon, Point, Polygon } from "ol/geom";
import { Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { nanoid } from "nanoid";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import ImageCanvasSource from "ol/source/ImageCanvas";
import { getArea, getLength } from "ol/sphere";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
proj4.defs("EPSG:4548", "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs +type=crs");
proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs +type=crs");
register(proj4);
/**
 * Map扩展
 */
const e = function (t, r, s, i, a, n) {
  t.getSource()._forEachFeatureAtCoordinate &&
    t.getSource()._forEachFeatureAtCoordinate(
      r,
      s,
      function (e) {
        return i(e, t);
      },
      a,
      n
    );
};
Map.prototype.forEachSmFeatureAtPixel = function (t, r, s, i) {
  const a =
    s && s.layerFilter
      ? s.layerFilter
      : function () {
          return !0;
        };
  const n = this.getLayers().getArray();
  const o = this.getView().getResolution();
  const l = this.getCoordinateFromPixel(t);
  for (let ss = 0; ss < n.length; ss++) {
    const h = n[ss];
    // console.log(h)
    // eslint-disable-next-line no-useless-call
    h.getVisible() && a.call(null, h) && e(h, l, o, r, t, i);
  }
  // t:pixel, r:callback(feature,layer), s:options
  return this.forEachFeatureAtPixel(t, r, s);
};
const getGraphicsInExtent = function (source, e) {
  const t = [];
  // eslint-disable-next-line multiline-ternary
  return e
    ? (source.get("graphics").map(function (r) {
        // eslint-disable-next-line no-sequences
        return containsExtent(e, r.getGeometry().getExtent()) && t.push(r), r;
      }),
      t)
    : (source.get("graphics").map(function (e) {
        // eslint-disable-next-line no-sequences
        return t.push(e), e;
      }),
      t);
};
ImageCanvasSource.prototype._forEachFeatureAtCoordinate = function (e, r, s, i, a) {
  const n = getGraphicsInExtent(this);
  for (let o = n.length - 1; o >= 0; o--) {
    const l = n[o]._style;
    if (!l) return;
    const h = n[o]._coordinates;
    const u = l.getImage();
    let c = !1;

    const _t = [];
    // eslint-disable-next-line no-unused-expressions,no-sequences
    // console.log(u)
    if (u.getAnchor()) {
      _t[0] = h[0] - u.getAnchor()[0] * r;
      _t[2] = h[0] + u.getAnchor()[0] * r;
      _t[1] = h[1] - u.getAnchor()[1] * r;
      _t[3] = h[1] + u.getAnchor()[1] * r;
    }
    containsCoordinate(_t, e) && (c = !0);
    // eslint-disable-next-line no-unused-expressions
    !0 !== c ? _t.isHighLight && _t._highLightClose() : (_t.isHighLight && _t._highLight(h, u, n[o], i), s && s(n[o], a));
  }
};

/**
 * 对Feature扩展
 */
export class FeatureExt extends Feature {
  /**
   * 更新元素位置
   * @param coordinates
   */
  setPosition = function (coordinates) {
    setPosition(this, coordinates);
  };

  getPosition = function () {
    return this.getGeometry().getCoordinates();
  };

  setRotateAngle = function (angle) {
    console.log(angle);
    this.getStyle()
      .getImage()
      .setRotation(angle * 0.01745329251 /* in rad / 360° = 6.28318531 rad = 2PI rad */);
  };

  /**
   * 更新元素属性
   * @param key
   * @param value
   */
  update = function (key, value) {
    if (key === "style") {
      this.setStyle(setStyle(value));
    }
    if (key === "position") {
      setPosition(this, value);
    }
  };
}

/**
 * @Describe-注册百度坐标系
 */
const baiduMercatorProj = new Projection({
  code: "baidu",
  // extent: applyTransform(extent, projzh.ll2bmerc),
  units: "m",
});
const BDProj = new Projection({
  code: "BD09",
  extent: applyTransform([-180, -90, 180, 90], projzh.ll2bmerc),
  units: "m",
});
addProjection(baiduMercatorProj);
addProjection(BDProj);
addCoordinateTransforms("EPSG:4326", baiduMercatorProj, projzh.ll2bmerc, projzh.bmerc2ll);
addCoordinateTransforms("EPSG:4326", BDProj, projzh.ll2bmerc, projzh.bmerc2ll);
addCoordinateTransforms("EPSG:3857", baiduMercatorProj, projzh.smerc2bmerc, projzh.bmerc2smerc);
addCoordinateTransforms("EPSG:3857", BDProj, projzh.smerc2bmerc, projzh.bmerc2smerc);

/**
 * @Describe-注册高德坐标系
 */
export const AMapMercatorProj = new Projection({
  code: "GCJ02",
  extent: applyTransform([-180, -90, 180, 90], projzh.ll2gcj02mc),
  units: "m",
});
addProjection(AMapMercatorProj);
addCoordinateTransforms("EPSG:4326", AMapMercatorProj, projzh.ll2gcj02mc, projzh.gcj02mc2ll);
addCoordinateTransforms("EPSG:3857", AMapMercatorProj, projzh.mc2gcj02mc, projzh.gcj02mc2mc);

/**  utils */

/**
 * 判断对象有效key
 * @param obj
 * @param key
 * @returns {*|boolean}
 */
export const validObjKey = (obj, key) => {
  if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
    // return !((typeof obj[key] === 'undefined') || (!obj[key] && obj[key] !== 0))
    if (typeof obj[key] === "object") {
      return Object.keys(obj[key]).length > 0;
    } else if (typeof obj[key] === "boolean") {
      return obj[key];
    } else {
      return true;
    }
  } else {
    return false;
  }
};

export const isFunction = (obj) => {
  // In some browsers, typeof returns "function" for HTML <object> elements
  // (i.e., `typeof document.createElement( "object" ) === "function"`).
  // We don't want to classify *any* DOM node as a function.
  return typeof obj === "function" && typeof obj.nodeType !== "number";
};

/**
 * 设置元素位置
 * @param feature
 * @param coordinates
 */
export const setPosition = (feature, coordinates) => {
  feature.getGeometry().setCoordinates(coordinates);
};

export const convertCoordinate = (coordinate, convert) => {
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

/** styles */

export const setCircleStyle = (option) => {
  const optionCircle = {
    radius: option.radius || 2,
    fill: new Fill(option.fill || { color: "blue" }),
    stroke: new Stroke(option.stroke || { color: "white" }),
  };
  return new CircleStyle(optionCircle);
};

/**
 * 设置文本样式
 * @param option
 * @returns {Text}
 */
export const setText = (option) => {
  const defaultParam = {
    font: "14px sans-serif",
    padding: [2, 5, 2, 5], // [top, right, bottom, left].
  };
  const defaultOption = { ...defaultParam, ...option };
  const textStyle = new Text(defaultOption);
  if (validObjKey(option, "fill")) {
    const fillStyle = new Fill(option.fill);
    textStyle.setFill(fillStyle);
  }
  if (validObjKey(option, "backgroundFill")) {
    const backgroundFillStyle = new Fill(option.backgroundFill);
    textStyle.setBackgroundFill(backgroundFillStyle);
  }
  if (validObjKey(option, "stroke")) {
    const strokeStyle = new Stroke(option.stroke);
    textStyle.setStroke(strokeStyle);
  }
  if (validObjKey(option, "backgroundStroke")) {
    const backgroundStrokeStyle = new Stroke(option.backgroundStroke);
    textStyle.setBackgroundStroke(backgroundStrokeStyle);
  }
  return textStyle;
};

/**
 * 获取样式
 * @param option
 */
export const setStyle = (option) => {
  const style = new Style();
  if (validObjKey(option, "fill")) {
    style.setFill(new Fill(option.fill));
  } else {
    style.setFill(
      new Fill({
        color: "rgba(67,126,255,0.15)",
      })
    );
  }
  if (validObjKey(option, "stroke")) {
    style.setStroke(new Stroke(option.stroke));
  } else {
    style.setStroke(
      new Stroke({
        color: "rgba(67,126,255,1)",
        width: 1,
        // lineDash: [20, 10, 20, 10]
      })
    );
  }
  if (validObjKey(option, "icon")) {
    style.setImage(new Icon(option.icon));
  }
  if (validObjKey(option, "circle")) {
    const circle = setCircleStyle(option.circle);
    style.setImage(circle);
  }
  if (validObjKey(option, "text")) {
    const optionText = option.text;
    const textStyle = setText(optionText);
    style.setText(textStyle);
  }
  if (validObjKey(option, "shape")) {
    let shapeFill;
    let shapeStroke;
    if (validObjKey(option.shape, "fill")) {
      shapeFill = new Fill(option.shape.fill);
    }
    if (validObjKey(option.shape, "stroke")) {
      shapeStroke = new Stroke(option.shape.stroke);
    }
    const shapeOptions = {
      ...option.shape,
      ...{
        stroke: shapeStroke,
        fill: shapeFill,
      },
    };
    const shape = new RegularShape(shapeOptions);
    style.setImage(shape);
  }
  return style;
};

export const setFeatureStyle = (feature, style, map) => {
  const featureStyle = setStyle(style);
  feature.setStyle(featureStyle);
  if (validObjKey(style, "styleFunction")) {
    feature.setStyle(function (feature, resolution) {
      return style.styleFunction(feature, resolution, map, featureStyle);
    });
  } else {
    feature.setStyle(featureStyle);
  }
  if (validObjKey(style, "gif")) {
    const option = style.gif;
    const gifOption = {
      opacity: 1,
      scale: 1,
      offset: [0, 0],
      offsetOrigin: "top-left",
      anchor: [0.5, 0.5],
      anchorOrigin: "top-left",
      rotation: 0,
      rotateWithView: false,
      ...option,
    };
    // eslint-disable-next-line no-undef
    const gif = gifler(gifOption.src);
    gif.frames(
      document.createElement("canvas"),
      function (ctx, frame) {
        feature.setStyle(
          new Style({
            image: new Icon({
              img: ctx.canvas,
              imgSize: [frame.width, frame.height],
              opacity: gifOption.opacity,
              offset: gifOption.offset,
              offsetOrigin: gifOption.offsetOrigin,
              anchor: gifOption.anchor,
              anchorOrigin: gifOption.anchorOrigin,
              scale: gifOption.scale,
              rotation: gifOption.rotation,
              rotateWithView: gifOption.rotateWithView,
            }),
          })
        );
        ctx.clearRect(0, 0, frame.width, frame.height);
        ctx.drawImage(frame.buffer, frame.x, frame.y);
        map.render();
      },
      true
    );
  }
};

/** features */

/**
 * 设置多元素
 * @param features
 * @param map
 * @param hasStyle
 * @returns {*[]}
 */
export const setFeatures = (features, map, hasStyle = false) => {
  return features.map((val) => {
    return setFeature(val, map, hasStyle);
  });
};

/**
 * 设置元素
 * @param option
 * @param map
 * @param hasStyle
 * @returns {FeatureExt}
 */
export const setFeature = (option, map, hasStyle = false) => {
  if (validObjKey(option, "type")) {
    const type = option.type;
    switch (type) {
      case "point":
      case "Point":
        return setPointFeature(option, map, hasStyle);
      case "MultiPoint":
        return setMultiPoint(option, map, hasStyle);
      case "polygon":
      case "Polygon":
        return setPolygon(option);
      case "MultiPolygon":
        return setMultiPolygon(option);
      case "polyline":
      case "Polyline":
      case "LineString":
        return setPolyline(option);
      case "circle":
      case "Circle":
        return setCircle(option, map);
      default:
        return setPointFeature(option, map, hasStyle);
    }
  } else {
    return setPointFeature(option, map, hasStyle);
  }
};

/**
 * 获取点类型元素
 * @param option
 * @param map
 * @param hasStyle
 * @returns {FeatureExt}
 */
export const setPointFeature = (option, map, hasStyle = false) => {
  const coordinates = convertCoordinate(option.coordinates, option.convert);
  const feature = new FeatureExt({
    geometry: new Point(coordinates),
  });
  // newFeaturePrototype(feature)
  if (validObjKey(option, "style")) {
    setFeatureStyle(feature, option.style, map);
  } else if (!hasStyle) {
    feature.setStyle(
      new Style({
        zIndex: 1,
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({
            color: "blue",
          }),
        }),
      })
    );
  }
  if (validObjKey(option, "id")) {
    feature.setId(option.id);
  } else {
    feature.setId(`feature-${nanoid()}`);
  }
  if (typeof option === "object") {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i]);
      }
    }
  }
  if (validObjKey(option, "coordinates") && validObjKey(option, "convert")) {
    feature.set("coordinates", coordinates);
  }
  return feature;
};

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
        zIndex: 1,
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({
            color: "blue",
          }),
        }),
      })
    );
  }
  if (validObjKey(option, "id")) {
    feature.setId(option.id);
  } else {
    feature.setId(`feature-${nanoid()}`);
  }
  feature.setId(option.id || `MultiPoint-${nanoid()}`);
  if (typeof option === "object") {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i]);
      }
    }
  }
  return feature;
};

/**
 * 获取多边形类型元素
 * @param option
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
    geometry: new Polygon([coordinates]),
  });
  feature.setId(option.id || `polygon-${nanoid()}`);
  if (typeof option === "object") {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i]);
      }
    }
  }
  return feature;
};

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
    geometry: new MultiPolygon([coordinates]),
  });
  feature.setId(option.id || `polygon-${nanoid()}`);
  if (typeof option === "object") {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i]);
      }
    }
  }
  return feature;
};

/**
 * 获取折线类型元素
 * @param option
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
  feature.set("style", option.style || null);
  feature.set("type", option.type || "polyline");
  feature.set("properties", option.properties || null);
  if (typeof option === "object") {
    for (const i in option) {
      if (Object.prototype.hasOwnProperty.call(option, i)) {
        feature.set(i, option[i]);
      }
    }
  }
  return feature;
};

/**
 * 获取圆形类型元素
 * @param option
 * @param map
 * @returns {FeatureExt}
 */
export const setCircle = (option, map) => {
  const coordinates = convertCoordinate(option.center, option.convert);
  const feature = new FeatureExt({
    geometry: new Circle(coordinates, getRadiusByUnit(map, option.radius)),
  });
  feature.setId(option.id || `circle-${nanoid()}`);
  feature.set("style", option.style || null);
  feature.set("type", option.type || "circle");
  feature.set("properties", option.properties || null);
  return feature;
};

/**
 * 获取以米为单位的半径
 * @param map
 * @param radius
 * @returns {number}
 */
export const getRadiusByUnit = (map, radius) => {
  const metersPerUnit = map.getView().getProjection().getMetersPerUnit();
  return radius / metersPerUnit;
};

/** source */

export const addVectorSource = (option, map) => {
  let features = [];
  if (validObjKey(option, "features")) {
    features = option.features;
  }
  if (validObjKey(option, "projection")) {
    if (option.projection === "GCJ02") {
      option.projection = gcj02towgs84;
    }
  }
  const source = { ...option, ...{ features: setFeatures(features, map) } };
  return new VectorSource(source);
};

/**
 * 设置聚合样式
 * @param style
 * @param text
 */
export const clusterFeatureStyle = (style, text) => {
  const textStyle = { ...style.text, ...{ text } };
  return { ...style, ...{ text: textStyle } };
};

/**
 * 添加聚合图层
 * @param option
 * @param map
 * @returns {VectorLayer<VectorSourceType>}
 */
export const addClusterLayer = (option, map) => {
  const clusterSource = option.source;
  const total = option.source.getSource().getFeatures().length;
  const styleCache = {};
  const clusterOptions = {
    source: clusterSource,
    style: function (feature) {
      const size = feature.get("features").length;
      let style = styleCache[size];
      if (size > 1) {
        if (!style) {
          let styleOptions = {};
          if (!validObjKey(option, "style") || !option.style) {
            // 无style属性设置默认样式
            styleOptions = {
              image: new CircleStyle({
                radius: 20,
                stroke: new Stroke({
                  color: "#fff",
                }),
                fill: new Fill({
                  color: "#3399CC",
                }),
              }),
              text: new Text({
                font: "16px sans-serif",
                text: size.toString(),
                fill: new Fill({
                  color: "#fff",
                }),
              }),
            };
            style = new Style(styleOptions);
          } else {
            if (option.style instanceof Array) {
              option.style.forEach((e) => {
                let min = 0;
                let max = total;
                if (validObjKey(e, "min") || validObjKey(e, "max")) {
                  min = e.min;
                  max = e.max;
                  if (min < size && size <= max) {
                    styleOptions = clusterFeatureStyle(e, size.toString());
                  }
                } else {
                  if (total > 0) {
                    const average = total / option.style.length;
                    for (let i = 0; i < option.style.length; i++) {
                      min = i * average;
                      max = average * (i + 1);
                      if (min < size && size <= max) {
                        styleOptions = clusterFeatureStyle(option.style[i], size.toString());
                      }
                    }
                  }
                }
              });
              style = setStyle(styleOptions);
            } else {
              styleOptions = clusterFeatureStyle(option.style, size.toString());
              style = setStyle(styleOptions);
            }
          }
          styleCache[size] = style;
        }
      } else {
        // style = setStyle(feature.get('features')[0].get('style'))
        const styleOption = feature.get("features")[0].get("style");
        if (styleOption && Object.keys(styleOption).length > 0) {
          style = setStyle(styleOption);
        } else {
          style = new Style({
            image: new CircleStyle({
              radius: 4,
              fill: new Fill({
                color: "blue",
              }),
            }),
          });
        }
      }
      return style;
    },
  };
  return new VectorLayer(clusterOptions);
};

export const setImage = (option) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = option.src;
    image.onload = () => {
      return resolve(
        new Style({
          image: new Icon({
            img: image,
            imgSize: [34, 37],
          }),
        })
      );
    };
  });
};

/**
 * 地图移动中心点
 * @param map
 * @param param
 */
export const panTo = (map, param) => {
  map.getView().animate(param);
};

export const flyTo = (map, param) => {
  const duration = param.duration || 2000;
  const view = map.getView();
  const zoom = param.zoom || view.getZoom();
  let parts = 2;
  let called = false;
  function callback() {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0) {
      called = true;
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

export const setCenter = (map, center) => {
  map.getView().setCenter(center);
};

export const setZoom = (map, zoom) => {
  map.getView().setZoom(zoom);
};

export const setConstrainResolution = (map, enabled) => {
  map.getView().setConstrainResolution(enabled);
};

export const setMaxZoom = (map, zoom) => {
  map.getView().setMaxZoom(zoom);
};

export const setMinZoom = (map, zoom) => {
  map.getView().setMinZoom(zoom);
};

export const exportPNG = (map, downLoadId) => {
  map.once("rendercomplete", function () {
    const mapCanvas = document.createElement("canvas");
    const size = map.getSize();
    mapCanvas.width = size[0];
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext("2d");
    Array.prototype.forEach.call(map.getViewport().querySelectorAll(".ol-layer canvas, canvas.ol-layer"), function (canvas) {
      if (canvas.width > 0) {
        const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
        mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);

        const backgroundColor = canvas.parentNode.style.backgroundColor;
        if (backgroundColor) {
          mapContext.fillStyle = backgroundColor;
          mapContext.fillRect(0, 0, canvas.width, canvas.height);
        }

        let matrix;
        const transform = canvas.style.transform;
        if (transform) {
          // Get the transform parameters from the style's transform matrix
          matrix = transform
            // eslint-disable-next-line no-useless-escape
            .match(/^matrix\(([^\(]*)\)$/)[1]
            .split(",")
            .map(Number);
        } else {
          matrix = [parseFloat(canvas.style.width) / canvas.width, 0, 0, parseFloat(canvas.style.height) / canvas.height, 0, 0];
        }
        // Apply the transform to the export map context
        CanvasRenderingContext2D.prototype.setTransform.apply(mapContext, matrix);
        mapContext.drawImage(canvas, 0, 0);
      }
    });
    mapContext.globalAlpha = 1;
    if (navigator.msSaveBlob) {
      // link download attribute does not work on MS browsers
      navigator.msSaveBlob(mapCanvas.msToBlob(), "map.png");
    } else {
      const link = document.getElementById(downLoadId);
      link.href = mapCanvas.toDataURL();
      link.click();
    }
  });
  map.renderSync();
};

export const getDistancePoint = (from, to, units = "kilometers") => {
  const fromPoint = point(from);
  const toPoint = point(to);
  const options = { units };

  return distance(fromPoint, toPoint, options);
};

export const calculateCenter = (geometry) => {
  let center, coordinates, minRadius;
  const type = geometry.getType();
  if (type === "Polygon") {
    let x = 0;
    let y = 0;
    let i = 0;
    coordinates = geometry.getCoordinates()[0].slice(1);
    coordinates.forEach(function (coordinate) {
      x += coordinate[0];
      y += coordinate[1];
      i++;
    });
    center = [x / i, y / i];
  } else if (type === "LineString") {
    center = geometry.getCoordinateAt(0.5);
    coordinates = geometry.getCoordinates();
  } else {
    center = getCenter(geometry.getExtent());
  }
  let sqDistances;
  if (coordinates) {
    sqDistances = coordinates.map(function (coordinate) {
      const dx = coordinate[0] - center[0];
      const dy = coordinate[1] - center[1];
      return dx * dx + dy * dy;
    });
    minRadius = Math.sqrt(Math.max.apply(Math, sqDistances)) / 3;
  } else {
    minRadius = Math.max(getWidth(geometry.getExtent()), getHeight(geometry.getExtent())) / 3;
  }
  return {
    center,
    coordinates,
    minRadius,
    sqDistances,
  };
};

/**
 * @计算一组多边形的质心
 * @param coordinates
 * @returns {Feature<Point, Properties>}
 */
export const getCentroid = (coordinates) => {
  // 注意：polygon首尾坐标要一致
  const geometry = polygon(coordinates);
  return centroid(geometry);
};

export const setControl = (map, control, options, controlOptions) => {
  if (control === "zoom") {
    const zoom = OlMap.map.mapControlsZoom;
    if (zoom) {
      map.removeControl(OlMap.map.mapControlsZoom);
    }
    if (options) {
      OlMap.map.mapControlsZoom = new Zoom(controlOptions || OlMap.map.mapControlsZoomOptions);
      map.addControl(OlMap.map.mapControlsZoom);
    }
  } else if (control === "rotate") {
    const rotate = OlMap.map.mapControlsRotate;
    if (rotate) {
      map.removeControl(OlMap.map.mapControlsRotate);
    }
    if (options) {
      OlMap.map.mapControlsRotate = new Rotate(controlOptions || OlMap.map.mapControlsRotateOptions);
      map.addControl(OlMap.map.mapControlsRotate);
    }
  } else if (control === "attribution") {
    const attribution = OlMap.map.mapControlsAttribution;
    if (attribution) {
      map.removeControl(OlMap.map.mapControlsAttribution);
    }
    if (options) {
      OlMap.map.mapControlsAttribution = new Attribution(controlOptions || OlMap.map.mapControlsAttributionOptions);
      map.addControl(OlMap.map.mapControlsAttribution);
    }
  } else if (control === "FullScreen") {
    const fullScreen = OlMap.map.mapControlsFullScreen;
    if (fullScreen) {
      map.removeControl(OlMap.map.mapControlsFullScreen);
    }
    if (options) {
      OlMap.map.mapControlsFullScreen = new FullScreen(OlMap.map.mapControlsFullScreen);
      map.addControl(OlMap.map.mapControlsFullScreen);
    }
  } else if (control === "ScaleLine") {
    const scaleLine = OlMap.map.mapControlsScaleLine;
    if (scaleLine) {
      map.removeControl(OlMap.map.mapControlsScaleLine);
    }
    if (options) {
      OlMap.map.mapControlsScaleLine = new ScaleLine(OlMap.map.mapControlsScaleLine);
      map.addControl(OlMap.map.mapControlsScaleLine);
    }
  } else if (control === "ZoomSlider") {
    const zoomSlider = OlMap.map.mapControlsZoomSlider;
    if (zoomSlider) {
      map.removeControl(OlMap.map.mapControlsZoomSlider);
    }
    if (options) {
      OlMap.map.mapControlsZoomSlider = new ZoomSlider(OlMap.map.mapControlsZoomSlider);
      map.addControl(OlMap.map.mapControlsZoomSlider);
    }
  }
};

export const formatLength = (line) => {
  const length = getLength(line, {
    projection: "EPSG:4326",
  });
  const format = {
    kilo: Math.round((length / 1000) * 100) / 100, // km
    meter: Math.round(length * 100) / 100, // m
  };
  return {
    format,
    length,
  };
};

export const formatArea = (polygon) => {
  const area = getArea(polygon, {
    projection: "EPSG:4326",
  });
  const format = {
    kilo: Math.round((area / 1000000) * 100) / 100, // ' km\xB2',
    meter: Math.round(area * 100) / 100, // ' m\xB2'
  };
  return {
    format,
    area,
  };
};

export class OlMap {
  map = OlMap;

  controls = {
    zoom: undefined,
    zoomOptions: undefined,
    attribution: undefined,
    attributionOptions: undefined,
    rotate: undefined,
    rotateOptions: undefined,
    FullScreen: undefined,
    ScaleLine: undefined,
    ZoomSlider: undefined,
  };

  interactions = {
    DragRotateAndZoom: undefined,
  };

  constructor(option = {}) {
    // view
    const viewOptDefault = {
      center: [108.5525, 34.3227],
      zoom: 5,
      constrainResolution: true,
      projection: "EPSG:4326",
    };
    const viewOption = { ...viewOptDefault, ...option.view };
    if (validObjKey(viewOption, "city") && viewOption.city) {
      viewOption.center = getCenterByCity(viewOption.city) || viewOption.center || viewOptDefault.center;
    }
    const view = new View(viewOption);

    // controls
    const controlsDefault = {
      zoom: false,
      zoomOptions: undefined,
      rotate: false,
      rotateOptions: undefined,
      attribution: false,
      attributionOptions: undefined,
    };
    const controlsOption = { ...controlsDefault, ...option.controls };
    // const controls = defaultControls(controlsOption).extend([])

    // 生成地图
    this.map = new Map({
      target: option.target,
      view,
      controls: [],
      interactions: defaultInteraction(option.interactions),
    });

    // 动态controls
    for (const control in controlsOption) {
      if (control === "zoom") {
        this.controls[control] = new Zoom(controlsOption.zoomOptions);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      } else if (control === "attribution") {
        this.controls[control] = new Attribution(controlsOption.attributionOptions);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      } else if (control === "rotate") {
        this.controls[control] = new Rotate(controlsOption.rotateOptions);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      } else if (control === "FullScreen") {
        this.controls[control] = new FullScreen(controlsOption[control]);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      } else if (control === "ScaleLine") {
        this.controls[control] = new ScaleLine(controlsOption[control]);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      } else if (control === "ZoomSlider") {
        this.controls[control] = new ZoomSlider(controlsOption[control]);
        if (controlsOption[control]) {
          this.map.addControl(this.controls[control]);
        } else {
          this.map.removeControl(this.controls[control]);
        }
      }
    }

    for (const interaction in option.interactions) {
      if (interaction === "DragRotateAndZoom") {
        this.interactions[interaction] = new DragRotateAndZoom(option.interactions[interaction]);
        if (option.interactions[interaction]) {
          this.map.addInteraction(this.interactions[interaction]);
        } else {
          this.map.removeInteraction(this.interactions[interaction]);
        }
      }
    }
  }

  static panTo(param) {
    return panTo(OlMap.map.map, param);
  }

  static flyTo(param) {
    return flyTo(OlMap.map.map, param);
  }

  static setCenter(center) {
    return setCenter(OlMap.map.map, center);
  }

  static setZoom(zoom) {
    return setZoom(OlMap.map.map, zoom);
  }

  static setConstrainResolution(enabled) {
    return setConstrainResolution(OlMap.map.map, enabled);
  }

  static setMaxZoom(zoom) {
    return setMaxZoom(OlMap.map.map, zoom);
  }

  static setMinZoom(zoom) {
    return setMinZoom(OlMap.map.map, zoom);
  }

  static exportPNG(downLoadId) {
    return exportPNG(OlMap.map.map, downLoadId);
  }

  static getDistancePoint(from, to, units) {
    return getDistancePoint(from, to, units);
  }

  static calculateCenter(geometry) {
    return calculateCenter(geometry);
  }

  static getControl(control) {
    return OlMap.map.controls[control];
  }

  static setControl(control, options, controlOptions) {
    return setControl(OlMap.map.map, control, options, controlOptions);
  }

  get mapControlsZoom() {
    return OlMap.map.controls.zoom;
  }

  set mapControlsZoom(value) {
    OlMap.map.controls.zoom = value;
  }

  get mapControlsRotate() {
    return OlMap.map.controls.rotate;
  }

  set mapControlsRotate(value) {
    OlMap.map.controls.rotate = value;
  }

  get mapControlsAttribution() {
    return OlMap.map.controls.attribution;
  }

  set mapControlsAttribution(value) {
    OlMap.map.controls.attribution = value;
  }

  get mapControlsZoomOptions() {
    return OlMap.map.controls.zoomOptions;
  }

  set mapControlsZoomOptions(value) {
    OlMap.map.controls.zoomOptions = value;
  }

  get mapControlsRotateOptions() {
    return OlMap.map.controls.rotateOptions;
  }

  set mapControlsRotateOptions(value) {
    OlMap.map.controls.rotateOptions = value;
  }

  get mapControlsAttributionOptions() {
    return OlMap.map.controls.attributionOptions;
  }

  set mapControlsAttributionOptions(value) {
    OlMap.map.controls.attributionOptions = value;
  }

  get mapControlsFullScreen() {
    return OlMap.map.controls.FullScreen;
  }

  set mapControlsFullScreen(value) {
    OlMap.map.controls.FullScreen = value;
  }

  get mapControlsScaleLine() {
    return OlMap.map.controls.ScaleLine;
  }

  set mapControlsScaleLine(value) {
    OlMap.map.controls.ScaleLine = value;
  }

  get mapControlsZoomSlider() {
    return OlMap.map.controls.ZoomSlider;
  }

  set mapControlsZoomSlider(value) {
    OlMap.map.controls.ZoomSlider = value;
  }
}
