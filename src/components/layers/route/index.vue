<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import axios from "axios";
import qs from "qs";
import { addVectorSource, setFeatures, setStyle } from "@/utils";
import VectorLayer from "ol/layer/Vector";
import { arrowLine } from "@/utils/arrowLine";

export default {
  name: "v-route",
  render(createElement, context) {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    layerId: {
      type: String,
      default: "",
    },
    serviceUrl: {
      type: String,
      default() {
        return "";
      },
    },
    method: {
      type: String,
      default: "GET",
      validator(value) {
        return ["GET", "POST", "get", "post"].includes(value);
      },
    },
    stops: {
      type: Array,
      default() {
        return [];
      },
    },
    routeType: {
      type: String,
      require: true,
      validator(value) {
        return ["arcgis", "graphhopper"].includes(value);
      },
    },
    showStart: {
      type: Boolean,
      default: true,
    },
    showPass: {
      type: Boolean,
      default: true,
    },
    showEnd: {
      type: Boolean,
      default: true,
    },
    routeStyle: {
      type: Object,
      default: undefined,
    },
    arrow: {
      type: [Object, Boolean],
      default() {
        return false;
      },
    },
    // arcgis
    barriers: {
      type: String,
      default: "",
    },
    polylineBarriers: {
      type: String,
      default: "",
    },
    polygonBarriers: {
      type: String,
      default: "",
    },
    outSR: {
      type: String,
      default: "",
    },
    ignoreInvalidLocations: {
      type: Boolean,
      default: true,
    },
    accumulateAttributeNames: {
      type: String,
      default: "",
    },
    impedanceAttributeName: {
      type: String,
    },
    restrictionAttributeNames: {
      type: String,
      default: "",
    },
    attributeParameterValues: {
      type: String,
      default: "",
    },
    restrictUTurns: {
      type: String,
      default: "esriNFSBAllowBacktrack",
    },
    useHierarchy: {
      type: Boolean,
      default: false,
    },
    returnDirections: {
      type: Boolean,
      default: false,
    },
    returnRoutes: {
      type: Boolean,
      default: true,
    },
    returnStops: {
      type: Boolean,
      default: true,
    },
    returnBarriers: {
      type: Boolean,
      default: false,
    },
    returnPolygonBarriers: {
      type: Boolean,
      default: false,
    },
    directionsLanguage: {
      type: String,
      default: "en",
    },
    directionsStyleName: {
      type: String,
      default: "",
    },
    outputLines: {
      type: String,
      default: "esriNAOutputLineTrueShape",
    },
    findBestSequence: {
      type: Boolean,
      default: false,
    },
    preserveFirstStop: {
      type: Boolean,
      default: true,
    },
    preserveLastStop: {
      type: Boolean,
      default: true,
    },
    useTimeWindows: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    startTimeIsUTC: {
      type: Boolean,
      default: false,
    },
    outputGeometryPrecision: {
      type: String,
      default: "",
    },
    outputGeometryPrecisionUnits: {
      type: String,
      default: "esriDecimalDegrees",
    },
    directionsOutputType: {
      type: String,
      default: "esriDOTComplete",
    },
    directionsTimeAttributeName: {
      type: String,
      default: "",
    },
    directionsLengthUnits: {
      type: String,
      default: "esriNAUMiles",
    },
    returnZ: {
      type: Boolean,
      default: false,
    },
    travelMode: {
      type: String,
      default: "",
    },
    f: {
      type: String,
      default: "pjson",
    },
    // graphhopper
    type: {
      type: String,
      default: "json",
    },
    points_encoded: {
      type: Boolean,
      default: false,
    },
    point_hint: {
      type: Array,
      default() {
        return [];
      },
    },
    locale: {
      type: String,
      default: "en",
    },
    vehicle: {
      type: String,
      default: "car",
    },
    weighting: {
      type: String,
      default: "fastest",
    },
    elevation: {
      type: Boolean,
      default: false,
    },
    convert: {
      type: String,
    },
  },
  data() {
    return {
      layer: null,
      source: null,
      features: [],
      defaultStyle: {
        line: {
          stroke: {
            color: "rgba(67,126,255,1)",
            width: 4,
          },
        },
        start: {
          circle: {
            radius: 15,
            fill: {
              color: "rgba(255,255,255,1)",
            },
            stroke: {
              color: "rgba(67,126,255,1)",
              width: 2,
            },
          },
          text: {
            text: "起",
            fill: {
              color: "#3d73e8",
            },
          },
        },
        end: {
          circle: {
            radius: 15,
            fill: {
              color: "rgba(255,255,255,1)",
            },
            stroke: {
              color: "rgba(67,126,255,1)",
              width: 2,
            },
          },
          text: {
            text: "终",
            fill: {
              color: "#3d73e8",
            },
          },
        },
        pass: {
          circle: {
            radius: 8,
            fill: {
              color: "rgba(255,255,255,1)",
            },
            stroke: {
              color: "tomato",
              width: 4,
            },
          },
        },
      },
      routeData: null, // Arcgis 或 Graphhopper接口的返回值
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    stops: {
      handler() {
        this.init();
      },
      immediate: false,
      deep: true,
    },
    visible: {
      handler(value) {
        if (this.layer) this.layer.setVisible(value);
      },
      immediate: false,
    },
    zIndex: {
      handler(value) {
        if (this.layer) this.layer.setZIndex(value);
      },
      immediate: false,
    },
    maxZoom: {
      handler(value) {
        if (this.layer) this.layer.setMaxZoom(value);
      },
      immediate: false,
    },
    minZoom: {
      handler(value) {
        if (this.layer) this.layer.setMinZoom(value);
      },
      immediate: false,
    },
    extent: {
      handler(value) {
        if (this.layer) this.layer.setExtent(value);
      },
      immediate: false,
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    // this.layer.getSource().clear()
    this.dispose();
  },
  methods: {
    /**
     * 获取Arcgis路径规划接口数据
     * @returns {Promise<*[]|[]>}
     */
    async getArcgisRouteData() {
      let params = {};
      const {
        barriers,
        polylineBarriers,
        polygonBarriers,
        outSR,
        ignoreInvalidLocations,
        accumulateAttributeNames,
        impedanceAttributeName,
        restrictionAttributeNames,
        attributeParameterValues,
        restrictUTurns,
        useHierarchy,
        returnDirections,
        returnRoutes,
        returnStops,
        returnBarriers,
        returnPolygonBarriers,
        directionsLanguage,
        directionsStyleName,
        outputLines,
        findBestSequence,
        preserveFirstStop,
        preserveLastStop,
        useTimeWindows,
        startTime,
        startTimeIsUTC,
        outputGeometryPrecision,
        outputGeometryPrecisionUnits,
        directionsOutputType,
        directionsTimeAttributeName,
        directionsLengthUnits,
        returnZ,
        travelMode,
        f,
      } = this.$props;
      if (this.stops.length > 0) {
        params = {
          barriers,
          polylineBarriers,
          polygonBarriers,
          outSR,
          ignoreInvalidLocations,
          accumulateAttributeNames,
          impedanceAttributeName,
          restrictionAttributeNames,
          attributeParameterValues,
          restrictUTurns,
          useHierarchy,
          returnDirections,
          returnRoutes,
          returnStops,
          returnBarriers,
          returnPolygonBarriers,
          directionsLanguage,
          directionsStyleName,
          outputLines,
          findBestSequence,
          preserveFirstStop,
          preserveLastStop,
          useTimeWindows,
          startTime,
          startTimeIsUTC,
          outputGeometryPrecision,
          outputGeometryPrecisionUnits,
          directionsOutputType,
          directionsTimeAttributeName,
          directionsLengthUnits,
          returnZ,
          travelMode,
          f,
          stops: this.stops.join(";"),
        };
        if (this.method.toUpperCase() === "POST") {
          return axios.post(this.serviceUrl, qs.stringify(params)).then((res) => {
            if (res.status === 200 && res.data) {
              this.routeData = res.data;
            }
            return this.getArcgisData(res);
          });
        } else {
          return axios.get(this.serviceUrl, { params }).then((res) => {
            if (res.status === 200 && res.data) {
              this.routeData = res.data;
            }
            return this.getArcgisData(res);
          });
        }
      } else {
        return [];
      }
    },
    /**
     * 根据Arcgis返回的数据生成要素集合
     * @param res
     * @returns {*[]}
     */
    getArcgisData(res) {
      if (res.status === 200 && res.data && res.data.routes.features.length > 0) {
        const routes = res.data.routes;
        // const stops = res.data.stops
        if (routes.features[0].geometry.paths.length > 0) {
          const routesFeatures = [];
          if (this.showStart) {
            routesFeatures.push({
              type: "point",
              style: this.routeStyle ? this.routeStyle.start : this.defaultStyle.start,
              coordinates: routes.features[0].geometry.paths[0][0],
              featureType: "start",
              convert: this.convert,
            });
          }
          routesFeatures.push({
            type: "polyline",
            style: this.routeStyle ? this.routeStyle.line : this.defaultStyle.line,
            coordinates: routes.features[0].geometry.paths[0],
            featureType: "line",
            convert: this.convert,
          });
          if (this.showPass && this.stops.length > 1) {
            this.stops.slice(1, this.stops.length - 1).forEach((point, index) => {
              routesFeatures.push({
                type: "point",
                style: this.routeStyle ? this.routeStyle.pass : this.defaultStyle.pass,
                coordinates: point,
                stopIndex: index,
                featureType: "stops",
              });
            });
            // this.stops.slice(1, this.stops.length - 1).forEach((point, index) => {
            //   routesFeatures.push({
            //     type: 'point',
            //     style: this.routeStyle ? this.routeStyle.pass : this.defaultStyle.pass,
            //     coordinates: point,
            //     stopIndex: index,
            //     featureType: 'stops',
            //     convert: this.convert
            //   })
            // })
          }
          if (this.showEnd) {
            routesFeatures.push({
              type: "point",
              style: this.routeStyle ? this.routeStyle.end : this.defaultStyle.end,
              coordinates: routes.features[0].geometry.paths[0][routes.features[0].geometry.paths[0].length - 1],
              featureType: "end",
              convert: this.convert,
            });
          }
          return setFeatures(routesFeatures, this.map);
        }
      } else {
        return [];
      }
    },
    /**
     *  获取Graphhopper路径规划接口数据
     * @returns {Promise<*[]|[]>}
     */
    async getGraphhopperRouteData() {
      // const props = { ...this.$props, ...{ routeStyle: '' } }
      /* eslint-disable */
      const { type, points_encoded, point_hint, locale, vehicle, weighting, elevation, convert } = this.$props;
      let params = qs.stringify({
        type,
        points_encoded,
        point_hint,
        locale,
        vehicle,
        weighting,
        elevation,
        convert,
      });
      if (this.stops.length > 0) {
        let points = "&point=";
        this.stops.forEach((point, index) => {
          points = points + point[1] + "," + point[0] + (index < this.stops.length - 1 ? "&point=" : "");
        });
        params = params + points;
        if (this.method.toUpperCase() === "POST") {
          return axios.post(this.serviceUrl, params).then((res) => {
            if (res.status === 200 && res.data) {
              this.routeData = res.data;
            }
            return this.getGraphhopperData(res);
          });
        } else {
          return axios.get(this.serviceUrl + "?" + params).then((res) => {
            if (res.status === 200 && res.data) {
              this.routeData = res.data;
            }
            return this.getGraphhopperData(res);
          });
        }
      } else {
        return [];
      }
    },
    /**
     * 根据Graphhopper返回的数据生成要素集合
     * @param res
     * @returns {*[]}
     */
    getGraphhopperData(res) {
      if (res.status === 200 && res.data && res.data.paths[0].points.coordinates.length > 0) {
        const routes = res.data.paths[0];
        if (routes.points.coordinates.length > 0) {
          const routesFeatures = [];
          if (this.showStart) {
            routesFeatures.push({
              type: "point",
              style: this.routeStyle ? this.routeStyle.start : this.defaultStyle.start,
              coordinates: routes.points.coordinates[0],
              featureType: "start",
            });
          }
          routesFeatures.push({
            type: "polyline",
            style: this.routeStyle ? this.routeStyle.line : this.defaultStyle.line,
            coordinates: routes.points.coordinates,
            featureType: "line",
          });
          if (this.showPass) {
            this.stops.slice(1, this.stops.length - 1).forEach((point, index) => {
              routesFeatures.push({
                type: "point",
                style: this.routeStyle ? this.routeStyle.pass : this.defaultStyle.pass,
                coordinates: point,
                featureType: "stops",
                stopIndex: index,
              });
            });
          }
          if (this.showEnd) {
            routesFeatures.push({
              type: "point",
              style: this.routeStyle ? this.routeStyle.end : this.defaultStyle.end,
              coordinates: routes.points.coordinates[routes.points.coordinates.length - 1],
              featureType: "end",
            });
          }
          return setFeatures(routesFeatures, this.map);
        }
      } else {
        return [];
      }
    },
    async init() {
      this.features = [];
      if (this.source) {
        this.source.clear();
      } else {
        this.source = addVectorSource({}, this.map);
      }
      if (this.stops.length <= 0) return false;
      if (this.stops.length === 1) {
        const routesFeatures = [
          {
            type: "point",
            style: this.routeStyle ? this.routeStyle.start : this.defaultStyle.start,
            coordinates: this.stops[0],
            featureType: "start",
          },
        ];
        this.features = setFeatures(routesFeatures, this.map);
      } else if (this.stops.length >= 2) {
        this.features = this.routeType === "arcgis" ? await this.getArcgisRouteData() : await this.getGraphhopperRouteData();
      }
      this.source.addFeatures(this.features);
      const layerOpt = { ...this.$props, ...{ source: this.source } };
      if (!this.layer) {
        this.layer = new VectorLayer(layerOpt);
        this.layer.setStyle((feature) => {
          if (feature.get("style")) {
            return setStyle(feature.get("style"));
          } else {
            if (this.FeatureStyle) {
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
        const layerId = this.layerId || `route-layer-${nanoid()}`;
        this.layer.set("id", layerId);
        this.layer.set("type", "vector");
        this.layer.set("users", true);
        if (this.zIndex) {
          this.layer.setZIndex(this.zIndex);
        }
        this.map.addLayer(this.layer);
      }
      if (this.stops.length >= 2) {
        if (this.arrow) {
          // 线加箭头
          this.layer.on("postrender", () => {
            // 应对编辑后的箭头重制所以用postrender
            const zoom = this.map.getView().getZoom();
            this.layer
              .getSource()
              .getFeatures()
              .forEach((feature) => {
                if (feature.get("isArrow")) {
                  this.layer.getSource().removeFeature(feature);
                }
              });
            if (Math.round(zoom) === zoom) {
              arrowLine({
                coordinates:
                  this.routeType === "arcgis"
                    ? this.routeData.routes.features[0].geometry.paths[0]
                    : this.routeData.paths[0].points.coordinates,
                map: this.map,
                source: this.layer.getSource(),
                ...this.arrow,
              });
            }
          });
        }
        this.$emit("render", this.routeData, this.map, this.features);
      }
    },
    dispose() {
      this.map.removeLayer(this.layer);
    },
  },
};
</script>

<style scoped></style>
