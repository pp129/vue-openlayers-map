<template>
  <div><slot></slot></div>
</template>

<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import {
  addClusterLayer,
  addVectorSource,
  FeatureExt,
  formatArea,
  formatLength,
  setFeatures,
  setFeatureStyle,
  setStyle,
  validObjKey,
} from "@/utils";
import { addLayerToParentComp } from "@/utils/parent";
import VectorLayer from "ol/layer/Vector";
import { Modify, Select } from "ol/interaction";
import Collection from "ol/Collection";
import { unByKey } from "ol/Observable";
import { getVectorContext } from "ol/render";
import { easeOut } from "ol/easing";
import { Stroke, Style, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { asArray } from "ol/color";
import { Cluster } from "ol/source";
import { arrowLine } from "@/utils/arrowLine";
import { Point } from "ol/geom";
import Zoom from "ol-ext/featureanimation/Zoom";
import Gyeonghwon from "gyeonghwon";

export default {
  name: "v-vector",
  extends: BaseLayer,
  // inject: ["VMap", "VGroupLayer"],
  inject: {
    VMap: {
      value: "VMap",
      default: null,
    },
    VGroupLayer: {
      value: "VGroupLayer",
      default: null,
    },
  },
  props: {
    layerId: {
      type: String,
      default: "",
    },
    source: {
      type: Object,
      default() {
        return { features: [] };
      },
    },
    features: {
      type: Array,
      default() {
        return [];
      },
    },
    layerStyle: {
      type: [Object, undefined],
      default: undefined,
    },
    FeatureStyle: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    modify: {
      type: [Object, Boolean],
      default: false,
    },
    select: {
      type: [Object, Boolean],
      default: false,
    },
    cluster: {
      type: [Object, Boolean],
      default: false,
    },
    flashTime: {
      type: Number,
    },
    overlay: {
      type: Object,
    },
  },
  data() {
    return {
      ani: null,
      layerOpt: {},
      selectObj: null,
      modifyObj: null,
      clusterObj: null,
      clusterDefault: {
        distance: 20,
        minDistance: 0,
      },
      flashInterval: null,
      styleCache: {},
      eventRender: [],
      eventList: ["singleclick", "pointermove", "dblclick"],
      gh: null, // canvas控制对象
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
    groupLayer() {
      return this.VGroupLayer?.layer;
    },
  },
  watch: {
    // 只监听是否聚合和聚合距离
    cluster: {
      handler(value) {
        console.log("watch cluster", value);
        if (value === null || value === false) {
          this.dispose();
          this.init(true);
        } else {
          if (this.clusterObj) {
            const { distance } = value;
            if (distance || distance === 0) this.clusterObj.setDistance(distance);
          } else {
            this.dispose();
            this.init(true);
          }
        }
      },
      immediate: false,
      deep: true,
    },
    features: {
      handler(value) {
        // console.log('layer features change', value)
        if (this.flashInterval) {
          clearInterval(this.flashInterval);
          this.flashInterval = null;
        }
        // const source = this.layer.getSource()
        // source.clear()
        if (this.cluster) {
          this.clusterObj.getSource().clear();
          const features = setFeatures(value, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle)?.length > 0);
          this.clusterObj.getSource().addFeatures(features);
          this.$emit("change", features);
        } else {
          const source = this.layer.getSource();
          source.clear();
          const features = setFeatures(value, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle)?.length > 0);
          features.forEach(async (feature) => {
            const prop = feature.getProperties();
            if (feature.type === "polyline" && validObjKey(feature, "arrow")) {
              arrowLine({
                coordinates: feature.coordinates,
                map: this.map,
                source,
                ...feature.arrow,
              });
            } else if (feature.getGeometry().getType() === "Point" && prop.style?.icon) {
              // 动画内容初始化
              if (prop.style.icon.animate !== undefined && prop.style.icon.animate) {
                const oldStyle = feature.getStyle();
                // canvas构造对象初始化
                if (this.gh === null) {
                  const gh = new Gyeonghwon({
                    ignoreSingle: false,
                    forceLoop: false,
                    waitingMilliSec: 10000,
                  });
                  this.gh = gh;

                  gh.addEventListener("need_render", (e) => {
                    // console.log('render opera', e)
                    this.map.render();
                    return false;
                  });
                }
                const anim = await this.gh.animateNewContext(oldStyle.getImage().getSrc());
                oldStyle.setImage(
                  new Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: "fraction", // IconAnchorUnits.FRACTION,
                    anchorYUnits: "fraction", // IconAnchorUnits.FRACTION,
                    img: anim.latestContext().canvas,
                    imgSize: [anim.width, anim.height],
                  })
                );
              }
            }
          });
          source.addFeatures(features);
          this.$emit("change", features);
        }
        if (this.modify) {
          this.setModify();
        }
        // 闪光点
        this.setFlashAnimate();
        if (this.flashTime) {
          this.flashInterval = setInterval(() => {
            this.setFlashAnimate();
          }, this.flashTime);
        }
      },
      immediate: false,
      deep: true,
    },
    modify: {
      handler(value) {
        if (value) {
          this.setModify();
        } else {
          if (this.selectObj) {
            this.map.removeInteraction(this.selectObj);
            this.selectObj = null;
          }
          if (this.modifyObj) {
            this.map.removeInteraction(this.modifyObj);
            this.modifyObj = null;
          }
        }
      },
      immediate: false,
    },
  },
  methods: {
    init(change) {
      const source = addVectorSource(this.source, this.map);
      if (this.features.length > 0) {
        source.clear();
        const features = setFeatures(this.features, this.map, this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0);
        source.addFeatures(features);
      }
      if (this.cluster) {
        let defaultOptions = {};
        if (typeof this.cluster === "boolean" && this.cluster) {
          defaultOptions = { ...defaultOptions, ...this.clusterDefault };
        } else {
          defaultOptions = this.cluster;
        }
        const clusterOption = { ...defaultOptions, ...{ source } };
        this.clusterObj = new Cluster(clusterOption);
        this.layerOpt = { ...this.$props, ...{ source: this.clusterObj, style: clusterOption.style } };
        this.layer = addClusterLayer(this.layerOpt, this.map);
        this.layer.set("cluster", true);
        this.layer.set("overlay", this.overlay);
      } else {
        if (this.layerStyle && Object.keys(this.layerStyle).length > 0) {
          this.layerOpt = {
            ...this.$props,
            ...{ source },
            style: (feature) => {
              return setFeatureStyle(feature, this.layerStyle, this.map);
            },
          };
          this.layer = new VectorLayer(this.layerOpt);
        } else {
          this.layerOpt = { ...this.$props, ...{ source } };
          this.layer = new VectorLayer(this.layerOpt);
          this.layer.setStyle((feature) => {
            if (feature.get("style")) {
              return setFeatureStyle(feature, feature.get("style"), this.map);
            } else {
              if (this.FeatureStyle && Object.keys(this.FeatureStyle).length > 0) {
                return setStyle(this.FeatureStyle);
              } else {
                return setStyle({
                  fill: {
                    color: "rgba(67,126,255,0.15)",
                  },
                  stroke: {
                    color: "rgba(67,126,255,1)",
                    width: 1,
                    // lineDash: [20, 10, 20, 10]
                  },
                });
              }
            }
          });
        }
      }
      const layerId = this.layerId || `vector-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layer.set("type", "vector");
      this.layer.set("users", true);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      console.log(this.$parent.$options.name);
      // this.map.addLayer(this.layer);
      addLayerToParentComp({
        type: this.$parent.$options.name,
        map: this.map,
        layer: this.layer,
        groupLayer: this.groupLayer,
      });
      this.features.forEach((feature) => {
        if (
          (feature.type === "polyline" || feature.type === "Polyline" || feature.type === "LineString") &&
          validObjKey(feature, "arrow")
        ) {
          arrowLine({
            coordinates: feature.coordinates,
            map: this.map,
            source,
            ...feature.arrow,
          });
        }
      });
      // 线加箭头
      this.map.getView().on("change:resolution", () => {
        const zoom = this.map.getView().getZoom();
        source.getFeatures().forEach((feature) => {
          if (feature.get("isArrow")) {
            this.layer.getSource().removeFeature(feature);
          }
        });
        if (Math.round(zoom) === zoom) {
          this.features.forEach((feature) => {
            if (feature.type === "polyline" && validObjKey(feature, "arrow")) {
              arrowLine({
                coordinates: feature.coordinates,
                map: this.map,
                source,
                ...feature.arrow,
              });
            }
          });
        }
      });
      // 闪光点
      this.setFlashAnimate();
      if (this.flashTime) {
        this.flashInterval = setInterval(() => {
          this.setFlashAnimate();
        }, this.flashTime);
      }
      this.$emit("load", this.layer, this.map);
      if (this.modify) {
        this.setModify();
      }
      if (change) {
        this.$emit("change", source.getFeatures());
      }
      // 绑定事件
      this.eventList.forEach((listenerKey) => {
        this.eventRender.push(this.map.on(listenerKey, (evt) => this.eventHandler(listenerKey, evt)));
      });
    },
    getFeatureAtPixel(pixel) {
      return this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer?.get("id") === this.layer?.get("id")) return feature;
        },
        {}
      );
    },
    eventHandler(listenerKey, evt) {
      const { pixel } = evt;
      const feature = this.getFeatureAtPixel(pixel);
      this.$emit(listenerKey, evt, feature);
    },
    setFlashAnimate() {
      if (this.cluster) {
        const features = this.clusterObj?.getFeatures() || [];
        if (features.length > 0) {
          features.forEach((cluster) => {
            const clusters = cluster.get("features");
            if (clusters.length === 1) {
              clusters.forEach((feature) => {
                if (feature.get("flash")) {
                  this.pulseFeature(feature);
                }
              });
            }
          });
        }
      } else {
        // console.log(this.layer.getSource().getFeatures())
        const source = this.layer.getSource();
        if (source) {
          source.getFeatures().forEach((feature) => {
            if (feature.get("flash")) {
              this.pulseFeature(feature);
            }
          });
        }
      }
    },
    dispose() {
      // 移除事件
      this.eventRender.forEach((listenerKey) => {
        unByKey(listenerKey);
      });
      if (this.clusterObj) {
        this.clusterObj.getSource().clear();
        this.clusterObj = null;
      }
      this.map.removeLayer(this.layer);
      // this.layer = null
      this.map.removeInteraction(this.selectObj);
      this.map.removeInteraction(this.modifyObj);
    },
    getFeatureById(id) {
      const features = this.layer.getSource().getFeatures();
      let target;
      features.forEach((feature) => {
        if (feature.get("id") === id || feature.getId() === id) {
          target = feature;
        }
      });
      return target;
    },
    updateFeatureById(featureId, update) {
      const features = this.layer.getSource().getFeatures();
      console.log(features);
      features.forEach((feature) => {
        if (feature.get("id") === featureId) {
          if (typeof update === "object") {
            for (const i in update) {
              if (Object.prototype.hasOwnProperty.call(update, i)) {
                feature.update(i, update[i]);
              }
            }
          }
        }
      });
    },
    getFeatures() {
      return this.layer.getSource().getFeatures();
    },
    setModify() {
      let features = [];
      if (this.select) {
        let selectStyle;
        if (validObjKey(this.select, "style")) {
          selectStyle = setStyle(this.select.style);
        }
        this.selectObj = new Select({
          style: selectStyle,
          layers: [this.layer],
        });
        this.map.addInteraction(this.selectObj);
        this.selectObj.on("select", (evt) => {
          // const params = { ...evt, ...{ select: this.select } }
          this.$emit("select", evt, this.map);
        });
        features = this.selectObj.getFeatures();
      } else {
        features = new Collection(this.layer.getSource().getFeatures());
      }
      let modifyStyle;
      if (validObjKey(this.modify, "style")) {
        modifyStyle = setStyle(this.modify.style);
      }
      this.modifyObj = new Modify({
        features,
        style: modifyStyle,
      });
      this.map.addInteraction(this.modifyObj);
      this.modifyObj.on("modifystart", (evt) => {
        this.$emit("modifystart", evt, this.map);
        features.getArray().forEach((feature) => {
          feature.getGeometry().on("change", (evt) => {
            this.$emit("modifychange", evt, this.map, feature);
          });
        });
      });
      this.modifyObj.on("modifyend", (evt) => {
        const feature = evt.features.getArray()[0];
        const geometry = feature.getGeometry();
        // console.log(geometry.getCoordinates())
        const type = feature.get("type")?.toLowerCase();
        if (type === "linestring" || type === "polyline") {
          evt.measure = formatLength(geometry);
        } else if (type === "polygon") {
          evt.measure = formatArea(geometry);
        }
        const params = { ...evt, ...{ select: this.selectObj } };
        this.$emit("modifyend", params, this.map);
      });
    },
    pulseFeature(feature) {
      const coordinates = feature.get("coordinates");
      const f = new FeatureExt(new Point(coordinates));
      const flash = feature.get("flash");
      const { radius, color, duration, width } = flash;
      f.setStyle(
        new Style({
          image: new CircleStyle({
            radius: radius || 30,
            // points: 4,
            stroke: new Stroke({ color, width }),
          }),
        })
      );
      this.layer.animateFeature(
        f,
        new Zoom({
          fade: easeOut,
          duration,
          easing: easeOut,
        })
      );
    },
    flash(feature) {
      const flash = feature.get("flash");
      const { radius, timeout } = flash;
      const duration = Number(flash.rate) * 1000 || 3000;
      const start = Date.now();
      const flashGeom = feature.getGeometry().clone();
      const listenerKey = this.layer.on("postrender", animate);
      const map = this.map;
      let timer = feature.get("timer");
      if (timer) {
        unByKey(listenerKey);
        clearTimeout(timer);
        feature.set("timer", null);
      }
      if (timeout && timeout > 0) {
        timer = setTimeout(() => {
          this.flash(feature);
        }, timeout);
      }
      function animate(event) {
        const frameState = event.frameState;
        const elapsed = frameState.time - start;
        if (elapsed >= duration) {
          unByKey(listenerKey);
          return;
        }
        const vectorContext = getVectorContext(event);
        const elapsedRatio = elapsed / duration;
        // radius will be 5 at start and {{flash.radius}} || 30 at end.
        const circleRadius = easeOut(elapsedRatio) * ((radius > 10 ? radius : 25) || 25);
        const color = asArray(flash.color || "rgba(255, 0, 0, 1)");
        color.slice();
        const opacity = easeOut(1 - elapsedRatio);

        const style = new Style({
          zIndex: 0,
          image: new CircleStyle({
            radius: circleRadius,
            stroke: new Stroke({
              // color: 'rgba(255, 0, 0, ' + opacity + ')',
              color: `rgba(${color[0]},${color[1]},${color[2]},${opacity})`,
              width: opacity,
            }),
          }),
        });

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);
        // tell OpenLayers to continue postrender animation
        map.render();
      }
    },
    overlayClose() {
      this.overlay.close();
    },
    getClosestFeatureToCoordinate(coordinates, filter) {
      return this.layer.getSource().getClosestFeatureToCoordinate(coordinates, filter);
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
    this.gh !== null && (this.gh = null);
  },
};
</script>

<style scoped></style>
