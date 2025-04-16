import Collection from "ol/Collection";

/**
 * 向父组件添加图层
 * @param {object} data
 * @param {string} data.type - 父组件名称
 * @param {import("ol/Map").default} data.map - 地图类
 * @param {import("ol/layer/Group").default} data.groupLayer - 图层组
 * @param {import("ol/layer/Base").default} data.layer - 要添加的图层
 */
export const addLayerToParentComp = (data) => {
  const { type, layer, map, groupLayer } = data;
  if (!layer || !type) return;
  if (type === "v-map" && map) {
    try {
      map.addLayer(layer);
    } catch (e) {
      throw new Error(e?.toString());
    }
  } else if (type === "v-group-layer" && groupLayer) {
    console.log(groupLayer);

    try {
      // 先检查是否已经存在该图层
      const layersInGroup = groupLayer.getLayersArray().map((l) => l.get("id"));
      if (layersInGroup.includes(layer.get("id"))) {
        return;
      } else {
        const layers = groupLayer.getLayersArray() || [];
        console.log(layer);
        groupLayer.setLayers(new Collection([...layers, layer], { unique: true }));
      }
    } catch (e) {
      throw new Error(e?.toString());
    }
  }
};
