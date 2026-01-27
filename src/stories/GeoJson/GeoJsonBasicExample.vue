<template>
  <v-map :view="view" style="width: 100%; height: 600px">
    <v-tile tile-type="TD" />
    <v-vector :geoJson="geoJsonData" :layerStyle="layerStyle" />
  </v-map>
</template>

<script>
import { VMap, VTile, VVector } from "v-ol-map";

export default {
  name: "GeoJsonBasicExample",
  components: { VMap, VTile, VVector },
  data() {
    return {
      view: { center: [118.0894, 24.4798], zoom: 9, projection: "EPSG:4326" },
      geoJsonData: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: "point-1",
              name: "厦门市",
              style: {
                circle: {
                  radius: 10,
                  fill: { color: "rgba(255, 0, 0, 0.8)" },
                  stroke: { color: "#fff", width: 2 },
                },
                text: {
                  text: "厦门市",
                  fill: { color: "#333" },
                  offsetY: -20,
                },
                styleFunction: function (feature, resolution, map, style) {
                  const viewZoom = map.getView().getZoom();
                  const textStyle = style.getText();
                  const properties = feature.get("style");
                  let originText = "";
                  if (properties) {
                    originText = properties.text.text;
                  }
                  if (viewZoom && textStyle) {
                    if (viewZoom <= 12) {
                      textStyle.setText("");
                    }
                    if (viewZoom >= 13) {
                      textStyle.setText(originText);
                    }
                    if (viewZoom >= 14) {
                      textStyle.setText(`根据层级显示不同内容,当前层级：${viewZoom}级`);
                    }
                    style.setText(textStyle);
                  }
                  return style;
                },
              },
            },
            geometry: {
              type: "Point",
              coordinates: [118.0894, 24.4798],
            },
          },
          {
            type: "Feature",
            properties: { id: "point-2", name: "漳州市" },
            geometry: {
              type: "Point",
              coordinates: [117.6469, 24.5128],
            },
          },
          {
            type: "Feature",
            properties: {
              id: "point-3",
              name: "泉州市",
              style: {
                circle: {
                  radius: 8,
                  fill: { color: "rgba(0, 150, 0, 0.8)" },
                  stroke: { color: "#fff", width: 2 },
                },
              },
            },
            geometry: {
              type: "Point",
              coordinates: [118.5894, 24.9087],
            },
          },
        ],
      },
      layerStyle: {
        circle: {
          radius: 8,
          fill: { color: "rgba(33, 150, 243, 0.8)" },
          stroke: { color: "#fff", width: 2 },
        },
      },
    };
  },
};
</script>
