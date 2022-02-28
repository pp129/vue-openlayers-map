export default {
  view: {
    center: [118.045456, 24.567489],
    zoom: 10
  },
  layers: [
    {
      id: 'layer1',
      source: {
        features: [
          {
            id: 'point1',
            coordinates: [118.140448, 24.512917],
            style: {
              icon: {
                scale: 0.5,
                src: require('@/assets/img/point_red.png')
              }
            },
            // 需要附加在元素上的属性，一般用于点击获取点位信息，使用feature.get('properties')读取
            properties: {
              name: 'feature1'
            }
          }
        ]
      }
    }
  ]
}
