<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import { AMapMercatorProj, setFeature, validObjKey } from "@/utils/index.js";
import TileGrid from "ol/tilegrid/TileGrid";
import { OSM, TileArcGISRest, TileWMS, XYZ } from "ol/source";
import TileLayer from "ol/layer/Tile";
import Mask from "ol-ext/filter/Mask";
import { Fill } from "ol/style";
import GeoTIFF from "ol/source/GeoTIFF";
import GeoTIFFLayer from "ol/layer/WebGLTile";
import { OverviewMap } from "ol/control";
import { View } from "ol";

export default {
  name: "v-tile",
  render() {
    return null;
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    layerId: {
      type: String,
      default: "",
    },
    preload: {
      type: Number,
      default: 0,
    },
    tileType: {
      type: String,
      default: "TD",
      validator: (value) =>
        [
          "TD",
          "TD_IMG",
          "XYZ",
          "BD",
          "BD_DARK",
          "BD_BLUE",
          "GD",
          "GD_IMG",
          "OSM",
          "WMS",
          "ARCGIS_BLUE",
          "ARCGIS_WARM",
          "ARCGIS_NORMAL",
          "ARCGIS_GRAY",
          "PGIS_XM_GA",
          "PGIS_XM_GA_IMG",
          "FJ_BLUE",
          "FJ_BLUE_GA",
          "GEOTIFF",
        ].includes(value.toUpperCase()),
    },
    tdVec: String,
    tdCva: String,
    tdImg: String,
    tdCia: String,
    gdUrl: String,
    base: {
      type: Boolean,
      default: true,
    },
    xyz: {
      type: Object,
      default: () => ({}),
    },
    tileArcGISRest: {
      type: Object,
      default: () => ({}),
    },
    wms: {
      type: Object,
      default: () => ({}),
    },
    mask: Object,
    GeoTiff: Object,
    overviewMap: Object,
  },
  data() {
    return {
      layers: [],
      addForOverview: false,
      filterMask: null,
      overview: null,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  watch: {
    tileType: {
      handler(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.clear(oldValue);
          this.init();
          if (this.overview) {
            this.rebuildOverview();
          }
        }
      },
      immediate: false,
      deep: true,
    },
    overviewMap: {
      handler(newValue) {
        if (newValue) {
          this.rebuildOverview();
        } else {
          this.removeOverview();
        }
      },
      immediate: false,
      deep: true,
    },
    xyz: {
      handler() {
        this.clear();
        this.init();
        if (this.overview) {
          this.rebuildOverview();
        }
      },
      immediate: false,
      deep: true,
    },
    mask: {
      handler(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          this.layers.forEach((layer) => {
            if (this.filterMask) {
              layer.removeFilter(this.filterMask);
            }
            this.addMask(layer, this.mask);
          });
        } else if (!newValue) {
          this.layers.forEach((layer) => {
            if (this.filterMask) {
              layer.removeFilter(this.filterMask);
            }
          });
        }
      },
      immediate: false,
      deep: true,
    },
  },
  methods: {
    /**
     * 重建鹰眼图
     */
    rebuildOverview() {
      if (!this.overviewMap) return;

      this.removeOverview();

      const viewOptDefault = {
        constrainResolution: false,
        projection: "EPSG:4326",
        ...this.overviewMap.view,
      };
      const option = {
        ...this.overviewMap,
        view: new View(viewOptDefault),
        layers: this.init(true),
      };
      this.overview = new OverviewMap(option);
      this.map.addControl(this.overview);
    },

    /**
     * 移除鹰眼图
     */
    removeOverview() {
      if (this.overview) {
        this.map.removeControl(this.overview);
        this.overview = null;
      }
    },

    /**
     * 清理旧图层
     */
    clear(oldValue) {
      const layers = this.map
        .getLayers()
        .getArray()
        .filter((x) => x.get("base"));

      if (layers && layers.length > 0) {
        layers.forEach((layer) => {
          if (!oldValue || layer.get("tileType") === oldValue || layer.get("isDefault")) {
            // 清理图层资源
            const source = layer.getSource();
            if (source && typeof source.clear === "function") {
              source.clear();
            }
            this.map.removeLayer(layer);
          }
        });
      }
    },

    /**
     * 初始化图层
     */
    init(overview) {
      try {
        let type;
        if (overview) {
          type = this.overviewMap.tileType?.toUpperCase() || this.tileType.toUpperCase();
        } else {
          type = this.tileType.toUpperCase();
        }
        const initMethod = this.getInitMethod(type);

        if (initMethod) {
          return initMethod(overview);
        }

        // 默认使用天地图
        return this.initTD(overview);
      } catch (error) {
        console.error("[v-tile] Failed to initialize tile layer:", error);
        this.$emit("error", error);
      }
    },

    /**
     * 获取对应的初始化方法
     */
    getInitMethod(type) {
      const methodMap = {
        XYZ: this.initTileXYZ,
        PGIS_XM_GA: this.initTilePGISXMGA,
        FJ_BLUE: this.initTileFJBlue,
        FJ_BLUE_GA: this.initTileFJBlueGA,
        WMS: this.initTileWMS,
        TD: this.initTD,
        TD_IMG: this.initTDIMG,
        BD: (overview) => this.initBD("", overview),
        BD_BLUE: (overview) => this.initBD("midnight", overview),
        BD_DARK: (overview) => this.initBD("dark", overview),
        ARCGISREST: this.initTileArcGISRest,
        ARCGIS_BLUE: (overview) => this.initArcgisTile("blue", overview),
        ARCGIS_WARM: (overview) => this.initArcgisTile("warm", overview),
        ARCGIS_NORMAL: (overview) => this.initArcgisTile("normal", overview),
        ARCGIS_GRAY: (overview) => this.initArcgisTile("gray", overview),
        GD: this.initGD,
        GD_IMG: this.initAMapImage,
        OSM: this.initTileOSM,
        GEOTIFF: this.initGeoTIFFTile,
      };

      return methodMap[type];
    },

    initTileArcGISRest(overview) {
      let tileGrid;
      if (validObjKey(this.tileArcGISRest, "tileGrid")) {
        tileGrid = new TileGrid(this.tileArcGISRest.tileGrid);
      }
      const xyzOpt = { ...this.tileArcGISRest, tileGrid };
      const source = new TileArcGISRest(xyzOpt);
      const layerOpt = { ...this.$props, source };
      this.layer = new TileLayer(layerOpt);
      this.layer.set("base", this.base);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTileXYZ(overview) {
      let tileGrid;
      if (validObjKey(this.xyz, "tileGrid")) {
        tileGrid = new TileGrid(this.xyz.tileGrid);
      }
      const xyzOpt = { ...this.xyz, tileGrid };
      const source = new XYZ(xyzOpt);
      const layerOpt = { ...this.$props, source };
      this.layer = new TileLayer(layerOpt);
      this.layer.set("base", this.base);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTileFJBlue(overview) {
      const url = "http://172.16.34.120:6080/arcgis/rest/services/xiamen/MapServer/tile";
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}`, { projection: "EPSG:4490" });
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTileFJBlueGA(overview) {
      const url = "http://10.130.145.45:5001/xmblue";
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}.png`, { projection: "EPSG:4326" });
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTilePGISXMGA(overview) {
      const xyzOpt = {
        projection: "EPSG:4326",
        tileUrlFunction: function (tileCoord) {
          if (!tileCoord) return "";
          const z = tileCoord[0];
          const x = tileCoord[1];
          const y = tileCoord[2];
          return `http://44.64.18.11/Tile_sl2019/40219e3adef540b4b3d0b9b5e1d66c53/EzMap?Service=getImage&Type=RGB&ZoomOffset=0&Col=${x}&Row=${y}&Zoom=${z}&V=1.0.0`;
        },
        crossOrigin: "anonymous",
      };
      const source = new XYZ(xyzOpt);
      const layerOpt = { ...this.$props, source };
      this.layer = new TileLayer(layerOpt);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTileWMS(overview) {
      let tileGrid;
      if (validObjKey(this.wms, "tileGrid")) {
        tileGrid = new TileGrid(this.wms.tileGrid);
      }
      const wmsOpt = {
        ...this.wms,
        tileGrid,
        projection: "EPSG:4326",
      };
      const source = new TileWMS(wmsOpt);
      const layerOpt = { ...this.$props, source };
      this.layer = new TileLayer(layerOpt);
      this.layer.set("base", this.base);
      this.layer.set("type", "wms");
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initTD(overview) {
      const layerVec = this.initXYZbyURL(
        this.tdVec || "https://t4.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a"
      );
      const layerCva = this.initXYZbyURL(
        this.tdCva || "https://t3.tianditu.gov.cn/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a"
      );
      if (overview) return [layerVec, layerCva];
      this.layers = [layerVec, layerCva];
      this.addToMap();
    },

    initXYZbyURL(url, sourceOptions = {}) {
      const xyzOpt = {
        crossOrigin: "anonymous",
        ...this.$props.xyz,
        url,
      };
      const source = new XYZ({ ...xyzOpt, ...sourceOptions });
      const layerOpt = { ...this.$props, source };
      const layer = new TileLayer(layerOpt);
      layer.set("base", true);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      layer.set("id", layerId);
      if (this.zIndex) {
        layer.setZIndex(this.zIndex);
      }
      if (this.mask && Object.keys(this.mask).length > 0) {
        this.addMask(layer, this.mask);
      }
      return layer;
    },

    initTDIMG(overview) {
      const layerImg = this.initXYZbyURL(
        this.tdImg || "https://t4.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a"
      );
      const layerCia = this.initXYZbyURL(
        this.tdCia || "https://t3.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=88e2f1d5ab64a7477a7361edd6b5f68a"
      );
      this.layers = [layerImg, layerCia];
      if (overview) return this.layers;
      this.addToMap();
    },

    initArcgisTile(type, overview) {
      const urlMap = {
        blue: "//map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/",
        warm: "//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile",
        normal: "//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile",
        gray: "//cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile",
      };

      const protocol = import.meta.env.DEV ? "http:" : "https:";
      const url = protocol + (urlMap[type] || urlMap.normal);
      this.layer = this.initXYZbyURL(`${url}/{z}/{y}/{x}`, { projection: "GCJ02" });
      if (overview) return [this.layer];
      this.layers = [this.layer];
      this.addToMap();
    },

    initBD(customid, overview) {
      if (overview) return this.getBDMap(this.xyz, this.$props, customid);
      this.layers = this.getBDMap(this.xyz, this.$props, customid);
      this.addToMap();
    },

    getBDMap(xyz, tileLayer, customid = "") {
      const resolutions = [];
      for (let i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }
      const tilegrid = new TileGrid({
        origin: [0, 0],
        resolutions,
      });

      const xyzOpt = {
        ...xyz,
        projection: "baidu",
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord) {
          if (!tileCoord) return "";
          const z = tileCoord[0];
          const x = tileCoord[1];
          const y = -tileCoord[2] - 1;

          if (customid) {
            return `http://api0.map.bdimg.com/customimage/tile?&x=${x}&y=${y}&z=${z}udt=20220819&scale=1&ak=5ieMMexWmzB9jivTq6oCRX9j&customid=${customid}`;
          } else {
            return `https://maponline1.bdimg.com/tile/?qt=vtile&x=${x}&y=${y}&z=${z}&styles=pl&scaler=1&udt=20220113&from=jsapi2_0`;
          }
        },
        crossOrigin: "anonymous",
      };
      const tile = new XYZ(xyzOpt);
      const layerOpt = { ...tileLayer, source: tile };
      const layer = new TileLayer(layerOpt);
      layer.set("type", "bd");
      layer.set("name", "bd");
      layer.set("base", true);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      layer.set("id", layerId);
      if (this.zIndex) {
        layer.setZIndex(this.zIndex);
      }
      return [layer];
    },

    initGD(overview) {
      if (overview) return [this.getAMap(this.xyz, this.$props, this.gdUrl)];
      this.layers = [this.getAMap(this.xyz, this.$props, this.gdUrl)];
      this.addToMap();
    },

    initAMapImage(overview) {
      this.layers = [
        this.getAMap(
          this.xyz,
          this.$props,
          "https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6"
        ),
        this.getAMap(
          this.xyz,
          this.$props,
          "https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8"
        ),
      ];
      if (overview) return this.layers;
      this.layers.forEach((layer) => {
        if (this.mask && Object.keys(this.mask).length > 0) {
          this.addMask(layer, this.mask);
        }
        this.map.addLayer(layer);
      });
    },

    getAMap(xyz, tileLayer, url) {
      const xyzOpt = {
        ...xyz,
        url: url || "https://wprd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
        projection: AMapMercatorProj,
        crossOrigin: "anonymous",
      };
      const tile = new XYZ(xyzOpt);
      const layerOpt = { ...tileLayer, source: tile };
      const layer = new TileLayer(layerOpt);
      layer.set("type", "AMap");
      layer.set("name", "AMap");
      layer.set("base", true);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      layer.set("id", layerId);
      if (this.zIndex) {
        layer.setZIndex(this.zIndex);
      }
      return layer;
    },

    initTileOSM(overview) {
      const source = new OSM();
      const layerOpt = { ...this.$props, source };
      this.layer = new TileLayer(layerOpt);
      this.layer.set("base", this.base);
      const layerId = this.layerId || `tile-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      this.layers = [this.layer];
      if (overview) return this.layers;
      this.layers.forEach((layer) => {
        if (this.mask && Object.keys(this.mask).length > 0) {
          this.addMask(layer, this.mask);
        }
        if (this.zIndex) {
          layer.setZIndex(this.zIndex);
        }
        this.map.addLayer(layer);
      });
    },

    initGeoTIFFTile(overview) {
      const source = new GeoTIFF({
        ...this.GeoTiff,
      });
      const layerOpt = { ...this.$props, source };
      this.layer = new GeoTIFFLayer(layerOpt);
      this.layer.set("base", this.base);
      if (this.zIndex) {
        this.layer.setZIndex(this.zIndex);
      }
      this.layers = [this.layer];
      if (overview) return this.layers;
      this.addToMap();
    },

    addMask(layer, maskOption) {
      const option = {
        feature: maskOption.feature,
        wrapX: maskOption.wrapX !== undefined ? maskOption.wrapX : true,
        inner: maskOption.inner || false,
        shadowWidth: maskOption.shadowWidth || 0,
        fill: maskOption.fill || "rgba(255, 255, 255, 0.8)",
      };

      try {
        const filterFeature = setFeature(option.feature, this.map);
        this.filterMask = new Mask({
          feature: filterFeature,
          wrapX: option.wrapX,
          inner: option.inner,
          fill: new Fill({ color: option.fill }),
        });
        this.filterMask.set("shadowWidth", option.shadowWidth);
        layer.addFilter(this.filterMask);
      } catch (error) {
        console.error("[v-tile] Failed to add mask:", error);
      }
    },

    addToMap() {
      this.layers.forEach((layer) => {
        if (this.mask && Object.keys(this.mask).length > 0) {
          this.addMask(layer, this.mask);
        }
        if (this.zIndex) {
          layer.setZIndex(this.zIndex);
        }
        this.map.addLayer(layer);
      });
    },

    /**
     * 优化的 dispose 方法
     * 优化: 继承 BaseLayer 的清理机制
     */
    dispose() {
      // 清理所有图层
      this.layers.forEach((layer) => {
        const source = layer.getSource();
        if (source && typeof source.clear === "function") {
          source.clear();
        }
        this.map.removeLayer(layer);
      });
      this.layers = [];

      // 清理鹰眼图
      this.removeOverview();

      // 清理遮罩
      this.filterMask = null;

      // 调用基类清理
      this.baseDispose();
    },
  },
  mounted() {
    this.init();
    if (this.overviewMap) {
      this.rebuildOverview();
    }
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>

<style scoped></style>
