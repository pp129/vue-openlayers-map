<template>
  <div v-if="rendered"><slot></slot></div>
</template>

<script>
import BaseLayer from "../BaseLayer.vue";
import { nanoid } from "nanoid";
import Group from "ol/layer/group";
import { unByKey } from "ol/Observable";

export default {
  name: "v-group-layer",
  provide() {
    return {
      VGroupLayer: this,
    };
  },
  extends: BaseLayer,
  inject: ["VMap"],
  props: {
    layerId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      eventRender: [],
      eventList: [
        "change",
        "change:extent",
        "change:layers",
        "change:maxResolution",
        "change:maxZoom",
        "change:minResolution",
        "change:minZoom",
        "change:opacity",
        "change:visible",
        "change:zIndex",
      ],
      rendered: false,
    };
  },
  computed: {
    map() {
      return this.VMap.map;
    },
  },
  methods: {
    init() {
      this.layer = new Group(this.$props);
      console.log(this.layer);
      this.rendered = true;
      const layerId = this.layerId || `group-layer-${nanoid()}`;
      this.layer.set("id", layerId);
      // 绑定事件
      this.eventList.forEach((listenerKey) => {
        this.eventRender.push(
          this.map.on(listenerKey, (evt) => {
            this.$emit(listenerKey, evt);
          })
        );
      });
      this.map?.addLayer(this.layer);
    },
    dispose() {
      // 移除事件
      this.eventRender.forEach((listenerKey) => {
        unByKey(listenerKey);
      });
      this.map.removeLayer(this.layer);
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.dispose();
  },
};
</script>
