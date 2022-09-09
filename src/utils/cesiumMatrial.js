import * as Cesium from 'cesium'
export const polylineMaterial = (option) => {
  const defaultOptions = {
    color: 'rgba(255,0,0,1)',
    speed: 1.0, // flowing speed, speed > 0.0
    headSize: 0.05, // 0.0 < headsize < 1.0
    tailSize: 1, // 0.0 < tailsize < 1.0
    widthOffset: 0.1, // 0.0 < widthoffset < 1.0
    coreSize: 0.05// 0.0 < coresize < 1.0
  }
  const options = { ...defaultOptions, ...option }
  const color = options.color
  const speed = options.speed
  const headsize = options.headSize
  const tailsize = options.tailSize
  const widthoffset = options.widthOffset
  const coresize = options.coreSize
  const matGLSL =
      'float SPEED_STEP = 0.01; \n' +
      'vec4 drawLight(float xPos, vec2 st, float headOffset, float tailOffset, float widthOffset){ \n' +
      'float lineLength = smoothstep(xPos + headOffset, xPos, st.x) - smoothstep(xPos, xPos - tailOffset, st.x); \n' +
      'float lineWidth = smoothstep(widthOffset, 0.5, st.y) - smoothstep(0.5, 1.0 - widthOffset, st.y); \n' +
      'return vec4(lineLength * lineWidth); \n' +
      '}\n' +
      'czm_material czm_getMaterial(czm_materialInput materialInput) \n' +
      '{ \n' +
      'czm_material m = czm_getDefaultMaterial(materialInput);\n' +
      'float sinTime = sin(czm_frameNumber * SPEED_STEP * speed); \n' +
      'vec4 v4_core;\n' +
      'vec4 v4_color;\n' +
      'float xPos = 0.0; \n' +
      'if (sinTime < 0.0){ \n' +
      'xPos = cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize; \n' +
      '}else{ \n' +
      'xPos = -cos(czm_frameNumber * SPEED_STEP * speed)+ 1.0 - tailsize; \n' +
      '} \n' +
      'v4_color = drawLight(xPos, materialInput.st, headsize, tailsize, widthoffset);\n' +
      'v4_core = drawLight(xPos, materialInput.st, coresize, coresize*2.0, widthoffset*2.0);\n' +
      'm.diffuse = color.xyz + v4_core.xyz*v4_core.w*0.8; \n' +
      'm.alpha = pow(v4_color.w, 3.0); \n' +
      'return m; \n' +
      '} \n'
  const myMat = new Cesium.Material({
    fabric: {
      type: 'FlowingLineMaterial',
      uniforms: {
        color: window.Cesium.Color.fromCssColorString(color), // light color
        speed, // flowing speed, speed > 0.0
        headsize, // 0.0 < headsize < 1.0
        tailsize, // 0.0 < tailsize < 1.0
        widthoffset, // 0.0 < widthoffset < 1.0
        coresize // 0.0 < coresize < 1.0
      },
      source: matGLSL
    }
  })
  return new window.Cesium.PolylineMaterialAppearance({
    material: myMat
  })
}

export const rippleMaterial = (option) => {
  const defaultOptions = {
    color: 'rgba(255,0,0,1)'
  }
  const options = { ...defaultOptions, ...option }
  const color = options.color
  const matGLSL =
      'vec3 RipplePing(in vec2 uv, in vec2 center, in float innerTail, \n' +
      'in float frontierBorder, in float timeResetSeconds, \n' +
      'in float RipplePingSpeed, in float fadeDistance, float t) \n' +
      '{ \n' +
      'vec2 diff = center - uv; \n' +
      'float r = length(diff); \n' +
      'float time = mod(t, timeResetSeconds) * RipplePingSpeed; \n' +
      'float circle; \n' +
      'circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder, time, r); \n' +
      'circle *= smoothstep(fadeDistance, 0.0, r); \n' +
      'return vec3(circle); \n' +
      '} \n' +
      'czm_material czm_getMaterial(czm_materialInput materialInput) \n' +
      '{ \n' +
      'czm_material m = czm_getDefaultMaterial(materialInput);\n' +
      'vec2 uv = materialInput.st; \n' +
      'uv = uv.xy * 2.; \n' +
      'uv += vec2(-1.0, -1.0); \n' +
      'float fadeDistance = 1.8; \n' +
      'float resetTimeSec = 5.; \n' +
      'float RipplePingSpeed = 0.2; \n' +
      'vec2 greenPing = vec2(0.0, 0.0); \n' +
      'vec3 outColor;\n' +
      'float iTime = czm_frameNumber * 0.01; \n' +
      'outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime); \n' +
      'outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime + 1.5); \n' +
      'outColor += RipplePing(uv, greenPing, 0.08, 0.00025, resetTimeSec, RipplePingSpeed, fadeDistance, iTime + 3.0); \n' +
      'm.diffuse = outColor * color.xyz; \n' +
      'm.alpha = outColor.r; \n' +
      'return m; \n' +
      '} \n'
  const myMat = new window.Cesium.Material({
    fabric: {
      type: 'RippleMaterial',
      uniforms: {
        color: window.Cesium.Color.fromCssColorString(color) // light color
      },
      source: matGLSL
    }
  })
  return new window.Cesium.EllipsoidSurfaceAppearance({
    material: myMat
  })
}

export const radarScanMaterial = () => {
  const matGLSL =
      '#define L length(c - .1*vec2(    // use: L x,y)) \n' +
      '#define M(v)   max(0., v) \n' +
      'czm_material czm_getMaterial(czm_materialInput materialInput) \n' +
      '{ \n' +
      'czm_material m = czm_getDefaultMaterial(materialInput);\n' +
      'vec2 uv = materialInput.st; \n' +
      'vec2 c = uv+uv - 1.0, \n' +
      'k = .1-.1*step(.007,abs(c)); \n' +
      'float x = L 0))*25., // x,y - polar coords \n' +
      'iTime = czm_frameNumber * 0.01, \n' +
      'y = mod(atan(c.y, c.x)+iTime, 6.28), \n' +
      'd = M(.75 - y * .4), \n' +
      'b = min( min(L -3,-1)), L 6,-4)) ), L 4,5)) ) + .06 - y * .04; \n' +
      'float result = (x < 24. ? .25 + M(cos(x + .8) - .95) * 8.4 + k.x + k.y + d * d+ M(.8 - y * (x + x + .3)): 0.) \n' +
      '+ M(1. - abs(x + x - 48.)); \n' +
      'm.diffuse = vec3(0.0, result, 0.1); \n' +
      'm.alpha = result; \n' +
      'return m; \n' +
      '} \n'

  const myMat = new window.Cesium.Material({
    fabric: {
      type: 'RadarMaterial',
      source: matGLSL
    }
  })
  return new window.Cesium.EllipsoidSurfaceAppearance({
    material: myMat
  })
}
