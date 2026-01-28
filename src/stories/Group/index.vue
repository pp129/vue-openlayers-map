<template>
  <div class="container">
    <v-map :view="view">
      <!-- 底图 -->
      <v-tile tile-type="GD"></v-tile>
      <!-- 图层组1 -->
      <v-group-layer :visible="groupOptions.visible" :opacity="groupOptions.opacity">
        <v-vector
          v-for="layer in vectorLayers"
          :key="layer.id"
          :layer-id="layer.id"
          :features="layer.features"
          :visible="layer.visible"
          :opacity="layer.opacity"
        ></v-vector>
      </v-group-layer>
      <!-- 图层组2 -->
      <v-group-layer :visible="group2Options.visible" :opacity="group2Options.opacity">
        <v-vector
          :features="group2Options.layers.vector.features"
          :visible="group2Options.layers.vector.visible"
          :opacity="group2Options.layers.vector.opacity"
        ></v-vector>
        <v-image
          source-type="geoImage"
          :source="group2Options.layers.image.imageSource"
          :opacity="group2Options.layers.image.opacity"
          :visible="group2Options.layers.image.visible"
        />
      </v-group-layer>
    </v-map>
    <div id="layertree">
      <ul>
        <li class="layertreenode">
          <span>图层组</span>
          <fieldset>
            <label class="checkbox" for="visible1">
              visible <input id="visible1" v-model="groupOptions.visible" class="visible" type="checkbox" />
            </label>
            <label>
              opacity
              <input
                class="opacity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                @input="(evt) => handleOpacity(evt, groupOptions)"
              />
            </label>
          </fieldset>
          <ul>
            <li v-for="layer in vectorLayers" :key="layer.id">
              <span>layer {{ layer.name }}</span>
              <fieldset>
                <label class="checkbox" for="visible10">
                  visible <input v-model="layer.visible" class="visible" type="checkbox" />
                </label>
                <label>
                  opacity
                  <input class="opacity" type="range" min="0" max="1" step="0.01" @input="(evt) => handleOpacity(evt, layer)" />
                </label>
              </fieldset>
            </li>
          </ul>
        </li>
        <li class="layertreenode">
          <span>图层组2</span>
          <fieldset>
            <label class="checkbox" for="visible0">
              visible <input v-model="group2Options.visible" class="visible" type="checkbox" />
            </label>
            <label>
              opacity
              <input
                class="opacity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                @input="(evt) => handleOpacity(evt, group2Options)"
              />
            </label>
          </fieldset>
        </li>
        <ul>
          <li v-for="(layer, index) in group2Options.layers" :key="index">
            <span>layer {{ layer.name }}</span>
            <fieldset>
              <label class="checkbox" for="visible10">
                visible <input v-model="layer.visible" class="visible" type="checkbox" />
              </label>
              <label>
                opacity
                <input class="opacity" type="range" min="0" max="1" step="0.01" @input="(evt) => handleOpacity(evt, layer)" />
              </label>
            </fieldset>
          </li>
        </ul>
      </ul>
    </div>
  </div>
</template>

<script>
import { VMap, VVector, VTile, VGroupLayer, VImage } from "v-ol-map";
export default {
  name: "GroupLayer",
  components: {
    VMap,
    VTile,
    VVector,
    VGroupLayer,
    VImage,
  },
  data() {
    return {
      view: {
        city: "厦门",
        zoom: 12,
      },
      groupOptions: {
        id: "v_g",
        visible: true,
        opacity: 1,
      },

      vectorLayers: [
        {
          id: "v_1",
          name: "蓝色要素图层",
          features: [
            {
              id: "point1",
              coordinates: [118.124742, 24.487405],
              style: {
                zIndex: 1,
                icon: {
                  scale: 0.6,
                  src: new URL("../../assets/img/point_1.png", import.meta.url).href,
                },
              },
              properties: {
                name: "feature1",
                level: 2,
              },
            },
          ],
          visible: true,
          opacity: 1,
        },
        {
          id: "v_2",
          name: "红色要素图层",
          features: [
            {
              id: "point2",
              coordinates: [118.124342, 24.417105],
              style: {
                zIndex: 1,
                icon: {
                  scale: 0.6,
                  src: new URL("../../assets/img/point_2.png", import.meta.url).href,
                },
              },
              properties: {
                name: "feature2",
                level: 2,
              },
            },
          ],
          visible: true,
          opacity: 1,
        },
      ],
      group2Options: {
        id: "v_g2",
        visible: true,
        opacity: 1,
        layers: {
          vector: {
            name: "黄色要素图层",
            id: "v_4",
            visible: true,
            opacity: 1,
            features: [
              {
                id: "point2",
                coordinates: [118.168742, 24.487505],
                style: {
                  zIndex: 1,
                  icon: {
                    scale: 0.6,
                    src: new URL("../../assets/img/point_4.png", import.meta.url).href,
                  },
                },
                properties: {
                  name: "feature2",
                  level: 2,
                },
              },
            ],
          },
          image: {
            name: "图片图层",
            imageSource: {
              url: new URL(`../../assets/img/xiangan.jpg`, import.meta.url).href,
              imageCenter: [118.213269, 24.569244],
              imageScale: [0.00004, 0.00004],
            },
            visible: true,
            opacity: 0.7,
          },
        },
      },
    };
  },
  methods: {
    handleOpacity(evt, layer) {
      const target = evt.target;
      const value = target.valueAsNumber;
      if (layer) layer.opacity = value;
    },
  },
};
</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  position: relative;
}
#layertree {
  z-index: 999;
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
}
#layertree li > span {
  cursor: pointer;
}
#layertree label {
  display: block;
}
.layertreenode {
  padding-bottom: 24px;
  border-bottom: 1px solid #666;
}
</style>
