function forEachPoint (func) {
  return function (input, optOutput, optDimension) {
    const len = input.length
    const dimension = optDimension || 2
    let output
    if (optOutput) {
      output = optOutput
    } else {
      if (dimension !== 2) {
        output = input.slice()
      } else {
        output = new Array(len)
      }
    }
    for (let offset = 0; offset < len; offset += dimension) {
      func(input, output, offset)
    }
    return output
  }
}

const sphericalMercator = {
  RADIUS: 6378137,
  MAX_LATITUDE: 85.0511287798,
  RAD_PER_DEG: Math.PI / 180,
  forward: forEachPoint(function (input, output, offset) {
    const lat = Math.max(Math.min(sphericalMercator.MAX_LATITUDE, input[offset + 1]), -sphericalMercator.MAX_LATITUDE)
    const sin = Math.sin(lat * sphericalMercator.RAD_PER_DEG)

    output[offset] = sphericalMercator.RADIUS * input[offset] * sphericalMercator.RAD_PER_DEG
    output[offset + 1] = sphericalMercator.RADIUS * Math.log((1 + sin) / (1 - sin)) / 2
  }),
  inverse: forEachPoint(function (input, output, offset) {
    output[offset] = input[offset] / sphericalMercator.RADIUS / sphericalMercator.RAD_PER_DEG
    output[offset + 1] = (2 * Math.atan(Math.exp(input[offset + 1] / sphericalMercator.RADIUS)) - (Math.PI / 2)) / sphericalMercator.RAD_PER_DEG
  })
}

function getRange (v, min, max) {
  v = Math.max(v, min)
  v = Math.min(v, max)

  return v
}

function getLoop (v, min, max) {
  const d = max - min
  while (v > max) {
    v -= d
  }
  while (v < min) {
    v += d
  }

  return v
}

function convertor (input, output, offset, table) {
  const px = input[offset]
  const py = input[offset + 1]
  const x = table[0] + table[1] * Math.abs(px)
  const d = Math.abs(py) / table[9]
  const y = table[2] +
    table[3] *
    d +
    table[4] *
    d *
    d +
    table[5] *
    d *
    d *
    d +
    table[6] *
    d *
    d *
    d *
    d +
    table[7] *
    d *
    d *
    d *
    d *
    d +
    table[8] *
    d *
    d *
    d *
    d *
    d *
    d

  output[offset] = x * (px < 0 ? -1 : 1)
  output[offset + 1] = y * (py < 0 ? -1 : 1)
}

const baiduMercator = {
  MCBAND: [12890594.86, 8362377.87,
    5591021, 3481989.83, 1678043.12, 0],
  LLBAND: [75, 60, 45, 30, 15, 0],
  MC2LL: [
    [1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331,
      200.9824383106796, -187.2403703815547, 91.6087516669843,
      -23.38765649603339, 2.57121317296198, -0.03801003308653,
      17337981.2],
    [-7.435856389565537e-9, 0.000008983055097726239,
      -0.78625201886289, 96.32687599759846, -1.85204757529826,
      -59.36935905485877, 47.40033549296737, -16.50741931063887,
      2.28786674699375, 10260144.86],
    [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616,
      59.74293618442277, 7.357984074871, -25.38371002664745,
      13.45380521110908, -3.29883767235584, 0.32710905363475,
      6856817.37],
    [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591,
      40.31678527705744, 0.65659298677277, -4.44255534477492,
      0.85341911805263, 0.12923347998204, -0.04625736007561,
      4482777.06],
    [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062,
      23.10934304144901, -0.00023663490511, -0.6321817810242,
      -0.00663494467273, 0.03430082397953, -0.00466043876332,
      2555164.4],
    [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8,
      7.47137025468032, -0.00000353937994, -0.02145144861037,
      -0.00001234426596, 0.00010322952773, -0.00000323890364,
      826088.5]],
  LL2MC: [
    [-0.0015702102444, 111320.7020616939, 1704480524535203,
      -10338987376042340, 26112667856603880,
      -35149669176653700, 26595700718403920,
      -10725012454188240, 1800819912950474, 82.5],
    [0.0008277824516172526, 111320.7020463578, 647795574.6671607,
      -4082003173.641316, 10774905663.51142, -15171875531.51559,
      12053065338.62167, -5124939663.577472, 913311935.9512032,
      67.5],
    [0.00337398766765, 111320.7020202162, 4481351.045890365,
      -23393751.19931662, 79682215.47186455, -115964993.2797253,
      97236711.15602145, -43661946.33752821, 8477230.501135234,
      52.5],
    [0.00220636496208, 111320.7020209128, 51751.86112841131,
      3796837.749470245, 992013.7397791013, -1221952.21711287,
      1340652.697009075, -620943.6990984312, 144416.9293806241,
      37.5],
    [-0.0003441963504368392, 111320.7020576856, 278.2353980772752,
      2485758.690035394, 6070.750963243378, 54821.18345352118,
      9540.606633304236, -2710.55326746645, 1405.483844121726,
      22.5],
    [-0.0003218135878613132, 111320.7020701615, 0.00369383431289,
      823725.6402795718, 0.46104986909093, 2351.343141331292,
      1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],
  forward: forEachPoint(function (input, output, offset) {
    const lng = getLoop(input[offset], -180, 180)
    const lat = getRange(input[offset + 1], -74, 74)

    let table = null
    let j
    for (j = 0; j < baiduMercator.LLBAND.length; ++j) {
      if (lat >= baiduMercator.LLBAND[j]) {
        table = baiduMercator.LL2MC[j]
        break
      }
    }
    if (table === null) {
      for (j = baiduMercator.LLBAND.length - 1; j >= 0; --j) {
        if (lat <= -baiduMercator.LLBAND[j]) {
          table = baiduMercator.LL2MC[j]
          break
        }
      }
    }
    output[offset] = lng
    output[offset + 1] = lat
    convertor(output, output, offset, table)
  }),
  inverse: forEachPoint(function (input, output, offset) {
    const Y_ABS = Math.abs(input[offset + 1])

    let table = null
    for (let j = 0; j < baiduMercator.MCBAND.length; j++) {
      if (Y_ABS >= baiduMercator.MCBAND[j]) {
        table = baiduMercator.MC2LL[j]
        break
      }
    }

    convertor(input, output, offset, table)
  })
}

const gcj02 = {
  PI: Math.PI,
  AXIS: 6378245.0,
  OFFSET: 0.00669342162296594323, // (a^2 - b^2) / a^2
  delta: function (wgLon, wgLat) {
    let dLat = this.transformLat(wgLon - 105.0, wgLat - 35.0)
    let dLon = this.transformLon(wgLon - 105.0, wgLat - 35.0)
    const radLat = wgLat / 180.0 * this.PI
    let magic = Math.sin(radLat)
    magic = 1 - this.OFFSET * magic * magic
    const sqrtMagic = Math.sqrt(magic)
    dLat = (dLat * 180.0) / ((this.AXIS * (1 - this.OFFSET)) / (magic * sqrtMagic) * this.PI)
    dLon = (dLon * 180.0) / (this.AXIS / sqrtMagic * Math.cos(radLat) * this.PI)
    return [dLon, dLat]
  },
  outOfChina: function (lon, lat) {
    if (lon < 72.004 || lon > 137.8347) {
      return true
    }
    return lat < 0.8293 || lat > 55.8271
  },
  transformLat: function (x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0
    ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0
    return ret
  },
  transformLon: function (x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x))
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0
    ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0
    ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0
    return ret
  },
  toWGS84: forEachPoint(function (input, output, offset) {
    let lng = input[offset]
    let lat = input[offset + 1]
    if (!gcj02.outOfChina(lng, lat)) {
      const deltaD = gcj02.delta(lng, lat)
      lng = lng - deltaD[0]
      lat = lat - deltaD[1]
    }
    output[offset] = lng
    output[offset + 1] = lat
  }),
  fromWGS84: forEachPoint(function (input, output, offset) {
    let lng = input[offset]
    let lat = input[offset + 1]
    if (!gcj02.outOfChina(lng, lat)) {
      const deltaD = gcj02.delta(lng, lat)
      lng = lng + deltaD[0]
      lat = lat + deltaD[1]
    }
    output[offset] = lng
    output[offset + 1] = lat
  })
}

const bd09 = {
  PI: Math.PI,
  X_PI: Math.PI * 3000 / 180,
  toGCJ02: function (input, output, offset) {
    const x = input[offset] - 0.0065
    const y = input[offset + 1] - 0.006
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * bd09.X_PI)
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * bd09.X_PI)
    output[offset] = z * Math.cos(theta)
    output[offset + 1] = z * Math.sin(theta)
    return output
  },
  fromGCJ02: function (input, output, offset) {
    const x = input[offset]
    const y = input[offset + 1]
    const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * bd09.X_PI)
    const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * bd09.X_PI)
    output[offset] = z * Math.cos(theta) + 0.0065
    output[offset + 1] = z * Math.sin(theta) + 0.006
    return output
  },
  toWGS84: function (input, optOutput, optDimension) {
    const output = forEachPoint(bd09.toGCJ02)(input, optOutput, optDimension)
    return gcj02.toWGS84(output, output, optDimension)
  },
  fromWGS84: function (input, optOutput, optDimension) {
    const output = gcj02.fromWGS84(input, optOutput, optDimension)
    return forEachPoint(bd09.fromGCJ02)(output, output, optDimension)
  }
}

const projzh = {
  smerc2bmerc: function (input, optOutput, optDimension) {
    let output = sphericalMercator.inverse(input, optOutput, optDimension)
    output = bd09.fromWGS84(output, output, optDimension)
    return baiduMercator.forward(output, output, optDimension)
  },
  bmerc2smerc: function (input, optOutput, optDimension) {
    let output = baiduMercator.inverse(input, optOutput, optDimension)
    output = bd09.toWGS84(output, output, optDimension)
    return sphericalMercator.forward(output, output, optDimension)
  },
  bmerc2ll: function (input, optOutput, optDimension) {
    const output = baiduMercator.inverse(input, optOutput, optDimension)
    return bd09.toWGS84(output, output, optDimension)
  },
  ll2bmerc: function (input, optOutput, optDimension) {
    const output = bd09.fromWGS84(input, optOutput, optDimension)
    return baiduMercator.forward(output, output, optDimension)
  },
  mc2gcj02mc: function (input, optOutput, optDimension) {
    let output = sphericalMercator.inverse(input, optOutput, optDimension)
    output = gcj02.fromWGS84(output, output, optDimension)
    return sphericalMercator.forward(output, output, optDimension)
  },
  gcj02mc2mc: function (input, optOutput, optDimension) {
    let output = sphericalMercator.inverse(input, optOutput, optDimension)
    output = gcj02.toWGS84(output, output, optDimension)
    return sphericalMercator.forward(output, output, optDimension)
  },
  gcj02mc2ll: function (input, optOutput, optDimension) {
    const output = sphericalMercator.inverse(input, optOutput, optDimension)
    return gcj02.toWGS84(output, output, optDimension)
  },
  ll2gcj02mc: function (input, optOutput, optDimension) {
    const output = gcj02.fromWGS84(input, optOutput, optDimension)
    return sphericalMercator.forward(output, output, optDimension)
  },
  ll2smerc: sphericalMercator.forward,
  smerc2ll: sphericalMercator.inverse
}

export default projzh
