//  定义一些常量
const X_PI = 3.14159265358979324 * 3000.0 / 180.0
const PI = 3.1415926535897932384626
const a = 6378245.0
const ee = 0.00669342162296594323
/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bdLon
 * @param bdLat
 * @returns {*[]}
 */
export const bd09togcj02 = function (bdLon, bdLat) {
  bdLon = +bdLon
  bdLat = +bdLat
  const x = bdLon - 0.0065
  const y = bdLat - 0.006
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI)
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI)
  const GG_LNG = z * Math.cos(theta)
  const GG_LAT = z * Math.sin(theta)
  return [GG_LNG, GG_LAT]
}

/**
 * 火星坐标系 (GCJ-02) 与百度坐标系 (BD-09) 的转换
 * 即谷歌、高德 转 百度
 * @param lng
 * @param lat
 * @returns {*[]}
 */
export const gcj02tobd09 = function (lng, lat) {
  lat = +lat
  lng = +lng
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI)
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI)
  const BD_LNG = z * Math.cos(theta) + 0.0065
  const bdLat = z * Math.sin(theta) + 0.006
  return [BD_LNG, bdLat]
}

/**
 * WGS84转GCj02
 * @param lng
 * @param lat
 * @returns {*[]}
 */
export const wgs84togcj02 = function (lng, lat) {
  lat = +lat
  lng = +lng
  if (outOfChina(lng, lat)) {
    return [lng, lat]
  } else {
    let dlat = transformlat(lng - 105.0, lat - 35.0)
    let dlng = transformlng(lng - 105.0, lat - 35.0)
    const radlat = lat / 180.0 * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return [mglng, mglat]
  }
}

export const wgs84tobd09 = function (lng, lat) {
  lat = +lat
  lng = +lng
  if (outOfChina(lng, lat)) {
    return [lng, lat]
  } else {
    const gcj02 = wgs84togcj02(lng, lat)
    const bd09 = gcj02tobd09(gcj02[0], gcj02[1])
    return bd09
  }
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
export const gcj02towgs84 = function (lng, lat) {
  lat = +lat
  lng = +lng
  if (outOfChina(lng, lat)) {
    return [lng, lat]
  } else {
    let dlat = transformlat(lng - 105.0, lat - 35.0)
    let dlng = transformlng(lng - 105.0, lat - 35.0)
    const radlat = lat / 180.0 * PI
    let magic = Math.sin(radlat)
    magic = 1 - ee * magic * magic
    const sqrtmagic = Math.sqrt(magic)
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI)
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI)
    const mglat = lat + dlat
    const mglng = lng + dlng
    return [lng * 2 - mglng, lat * 2 - mglat]
  }
}

/**
 * 百度坐标系 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {number[]|*[]}
 */
export const bd09towgs84 = function (lng, lat) {
  lat = +lat
  lng = +lng
  if (outOfChina(lng, lat)) {
    return [lng, lat]
  } else {
    const gcj02 = bd09togcj02(lng, lat)
    const gps84 = gcj02towgs84(gcj02[0], gcj02[1])
    return gps84
  }
}

export const transformlat = function (lng, lat) {
  lat = +lat
  lng = +lng
  let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0
  return ret
}

export const transformlng = function (lng, lat) {
  lat = +lat
  lng = +lng
  let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng))
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0
  return ret
}

/**
 * 判断是否在国内，不在国内则不做偏移
 * @param lng
 * @param lat
 * @returns {boolean}
 */
export const outOfChina = function (lng, lat) {
  lat = +lat
  lng = +lng
  // 纬度3.86~53.55,经度73.66~135.05
  return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55)
}

export default {
  bd09togcj02,
  gcj02tobd09,
  wgs84togcj02,
  gcj02towgs84,
  bd09towgs84,
  wgs84tobd09
}
