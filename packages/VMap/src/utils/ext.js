/* eslint-disable*/
import { Map } from 'ol'
import BaseObject from 'ol/Object'
import * as olRender from 'ol/render'
import Fill from 'ol/style/Fill'
import RegularShape from 'ol/style/RegularShape'
import Point from 'ol/geom/Point'
import CircleStyle from 'ol/style/Circle'
import * as olProj from 'ol/proj'
import * as olExtent from 'ol/extent'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import ImageCanvasSource from 'ol/source/ImageCanvas'
import Attribution from 'ol/control/Attribution'
import TileImage from 'ol/source/TileImage'
import * as olSize from 'ol/size'
import Geometry from 'ol/geom/Geometry'
import GeoJSON from 'ol/format/GeoJSON'
import TileGrid from 'ol/tilegrid/TileGrid'
import {createXYZ} from 'ol/tilegrid'
import LayerGroup from 'ol/layer/Group'
import {toContext} from 'ol/render';

var SuperMapExt = {};
var as = {
  ISERVER: "ISERVER",
  IPORTAL: "IPORTAL",
  ONLINE: "ONLINE"
};
var dUnit = {
  CENTIMETER: "CENTIMETER",
  DECIMETER: "DECIMETER",
  DEGREE: "DEGREE",
  FOOT: "FOOT",
  INCH: "INCH",
  KILOMETER: "KILOMETER",
  METER: "METER",
  MILE: "MILE",
  MILLIMETER: "MILLIMETER",
  MINUTE: "MINUTE",
  RADIAN: "RADIAN",
  SECOND: "SECOND",
  YARD: "YARD"
};
var renderType = ["canvas", "webgl"];
var util = {
  createCanvasContext2D: createCanvasContext2D,
  supportWebGL2: supportWebGL2,
  isArray: isArray,
  isString: isString
};
var tileOptions = {
  extend: extend
};
var defaultGraphicStyle = {
  color: [0, 0, 0, 255],
  opacity: .8,
  radius: 10,
  radiusScale: 1,
  radiusMinPixels: 0,
  radiusMaxPixels: Number.MAX_SAFE_INTEGER,
  strokeWidth: 1,
  outline: !1
};
var graphicOptions = {
  defaultGraphicStyle: defaultGraphicStyle,
  renderType: renderType
};
var k, aa = this;
function t(a, b) {
  var c = SuperMapExt;
  a = a.split(".");
  c = c || aa;
  a[0] in c || !c.execScript || c.execScript("var " + a[0]);
  for (var d; a.length && (d = a.shift());) a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {}: c[d] = b
};
function w(a, b) {
  a.prototype = Object.create(b.prototype);
  a.prototype.constructor = a
};
function dataMathUtil() {
  console.info('this test')
}
function extend(e, t) {
  if (e = e || {},
    t) {
    for (var r in t) {
      var s = t[r];
      void 0 !== s && (e[r] = s)
    } ! ("function" == typeof window.Event && t instanceof window.Event) && t.hasOwnProperty && t.hasOwnProperty("toString") && (e.toString = t.toString)
  }
  return e
}
function resolutionToScale(resolution, dpi, mapUnit) {
  var s = resolution * dpi * (1 / .0254) * getMeterPerMapUnit(mapUnit);
  return s = 1 / s
}
function toProcessingParam(e) {
  var t = {};
  if (e.length < 1) t = "";
  else {
    for (var r = [], s = 0; s < e.length; s++) {
      var i = {};
      i.x = e[s][0],
        i.y = e[s][1],
        r.push(i)
    }
    r.push(r[0]),
      t.type = "REGION",
      t.points = r
  }
  return t
}
function scaleToResolution(scale, dpi, mapUnit) {
  var s = scale * dpi * (1 / .0254) * getMeterPerMapUnit(mapUnit);
  return s = 1 / s
}
function getMeterPerMapUnit(mapUnit) {
  var t;
  if (mapUnit === dUnit.METER) t = 1;
  else if (mapUnit === dUnit.DEGREE) t = 2 * Math.PI * 6378137 / 360;
  else if (mapUnit === dUnit.KILOMETER) t = .001;
  else if (mapUnit === dUnit.INCH) t = 1 / .025399999918;
  else {
    if (mapUnit !== dUnit.FOOT) return t;
    t = .3048
  }
  return t
}
function isArray(e) {
  return "[object Array]" == Object.prototype.toString.call(e)
}
function Csv2GeoJSON(e, t) {
  t = t || {
    titles: ["lon", "lat"],
    latitudeTitle: "lat",
    longitudeTitle: "lon",
    fieldSeparator: ",",
    lineSeparator: "\n",
    deleteDoubleQuotes: !0,
    firstLineTitles: !1
  };
  var r = [];
  if ("string" == typeof e) {
    var s = t.titles;
    if (t.firstLineTitles) {
      if ((e = e.split(t.lineSeparator)).length < 2) return;
      s = e[0],
        e.splice(0, 1),
        e = e.join(t.lineSeparator),
        s = s.trim().split(t.fieldSeparator);
      for (let e = 0; e < s.length; e++) s[e] = a(s[e]);
      t.titles = s
    }
    for (let e = 0; e < s.length; e++) {
      var i = s[e].toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "_");
      "" != i && "_" != i || (i = "prop-" + e),
        r[e] = i
    }
    e = function(e) {
      var s = {
          type: "FeatureCollection",
          features: []
        },
        i = t.titles;
      e = e.split(t.lineSeparator);
      for (var n = 0; n < e.length; n++) {
        var o = e[n].trim().split(t.fieldSeparator),
          l = parseFloat(o[i.indexOf(t.longitudeTitle)]),
          h = parseFloat(o[i.indexOf(t.latitudeTitle)]),
          u = l < 180 && l > -180 && h < 90 && h > -90;
        if (o.length == i.length && u) {
          var c = {
            type: "Feature",
            geometry: {},
            properties: {}
          };
          c.geometry.type = "Point",
            c.geometry.coordinates = [l, h];
          for (var d = 0; d < i.length; d++) i[d] != t.latitudeTitle && i[d] != t.longitudeTitle && (c.properties[r[d]] = a(o[d]));
          s.features.push(c)
        }
      }
      return s
    } (e)
  }
  return e;
  function a(e) {
    return t.deleteDoubleQuotes && (e = e.trim().replace(/^"/, "").replace(/"$/, "")),
      e
  }
}
function createCanvasContext2D(e, t) {
  var r = document.createElement("CANVAS");
  return e && (r.width = e),
  t && (r.height = t),
    r.getContext("2d")
}
function supportWebGL2() {
  var e = document.createElement("canvas");
  return Boolean(e && e.getContext("webgl2"))
}
function isString(e) {
  return "string" == typeof e && e.constructor === String
}
function trim(e) {
  return e.replace(/(^\s*)|(\s*$)/g, "")
}
function newGuid(e) {
  let t = e || 32,
    r = "";
  for (let e = 1; e < t; e++) {
    r += Math.floor(16 * Math.random()).toString(16)
  }
  return r
}
function isNumber(e) {
  if ("" === e) return ! 1;
  let t = Number(e);
  return 0 === t || !isNaN(t)
}
function getFeatureBySQL(e, t, r, s) {
  let i,
    a,
    n;
  i = new Mt({
    name: t.join().replace(":", "@"),
    attributeFilter: "SMID > 0"
  }),
    n = new rs({
      queryParameter: i,
      datasetNames: t,
      fromIndex: 0,
      toIndex: 1e5,
      maxFeatures: 1e5,
      returnContent: !0
    }),
    (a = new ss(e, {
      eventListeners: {
        processCompleted: function(e) {
          r && r(e)
        },
        processFailed: function(e) {
          s && s(e)
        }
      },
      withCredentials: !0
    })).processAsync(n)
}
function isMatchAdministrativeName(e, t) {
  if (dataMathUtil.isString(t)) {
    let r = e.substr(0, 2);
    return "å¼ å®¶" === r && (r = e.substr(0, 3)),
      !!t.match(new RegExp(r))
  }
  return ! 1
}
function accessUtil() {
  console.info('this test')
}
function getToken(access) {
  if (access) {
    this.tokens = this.tokens || {};
    var t = _getTokenStorageKey(access);
    return this.tokens[t]
  }
}
function getKey(access) {
  this.keys = this.keys || {};
  var t = _getUrlRestString(access) || access;
  return this.keys[t]
}
function _getTokenStorageKey(access) {
  var t = access.match(/(.*?):\/\/([^\/]+)/i);
  return t ? t[0] : access
}
function _getUrlRestString(access) {
  if (!access) return access;
  var t = access.match(/http:\/\/(.*\/rest)/i);
  return t ? t[0] : access
}
function tileSuperMapRest(opts) {
  if (void 0 !== (opts = opts || {}).url) {
    opts.attributions = opts.attributions || new Attribution({
      html: "Map Data <span>Â© <a href='http://support.supermap.com.cn/product/iServer.aspx' target='_blank'>SuperMap iServer</a></span> with <span>Â© <a href='http://iclient.supermap.io' target='_blank'>SuperMap iClient</a></span>"
    }),
      opts.format = opts.format ? opts.format: "png";
    var t = opts.url + "/tileImage." + opts.format + "?";
    opts.serverType = opts.serverType || as.ISERVER,
      TileImage.call(this, {
        attributions: opts.attributions,
        cacheSize: opts.cacheSize,
        crossOrigin: opts.crossOrigin,
        logo: opts.logo,
        opaque: opts.opaque,
        projection: opts.projection,
        reprojectionErrorThreshold: opts.reprojectionErrorThreshold,
        state: opts.state,
        tileClass: opts.tileClass,
        tileGrid: opts.tileGrid,
        tileLoadFunction: opts.tileLoadFunction,
        tilePixelRatio: opts.tilePixelRatio,
        tileUrlFunction: function(t, i, a) {
          r.tileGrid || (opts.extent ? (r.tileGrid = createTileGrid(opts.extent), r.resolutions && (r.tileGrid.resolutions = r.resolutions)) : ("EPSG:3857" === a.getCode() && (r.tileGrid = createTileGrid([ - 20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]), r.extent = [ - 20037508.3427892, -20037508.3427892, 20037508.3427892, 20037508.3427892]), "EPSG:4326" === a.getCode() && (r.tileGrid = createTileGrid([ - 180, -90, 180, 90]), r.extent = [ - 180, -90, 180, 90])));
          r.origin = r.tileGrid.getOrigin(0);
          var n = t[0],
            o = t[1],
            l = -t[2] - 1,
            h = r.tileGrid.getResolution(n),
            u = a.getUnits() || dUnit.DEGREE;
          "degrees" !== u && "degree" !== u || (u = dUnit.DEGREE);
          "m" !== u && "meter" !== u || (u = dUnit.METER);
          var c = resolutionToScale(h, 96, u),
            p = olSize.toSize(r.tileGrid.getTileSize(n, r.tmpSize)),
            m = function() {
              this._paramsChanged && (this._layerUrl = s.call(this), this._paramsChanged = !1);
              return this._layerUrl || s.call(this)
            }.call(r) + encodeURI("&x=" + o + "&y=" + l + "&width=" + p[0] + "&height=" + p[1] + "&scale=" + c);
          r.tileProxy && (m = r.tileProxy + encodeURIComponent(m));
          r.cacheEnabled || (m += "&_t=" + (new Date).getTime());
          return m
        },
        url: opts.url,
        urls: opts.urls,
        wrapX: void 0 !== opts.wrapX && opts.wrapX,
        transition: opts.transition,
        cacheEnabled: opts.cacheEnabled,
        layersID: opts.layersID
      }),
    opts.tileProxy && (this.tileProxy = opts.tileProxy),
      this.options = opts,
      this._url = opts.url,
      this.tileSetsIndex = -1,
      this.tempIndex = -1;
    var r = this
  }
  function s() {
    return this._layerUrl = t + encodeURI(function() {
      this.requestParams = this.requestParams ||
        function() {
          var t = {};
          return t.redirect = void 0 !== opts.redirect && opts.redirect,
            t.transparent = void 0 === opts.transparent || opts.transparent,
            t.cacheEnabled = !(!1 === opts.cacheEnabled),
            this.cacheEnabled = t.cacheEnabled,
            t._cache = t.cacheEnabled,
          this.origin && (t.origin = JSON.stringify({
            x: this.origin[0],
            y: this.origin[1]
          })),
          opts.prjCoordSys && (t.prjCoordSys = JSON.stringify(opts.prjCoordSys)),
          opts.layersID && (t.layersID = opts.layersID.toString()),
          opts.clipRegion instanceof Geometry && (opts.clipRegionEnabled = !0, opts.clipRegion = dataMathUtil.toSuperMapGeometry((new GeoJSON).writeGeometryObject(opts.clipRegion)), opts.clipRegion = fe.toJSON(je.fromGeometry(opts.clipRegion)), t.clipRegionEnabled = opts.clipRegionEnabled, t.clipRegion = JSON.stringify(opts.clipRegion)),
            opts.overlapDisplayed ? t.overlapDisplayed = !0 : (t.overlapDisplayed = !1, opts.overlapDisplayedOptions && (t.overlapDisplayedOptions = this.overlapDisplayedOptions.toString())),
          opts.cacheEnabled && opts.tileversion && (t.tileversion = opts.tileversion.toString()),
            t
        }.call(this);
      var t = [];
      for (var r in this.requestParams) t.push(r + "=" + this.requestParams[r]);
      return t.join("&")
    }.call(this)),
      this._layerUrl = function(opts, t) {
        var s, i, n = opts;
        switch (t) {
          case as.IPORTAL:
            (s = (i = getToken(r._url)) ? new Le(i, "token") : null) || (s = (i = getKey(r._url)) ? new Le(i, "key") : null);
            break;
          case as.ONLINE:
            s = (i = getKey(r._url)) ? new Le(i, "key") : null;
            break;
          default:
            s = (i = getToken(r._url)) ? new Le(i, "token") : null
        }
        return s && (n += "&" + s.getUrlParameters()),
          n
      } (this._layerUrl, opts.serverType),
      this._layerUrl
  }
}
function setTileSetsInfo(e) {
  this.tileSets = e,
  dataMathUtil.isArray(this.tileSets) && (this.tileSets = e[0]),
  this.tileSets && (this.dispatchEvent({
    type: "tilesetsinfoloaded",
    value: {
      tileVersions: this.tileSets.tileVersions
    }
  }), this.changeTilesVersion())
}
function lastTilesVersion() {
  this.tempIndex = this.tileSetsIndex - 1,
    this.changeTilesVersion()
}
function nextTilesVersion() {
  this.tempIndex = this.tileSetsIndex + 1,
    this.changeTilesVersion()
}
function changeTilesVersion() {
  var e = this;
  if (null != e.tileSets && !(e.tempIndex === e.tileSetsIndex || this.tempIndex < 0)) {
    var t = e.tileSets.tileVersions;
    if (t && e.tempIndex < t.length && e.tempIndex >= 0) {
      var r = t[e.tempIndex].name;
      e.mergeTileVersionParam(r) && (e.tileSetsIndex = e.tempIndex, e.dispatchEvent({
        type: "tileversionschanged",
        value: {
          tileVersion: t[e.tempIndex]
        }
      }))
    }
  }
}
function updateCurrentTileSetsIndex(e) {
  this.tempIndex = e
}
function mergeTileVersionParam(e) {
  return !! e && (this.requestParams.tileversion = e, this._paramsChanged = !0, this.refresh(), !0)
}
function optionsFromMapJSON(e, t) {
  var r = {};
  r.url = e,
    r.crossOrigin = "anonymous";
  var s = [t.bounds.left, t.bounds.bottom, t.bounds.right, t.bounds.top],
    i = function() {
      var e, r = s[2] - s[0],
        i = s[3] - s[1],
        a = r >= i ? r: i;
      e = a === r ? a / t.viewer.width: a / t.viewer.height;
      var n = [],
        o = dUnit.METER;
      t.coordUnit === dUnit.DEGREE && (o = dUnit.DEGREE);
      if (t.visibleScalesEnabled && t.visibleScales && t.visibleScales.length > 0) for (let e = 0; e < t.visibleScales.length; e++) n.push(dataMathUtil.scaleToResolution(t.visibleScales[e], 96, o));
      else for (let t = 0; t < 22; t++) n.push(e / Math.pow(2, t));
      return n.sort(function(e, t) {
        return t - e
      })
    } ();
  return r.tileGrid = new TileGrid({
    extent: s,
    resolutions: i
  }),
    r
}
function createTileGrid(e, t, r, s, i) {
  var a = createXYZ({
    extent: e,
    maxZoom: t,
    minZoom: r,
    tileSize: s
  });
  return new TileGrid({
    extent: e,
    minZoom: r,
    origin: i,
    resolutions: a.getResolutions(),
    tileSize: a.getTileSize()
  })
}
var superInteraction = function() {
  const e = function(t, r, s, i, a, n) {
    t instanceof LayerGroup ? t.getLayers().forEach(function(t) {
      e(t, r, s, i, a, n)
    }) : t.getSource()._forEachFeatureAtCoordinate && t.getSource()._forEachFeatureAtCoordinate(r, s,
      function(e) {
        return i(e, t)
      },
      a, n)
  };
  Map.prototype.forEachSmFeatureAtPixel = function(t, r, s, i) {
    const a = s && s.layerFilter ? s.layerFilter: function() {
        return ! 0
      },
      n = this.getLayers().getArray(),
      o = this.getView().getResolution(),
      l = this.getCoordinateFromPixel(t);
    for (var s = 0; s < n.length; s++) {
      const h = n[s];
      h.getVisible() && a.call(null, h) && e(h, l, o, r, t, i)
    }
    return this.forEachFeatureAtPixel(t, r, s)
  }
} ();
const Pu = function() {
  return ! 1
};
const Lu = function() {
  var e = document.createElement("div"),
    t = ["transform", "WebkitTransform", "MozTransform", "OTransform", "msTransform"];
  for (var r = 0; r < t.length; r++) {
    var s = t[r];
    if (void 0 !== e.style[s]) return s
  }
  return t[0]
} ();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var drawCanvas = function (_ol$Object2) {
  _inherits(drawCanvas, _ol$Object2);

  function drawCanvas(e, t) {
    var _this3;

    _classCallCheck(this, drawCanvas);

    (_this3 = _possibleConstructorReturn(this, (drawCanvas.__proto__ || Object.getPrototypeOf(drawCanvas)).call(this)), _this3), _this3.layer = e, _this3.map = e.map;
    var r = t || {};
    tileOptions.extend(_this3, r), _this3.highLightStyle = _this3.layer.highLightStyle, _this3.mapWidth = _this3.size[0], _this3.mapHeight = _this3.size[1], _this3.width = _this3.map.getSize()[0], _this3.height = _this3.map.getSize()[1], _this3.context = util.createCanvasContext2D(_this3.mapWidth, _this3.mapHeight), _this3.context.scale(_this3.pixelRatio, _this3.pixelRatio), _this3.canvas = _this3.context.canvas, _this3.canvas.style.width = _this3.width + "px", _this3.canvas.style.height = _this3.height + "px", _this3._registerEvents();
    return _this3;
  }

  _createClass(drawCanvas, [{
    key: "_registerEvents",
    value: function _registerEvents() {
      this.map.on("change:size", this._resizeEvent.bind(this), this);
    }
  }, {
    key: "_resizeEvent",
    value: function _resizeEvent() {
      this._resize(), this._clearAndRedraw();
    }
  }, {
    key: "_resize",
    value: function _resize() {
      var e = this.map.getSize(),
        t = e[0],
        r = e[1],
        s = t / this.width,
        i = r / this.height;
      this.width = t, this.height = r, this.mapWidth = this.mapWidth * s, this.mapHeight = this.mapHeight * i, this.canvas.width = this.mapWidth, this.canvas.height = this.mapHeight, this.canvas.style.width = this.width + "px", this.canvas.style.height = this.height + "px";
    }
  }, {
    key: "_clearAndRedraw",
    value: function _clearAndRedraw() {
      this._clearBuffer(), this.layer.changed();
    }
  }, {
    key: "update",
    value: function update() {
      this.layer.changed();
    }
  }, {
    key: "_clearBuffer",
    value: function _clearBuffer() {}
  }, {
    key: "getCanvas",
    value: function getCanvas() {
      return this.canvas;
    }
  }, {
    key: "drawGraphics",
    value: function drawGraphics(e) {
      this.graphics_ = e || [];
      var t = this.mapWidth / this.pixelRatio,
        r = this.mapHeight / this.pixelRatio,
        s = [(t - this.width) / 2, (r - this.height) / 2],
        i = toContext(this.context, {
          size: [t, r],
          pixelRatio: this.pixelRatio
        });
      var a = this.layer._getDefaultStyle();
      var n = this,
        o = n.layer.map;
      e.map(function (e) {
        var t = e.getStyle() || a;
        if (n.selected === e) {
          _e3.map.getView().setCenter(_e3.getGeometry().getCoordinates());
          _e3.map.getView().setZoom(_e3.setZoom);
          var _e3 = t;
          t instanceof CircleStyle ? _e3 = new CircleStyle({
            radius: t.getRadius(),
            fill: new Fill({
              color: "rgba(0, 153, 255, 1)"
            }),
            stroke: t.getStroke(),
            snapToPixel: t.getSnapToPixel()
          }) : t instanceof RegularShape && (_e3 = new RegularShape({
            radius: t.getRadius(),
            radius2: t.getRadius2(),
            points: t.getPoints(),
            angle: t.getAngle(),
            snapToPixel: t.getSnapToPixel(),
            rotation: t.getRotation(),
            rotateWithView: t.getRotateWithView(),
            fill: new Fill({
              color: "rgba(0, 153, 255, 1)"
            }),
            stroke: t.getStroke()
          })), t = n.highLightStyle || _e3;
        }
        i.setStyle(t);
        var r = e.getGeometry().getCoordinates(),
          l = o.getPixelFromCoordinate(r),
          h = -o.getView().getRotation(),
          u = o.getPixelFromCoordinate(o.getView().getCenter()),
          c = function (e, t, r) {
            return [Math.cos(t) * (e[0] - r[0]) - Math.sin(t) * (e[1] - r[1]) + r[0], Math.sin(t) * (e[0] - r[0]) + Math.cos(t) * (e[1] - r[1]) + r[1]];
          }(function (e, t, r) {
            return [(e[0] - t[0]) * r + t[0], (e[1] - t[1]) * r + t[1]];
          }(l, u, 1), h, u),
          d = [c[0] + s[0], c[1] + s[1]],
          p = new Point(d);
        return i.drawGeometry(p), e;
      });
    }
  }]);

  return drawCanvas;
}(BaseObject);

var drawWebGl = function (_ol$Object3) {
  _inherits(drawWebGl, _ol$Object3);

  function drawWebGl(e, t) {
    var _this4;

    _classCallCheck(this, drawWebGl);

    (_this4 = _possibleConstructorReturn(this, (drawWebGl.__proto__ || Object.getPrototypeOf(drawWebGl)).call(this)), _this4), _this4.layer = e, _this4.map = e.map;
    var r = t || {};
    tileOptions.extend(_this4, r);
    var s = _this4.pixelRatio = window ? window.devicePixelRatio : 1;
    _this4.width = _this4.map.getSize()[0] * s, _this4.height = _this4.map.getSize()[1] * s, _this4.center = _this4.map.getView().getCenter(), _this4._initContainer(), _this4._registerEvents();
    return _this4;
  }

  _createClass(drawWebGl, [{
    key: "_registerEvents",
    value: function _registerEvents() {
      var e = this.map,
        t = e.getView();
      e.on("change:size", this._resizeEvent.bind(this), this), t.on("change:resolution", this._moveEndEvent.bind(this), this), t.on("change:center", this._moveEvent.bind(this), this), t.on("change:rotation", this._moveEndEvent.bind(this), this), e.on("moveend", this._moveEndEvent.bind(this), this);
    }
  }, {
    key: "_resizeEvent",
    value: function _resizeEvent() {
      this._resize(), this._clearAndRedraw();
    }
  }, {
    key: "_moveEvent",
    value: function _moveEvent() {
      var e = this.map.getPixelFromCoordinate(this.center),
        t = this.map.getPixelFromCoordinate(this.map.getView().getCenter()),
        r = [e[0] - t[0], e[1] - t[1]];
      this._canvas.style[Lu] = "translate(" + Math.round(r[0]) + "px," + Math.round(r[1]) + "px)";
    }
  }, {
    key: "_moveEndEvent",
    value: function _moveEndEvent() {
      this._canvas.style[Lu] = "translate(0,0)", this.center = this.map.getView().getCenter(), this._clearAndRedraw();
    }
  }, {
    key: "_clearAndRedraw",
    value: function _clearAndRedraw() {
      this._clearBuffer(), this.layer.changed();
    }
  }, {
    key: "_resize",
    value: function _resize() {
      var e = this.map.getSize(),
        t = e[0] * this.pixelRatio,
        r = e[1] * this.pixelRatio;
      this._canvas.width = t, this._canvas.height = r, this._canvas.style.width = t + "px", this._canvas.style.height = r + "px";
    }
  }, {
    key: "_clearBuffer",
    value: function _clearBuffer() {
      if (!this.deckGL) return;
      var e = this.deckGL.layerManager;
      return e && e.context.gl.clear(e.context.gl.COLOR_BUFFER_BIT), this;
    }
  }, {
    key: "getCanvas",
    value: function getCanvas() {
      return this._canvas;
    }
  }, {
    key: "update",
    value: function update(e) {
      if (e && e.length > -1 && (this._data = e), !this._renderLayer) return;
      this._renderLayer.setChangeFlags({
        dataChanged: !0,
        propsChanged: !0,
        viewportChanged: !0,
        updateTriggersChanged: !0
      }), this._refreshData();
      var t = this._getLayerState();
      t.data = this._data || [], this._renderLayer.setNeedsRedraw(!0), this._renderLayer.setState(t);
    }
  }, {
    key: "drawGraphics",
    value: function drawGraphics(e) {
      this._data = e || (this._data ? this._data : []), this._renderLayer || this._createInnerRender(), this._clearBuffer(), this._draw();
    }
  }, {
    key: "_initContainer",
    value: function _initContainer() {
      this._canvas = this._createCanvas(this.width, this.height), this._layerContainer = this.container, this._wrapper = document.createElement("div"), this._wrapper.className = "deck-wrapper", this._wrapper.style.position = "absolute", this._wrapper.style.top = "0", this._wrapper.style.left = "0", this._wrapper.appendChild(this._canvas), this._layerContainer && this._layerContainer.appendChild(this._wrapper);
    }
  }, {
    key: "_createCanvas",
    value: function _createCanvas(e, t) {
      var r = document.createElement("canvas");
      return r.oncontextmenu = Pu, r.width = e, r.height = t, r.style.width = e + "px", r.style.height = t + "px", r;
    }
  }, {
    key: "_createInnerRender",
    value: function _createInnerRender() {
      var e = this,
        t = this._getLayerState(),
        r = t.color,
        s = t.radius,
        i = t.opacity,
        a = t.highlightColor,
        n = t.radiusScale,
        o = t.radiusMinPixels,
        l = t.radiusMaxPixels,
        h = t.strokeWidth,
        u = t.outline;

      s = this._pixelToMeter(s);
      var c = {
          id: "scatter-plot",
          data: [],
          pickable: Boolean(this.onClick) || Boolean(this.onHover),
          autoHighlight: !0,
          color: r,
          opacity: i,
          radius: s,
          radiusScale: n,
          highlightColor: a,
          radiusMinPixels: o,
          radiusMaxPixels: l,
          strokeWidth: h,
          outline: u,
          getPosition: function getPosition(t) {
            if (!t) return [0, 0, 0];
            var r = t.getGeometry(),
              s = r && r.getCoordinates();
            return (s = e._project(s)) && [s[0], s[1], 0];
          },
          getColor: function getColor(t) {
            var r = e._getLayerDefaultStyle(),
              s = t && t.getStyle();
            return s && s.getColor() || r.color;
          },
          getRadius: function getRadius(t) {
            var r = e._getLayerDefaultStyle(),
              s = t && t.getStyle();
            return s && s.getRadius() || r.radius;
          },

          updateTriggers: {
            getColor: [r],
            getRadius: [s]
          }
        },
        d = this;
      this.onClick && (c.onClick = function () {
        d._canvas.style.cursor = "pointer", d.onClick.apply(d, arguments);
      }), this.onHover && (c.onHover = function () {
        d._canvas.style.cursor = "pointer", d.onHover.apply(d, arguments);
      }), e._renderLayer = new window.DeckGL.ScatterplotLayer(c);
    }
  }, {
    key: "_getLayerDefaultStyle",
    value: function _getLayerDefaultStyle() {
      var _getLayerState2 = this._getLayerState(),
        e = _getLayerState2.color,
        t = _getLayerState2.opacity,
        r = _getLayerState2.radius,
        s = _getLayerState2.radiusScale,
        i = _getLayerState2.radiusMinPixels,
        a = _getLayerState2.radiusMaxPixels,
        n = _getLayerState2.strokeWidth,
        o = _getLayerState2.outline;

      return {
        color: e,
        opacity: t,
        radius: r = this._pixelToMeter(r),
        radiusScale: s,
        radiusMinPixels: i,
        radiusMaxPixels: a,
        strokeWidth: n,
        outline: o
      };
    }
  }, {
    key: "_getLayerState",
    value: function _getLayerState() {
      var e = this.layer.getLayerState(),
        t = this.map.getView().getProjection().getCode(),
        r = olProj.transform([e.longitude, e.latitude], t, "EPSG:4326");
      return e.longitude = r[0], e.latitude = r[1], e.zoom = e.zoom - 1, e;
    }
  }, {
    key: "_draw",
    value: function _draw() {
      this._refreshData();
      var e = this._getLayerState();
      e.data = this._data || [];
      var t = {};
      for (var r in e) {
        t[r] = e[r];
      }this._renderLayer.setNeedsRedraw(!0), t.layers = [this._renderLayer], t.canvas = this._canvas, this.onBeforeRender && (t.onBeforeRender = this.onBeforeRender.bind(this)), this.onAfterRender && (t.onAfterRender = this.onAfterRender.bind(this)), this.deckGL ? this.deckGL.setProps(t) : this.deckGL = new window.DeckGL.experimental.DeckGLJS(t);
    }
  }, {
    key: "_refreshData",
    value: function _refreshData() {
      var e = this._data || [],
        t = util.isArray(e) ? [].concat(e) : [e];
      this._renderLayer.props.data || (this._renderLayer.props.data = []), this._renderLayer.props.data.length = 0;
      for (var _e4 = 0; _e4 < t.length; _e4++) {
        this._renderLayer.props.data.push(t[_e4]);
      }this._data = this._renderLayer.props.data;
    }
  }, {
    key: "_project",
    value: function _project(e) {
      var t = this.map.getView().getProjection().getCode();
      return "EPSG:4326" === t ? e : olProj.transform(e, t, "EPSG:4326");
    }
  }, {
    key: "_pixelToMeter",
    value: function _pixelToMeter(e) {
      var t = this.map.getView(),
        r = t.getProjection().getUnits() || "degrees";
      "degrees" === r && (r = units.DEGREE), "m" === r && (r = units.METER);
      var s = t.getResolution();
      if (r === units.DEGREE) {
        return e * (s * (6378137 * Math.PI / 180));
      }
      return e * s;
    }
  }]);

  return drawWebGl;
}(BaseObject);

var GraphicSource = function (_ol$source$ImageCanva) {
  _inherits(GraphicSource, _ol$source$ImageCanva);

  function GraphicSource(e) {
    var _this;

    // _classCallCheck(this, GraphicSource);

    (_this = _possibleConstructorReturn(this, (GraphicSource.__proto__ || Object.getPrototypeOf(GraphicSource)).call(this, {
      attributions: e.attributions,
      canvasFunction: function canvasFunction(e, r, s, i, a) {
        t.renderer || (t.renderer = function (e, r) {
          var s = void 0;
          if (t.render === graphicOptions.renderType[0]) s = new drawCanvas(t, {
            size: e,
            pixelRatio: r
          });else {
            var _e = tileOptions.extend({}, graphicOptions.defaultGraphicStyle),
              _i = tileOptions.extend(_e, {
                color: t.color,
                opacity: t.opacity,
                radius: t.radius,
                radiusScale: t.radiusScale,
                radiusMinPixels: t.radiusMinPixels,
                radiusMaxPixels: t.radiusMaxPixels,
                strokeWidth: t.strokeWidth,
                outline: t.outline,
                onClick: t.onClick,
                onHover: t.onHover
              });
            (_i = tileOptions.extend(t, _i)).pixelRatio =
              r, _i.container =
              t.map.getViewport().getElementsByClassName("ol-overlaycontainer")[0], _i.onBeforeRender = function () {
              return !1;
            }, _i.onAfterRender = function () {
              return !1;
            }, s = new drawWebGl(t, _i);
          }
          return s;
        }(i, s));
        var n = this.getGraphicsInExtent(e);
        return t.renderer._clearBuffer(), t.renderer.selected = this.selected, t.renderer.drawGraphics(n), t.renderer.getCanvas();
      },
      logo: e.logo,
      projection: e.projection,
      ratio: e.ratio,
      resolutions: e.resolutions,
      state: e.state
    })), _this),
      _this.graphics = [].concat(e.graphics), _this.map = e.map, _this.setZoom = e.setZoom ? e.setZoom : 16,
      tileOptions.extend(_this, e), _this.render = e.render || renderType[0], util.supportWebGL2() || (_this.render = renderType[0]),
      _this.highLightStyle = e.highLightStyle, _this.isHighLight = void 0 === e.isHighLight || e.isHighLight, _this.hitGraphicLayer = null,
      _this._forEachFeatureAtCoordinate = function (e, r, s, i, a) {
      var n = t.getGraphicsInExtent();
      for (var o = n.length - 1; o >= 0; o--) {
        var l = n[o].getStyle();
        if (!l) return;
        var h = n[o].getGeometry().getCoordinates(),
          u = l.getImage(),
          c = !1;

        var _t = [];
        _t[0] = h[0] - u.getAnchor()[0] * r, _t[2] = h[0] + u.getAnchor()[0] * r, _t[1] = h[1] - u.getAnchor()[1] * r,
          _t[3] = h[1] + u.getAnchor()[1] * r,
        olExtent.containsCoordinate(_t, e) && (c = !0);

        !0 !== c ? _t.isHighLight && _t._highLightClose() : (_t.isHighLight && _t._highLight(h, u, n[o], i), s && s(n[o], a));
      }
      return;
    };
    var t = _this;
    e.onClick && t.map.on("singleclick", function (r) {
      if (t.map.getView().getZoom() >= t.setZoom) {
        t.map.forEachSmFeatureAtPixel(r.pixel, e.onClick, {}, r);
      }
    });
    return _this;
  }

  _createClass(GraphicSource, [{
    key: "setGraphics",
    value: function setGraphics(e) {
      this.graphics = this.graphics || [], this.graphics.length = 0;
      var t = util.isArray(e) ? [].concat(e) : [e];
      this.graphics = [].concat(t), this.update();
    }
  }, {
    key: "addGraphics",
    value: function addGraphics(e) {
      this.graphics = this.graphics || [];
      var t = util.isArray(e) ? [].concat(e) : [e];
      this.graphics = this.graphics.concat(t), this.update();
    }
  }, {
    key: "getGraphicBy",
    value: function getGraphicBy(e, t) {
      var r = null;
      for (var s in this.graphics) {
        if (this.graphics[s][e] === t) {
          r = this.graphics[s];
          break;
        }
      }return r;
    }
  }, {
    key: "getGraphicById",
    value: function getGraphicById(e) {
      return this.getGraphicBy("id", e);
    }
  }, {
    key: "getGraphicsByAttribute",
    value: function getGraphicsByAttribute(e, t) {
      var r,
        s = [];
      for (var i in this.graphics) {
        (r = this.graphics[i]) && r.attributes && r.attributes[e] === t && s.push(r);
      }return s;
    }
  }, {
    key: "removeGraphics",
    value: function removeGraphics() {
      var e = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (!e || 0 === e.length || e === this.graphics) return this.graphics.length = 0, void this.update();
      ye.isArray(e) || (e = [e]);
      for (var _t2 = e.length - 1; _t2 >= 0; _t2--) {
        var r = e[_t2],
          s = ye.indexOf(this.graphics, r);-1 !== s && this.graphics.splice(s, 1);
      }
      this.update();
    }
  }, {
    key: "clear",
    value: function clear() {
      this.removeGraphics();
    }
  }, {
    key: "update",
    value: function update() {
      this.renderer.update(this.graphics, this._getDefaultStyle());
    }
  }, {
    key: "_getDefaultStyle",
    value: function _getDefaultStyle() {
      var e = {};
      return this.color && (e.fill = new Fill({
        color: this.toRGBA(this.color)
      })), this.radius && (e.radius = this.radius), this.outline && (e.stroke = new Fill({
        color: this.toRGBA(this.color),
        width: this.strokeWidth
      })), new CircleStyle(e);
    }
  }, {
    key: "toRGBA",
    value: function toRGBA(e) {
      return "rgba($ {\n\t\t\te[0]\n\t\t},\n\t\t$ {\n\t\t\te[1]\n\t\t},\n\t\t$ {\n\t\t\te[2]\n\t\t},\n\t\t$ { (e[3] || 255) / 255\n\t\t})";
    }
  }, {
    key: "setStyle",
    value: function setStyle(e) {
      var t = {
        color: this.color,
        radius: this.radius,
        opacity: this.opacity,
        highlightColor: this.highlightColor,
        radiusScale: this.radiusScale,
        radiusMinPixels: this.radiusMinPixels,
        radiusMaxPixels: this.radiusMaxPixels,
        strokeWidth: this.strokeWidth,
        outline: this.outline
      };
      tileOptions.extend(this, tileOptions.extend(t, e)), this.update();
    }
  }, {
    key: "getLayerState",
    value: function getLayerState() {
      var e = this.map,
        t = e.getSize()[0],
        r = e.getSize()[1],
        s = e.getView(),
        i = s.getCenter(),
        a = {
          longitude: i[0],
          latitude: i[1],
          zoom: s.getZoom(),
          maxZoom: s.getMaxZoom(),
          pitch: 0,
          bearing: 180 * -s.getRotation() / Math.PI
        },
        n = {};
      for (var _e2 in a) {
        n[_e2] = a[_e2];
      }return n.width = t, n.height = r, n.color = this.color, n.radius = this.radius, n.opacity = this.opacity, n.highlightColor = this.highlightColor, n.radiusScale = this.radiusScale, n.radiusMinPixels = this.radiusMinPixels, n.radiusMaxPixels = this.radiusMaxPixels, n.strokeWidth = this.strokeWidth, n.outline = this.outline, n;
    }
  }, {
    key: "_highLightClose",
    value: function _highLightClose() {
      this.selected = null, this.hitGraphicLayer && (this.map.removeLayer(this.hitGraphicLayer), this.hitGraphicLayer = null), this.changed();
    }
  }, {
    key: "_highLight",
    value: function _highLight(e, t, r, s) {
      this.selected = r, this.changed();
    }
  }, {
    key: "getGraphicsInExtent",
    value: function getGraphicsInExtent(e) {
      var t = [];
      return e ? (this.graphics.map(function (r) {
        return olExtent.containsExtent(e, r.getGeometry().getExtent()) && t.push(r), r;
      }), t) : (this.graphics.map(function (e) {
        return t.push(e), e;
      }), t);
    }
  }]);

  return GraphicSource;
}(ImageCanvasSource);

var Graphic = function (_ol$Object) {
  _inherits(Graphic, _ol$Object);

  function Graphic(e, t) {
    var _this2;

    // _classCallCheck(this, Graphic);

    (_this2 =
      _possibleConstructorReturn(
        this,(Graphic.__proto__ || Object.getPrototypeOf(Graphic)).call(this)
      ), _this2
    ),
    e instanceof Array && (_this2.geometry_ = new Point(e,'XY')), _this2.attributes = t, _this2.setStyle();
    return _this2;
  }

  _createClass(Graphic, [{
    key: "clone",
    value: function clone() {
      var e = new Graphic();
      return e.setId(this.id), e.setGeometry(this.geometry_), e.setAttributes(this.attributes), e.setStyle(this.style_), e;
    }
  }, {
    key: "getId",
    value: function getId() {
      return this.id;
    }
  }, {
    key: "setId",
    value: function setId(e) {
      this.id = e;
    }
  }, {
    key: "getGeometry",
    value: function getGeometry() {
      return this.geometry_;
    }
  }, {
    key: "setGeometry",
    value: function setGeometry(e) {
      this.geometry_ = e;
    }
  }, {
    key: "setAttributes",
    value: function setAttributes(e) {
      this.attributes = e;
    }
  }, {
    key: "getAttributes",
    value: function getAttributes() {
      return this.attributes;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      return this.style_;
    }
  }, {
    key: "setStyle",
    value: function setStyle(e) {
      (this.style || e) && (this.style_ = e, this.styleFunction_ = e ? Graphic.createStyleFunction(new Style({
        image: e
      })) : void 0, this.changed());
    }
  }, {
    key: "getStyleFunction",
    value: function getStyleFunction() {
      return this.styleFunction_;
    }
  }, {
    key: "setIcon",
    value: function setIcon(iconUrl) {
      var img = new Image();
      var graphic = this;
      img.onload = function () {
        graphic.style_.setImage(new Icon({
          img: this,
          size: [this.width, this.height],
          imgSize: [this.width, this.height]
        }));
      };
      img.src = iconUrl;
    }
  }, {
    key: "setPosition",
    value: function setPosition(poi) {
      this.geometry_.setCoordinates(poi);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.id = null, this.geometry_ = null, this.attributes = null, this.style_ = null;
    }
  }], [{
    key: "createStyleFunction",
    value: function createStyleFunction(e) {
      var t, r;
      "function" == typeof e ? t = 2 == e.length ? function (t) {
        return e(this, t);
      } : e : (r = Array.isArray(e) ? e : [e], t = function t() {
        return r;
      });
      return t;
    }
  }]);

  return Graphic;
}(BaseObject);

function toQueryString(obj) {
  return Object.keys(obj).reduce(function(acc, k) {
    acc.push(
      typeof obj[k] === 'object'
        ? toQueryString(obj[k])
        : `${encodeURIComponent(k)}=${encodeURIComponent(obj[k])}`
    );
    // 修改为ES5支持语法 encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    return acc;
  }, []).join('&');
}

function requestHttp(ajax) {
  var opt = ajax || {};
  var method = ajax.method || 'GET';
  var asynchronous = ajax.asynchronous == undefined ? true : ajax.asynchronous;
  var url = ajax.url || '';
  var params = ajax.data || {};
  var handle = ajax.handle || function(e) {return e};
  var callback = ajax.callback || function() {};

  // 初始状态判断
  if (typeof url !== 'string') {
    console.error('url must be a string');
    return;
  }
  if (typeof params !== 'object') {
    console.error('data must be a object');
    return;
  }

  var xhr = null;
  // 请求体构建
  if (window.ActiveXObject) {
    xhr = new ActiveXObject('Microsoft.XMLHTTP');
  } else if (window.XMLHttpRequest) {
    // 创建【XHR】对象。IE7+
    xhr = new XMLHttpRequest();
  }
  // 数据请求
  if (xhr != null) {
    // 判断是否需要设置同步操作
    if (asynchronous) {
      xhr.onreadystatechange = function() {
        // 4: 请求已完成且响应已就绪 0: 请求未初始化 1: 服务器连接已建立 2: 请求已接收 3: 正在处理请求
        if (this.readyState == 4) {
          //数据请求成功。【2**】表示请求成功，【304】表示从浏览器缓存中获取数据
          if ((this.status >= 200 && this.status < 300) || this.status === 304) {
            //【xhr.responseText】表示请求到的数据
            // success(xhr.responseText);
            var res = handle(JSON.parse(xhr.responseText));
            callback(res);
          } else{
            //【xhr.status】表示请求失败是对应的HTTP状态码
            error(this.status);
          }

        }
      };
    }

    if ('GET' == method) {
      var query_str = toQueryString(params);
      // 修改为ES5支持语法 /\?/   ES6增加正则u修饰符
      url += (/\?/u.test(url) ? '&' : '?') + query_str;
      xhr.open('GET', url, asynchronous);
      xhr.send();
    } else if ('POST' == method) {
      xhr.open('POST', url, asynchronous);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.send(toQueryString(params));
    }

    if (!asynchronous) {
      var res = handle(JSON.parse(xhr.responseText));
      callback(res);
    }
  }
}

var webApi = function () {
  /**
   * @constructor
   */
  function webApi() {
    _classCallCheck(this, webApi);

    this.settings = {
      source: 'gaode', // 服务来源 gaode/baidu/gnss
      type: 'poi', // poi - 关键字检索  geocode - 地址编码  direction - 路径规划
      callbackName: ''
    };
  }

  _createClass(webApi, [{
    key: 'getParameters',
    value: function getParameters(opt) {
      var options = opt || {};
      var api_source = options.source || this.settings.source;
      var result = {};
      switch (api_source) {
        case 'baidu':
          // 选取百度服务
          result = this.getBDServices(options);
          break;
        case 'gnss':
          // 选取卫星定位自定义服务
          result = this.getGNSSServices(options);
          break;
        default:
          // 默认选取高德服务
          result = this.getGDServices(options);
          break;
      }
      return result;
      // return {
      //   url: this.settings.url,
      //   params: {},
      // };
    }
  }, {
    key: 'getGNSSServices',
    value: function getGNSSServices(opt) {}
  }, {
    key: 'getBDServices',
    value: function getBDServices(opt) {
      var api_type = opt.type || this.settings.type;
      var api_key = 'FDaNYZwNxfiM8tbiOCrleVgkVlAZCgbl';
      var service = {};
      switch (api_type) {
        case 'poi':
          // 查询关键字信息
          var poi = opt.poi || {};
          service = {
            url: "http://api.map.baidu.com/place/v2/search",
            params: {
              ak: api_key,
              output: 'json',
              page_num: poi.page_num || 1, // 请求页面
              page_size: poi.page_size || 20,
              query: encodeURIComponent(poi.query || ''),
              region: encodeURIComponent(poi.region)
            },
            callbackName: opt.callbackName,
            handle: this.handlePoi('baidu')
          };
          break;
        case 'geocode':
          // 正/逆地址解析
          var geocode = opt.geocode || {};
          var code_type = geocode.req_type === 'reverse' ? 'regeo' : 'geo';
          service = {
            url: "https://restapi.amap.com/v3/geocode/" + code_type,
            params: {
              ak: api_key,
              output: 'json',
              address: geocode.address,
              batch: geocode.batch,
              city: geocode.city
            },
            callbackName: opt.callbackName,
            handle: this.handelGeocode('baidu')
          };
          break;
        case 'direction':
          // 驾车路线请求
          var direction = opt.direction || {};
          var drive_type = 'driving';
          service = {
            url: "https://restapi.amap.com/v5/direction/" + drive_type,
            params: {
              ak: api_key,
              output: 'json',
              origin: direction.origin,
              destination: direction.destination,
              show_fields: 'polyline'
            },
            callbackName: opt.callbackName,
            handle: this.handelDirection('baidu')
          };
          break;
      }
      return service;
    }
  }, {
    key: 'getGDServices',
    value: function getGDServices(opt) {
      var api_type = opt.type || this.settings.type;
      var key_setting = this.keyGdSetting(opt.proj_code);
      var api_key = key_setting || '4b94fff663efb2e7c540c51879809b39'; // '16baa52d92eff3168020c04c3dd0957a';
      var service = {};
      switch (api_type) {
        case 'poi':
          // 查询关键字信息
          var poi = opt.poi || {};
          poi.key = api_key;
          service = {
            url: "https://restapi.amap.com/v3/place/text",
            params: poi,
            callbackName: opt.callbackName,
            method: 'GET',
            handle: this.handlePoi('gaode')
          };
          break;
        case 'geocode':
          // 正/逆地址解析
          var geocode = opt.geocode || {};
          var code_type = geocode.req_type === 'reverse' ? 'regeo' : 'geo';
          geocode.key = api_key;
          service = {
            url: "https://restapi.amap.com/v3/geocode/" + code_type,
            params: geocode,
            callbackName: opt.callbackName,
            method: 'GET',
            handle: this.handelGeocode('gaode')
          };
          break;
        case 'direction':
          // 驾车路线请求
          var direction = opt.direction || {};
          var drive_type = direction.drive_type || 'driving';
          direction.key = api_key;
          service = {
            url: "https://restapi.amap.com/v5/direction/" + drive_type,
            params: direction,
            callbackName: opt.callbackName,
            method: 'GET',
            handle: this.handelDirection('gaode')
          };
          break;
        case 'track':
          // 鹰眼相关的服务接口，合并
          var track = opt.track || {};
          track.key = track.key || api_key;
          var track_set = this.trackGdType(track.model);
          var track_type = track_set.model_str;
          service = {
            url: "https://tsapi.amap.com/v1/track/" + track_type,
            params: track,
            callbackName: opt.callbackName,
            method: track_set.request_method
          };
          break;
        case 'custom':
          // 根据自定应地址及参数进行数据内容的请求
          var custom = opt.custom || {};
          custom.key = custom.key || api_key;
          custom.method_str = custom.method_str || 'GET';
          service = {
            url: opt.customUrl,
            params: custom,
            method: custom.method_str
          };
          break;
      }
      return service;
    }
  }, {
    key: 'trackGdType',
    value: function trackGdType(model) {
      // 鹰眼服务接口数据拼装
      var model_str = '';
      var request_method = 'GET';
      switch (model) {
        case 'trsearch':
          // 轨迹查询及纠偏
          model_str = 'terminal/trsearch';
          break;
        case 'roaddata':
          // 查询轨迹所在道路属性 - 收费
          model_str = 'terminal/roaddata';
          request_method = 'POST';
          break;
        case 'traceAdd':
          // 轨迹上传创建
          model_str = 'trace/add';
          request_method = 'POST';
          break;
        case 'traceUpload':
          // 轨迹点上传（单点、批量）
          model_str = 'point/upload';
          request_method = 'POST';
          break;
        case 'columnList':
          // 轨迹自定义 - 查询
          model_str = 'point/column/list';
          break;
        case 'columnAdd':
          // 轨迹自定义 - 新增
          model_str = 'point/column/add';
          request_method = 'POST';
          break;
        case 'terminalList':
          // 终端管理 - 查询
          model_str = 'terminal/list';
          break;
        case 'terminalAdd':
          // 终端管理 - 新增
          model_str = 'terminal/add';
          request_method = 'POST';
          break;
        case 'terminalSearch':
          // 终端搜索 - 关键字查询
          model_str = 'terminal/search';
          request_method = 'POST';
          break;
        case 'serviceList':
          // 服务管理 - 查询
          model_str = 'service/list';
          break;
        case 'serviceAdd':
          // 服务管理 - 新增
          model_str = 'service/add';
          request_method = 'POST';
          break;
      }
      return {
        model_str: model_str,
        request_method: request_method
      };
    }
  }, {
    key: 'keyGdSetting',
    value: function keyGdSetting(proj_code) {
      var key_str = undefined;
      switch (proj_code) {
        case 'zc_v3':
          // 新智程3.0版本
          key_str = '29b3c05e1e10f52c6848f7dc4c6f290a';
          break;
      }
      return key_str;
    }
  }, {
    key: 'handlePoi',
    value: function handlePoi(source) {
      var handel = null;
      switch (source) {
        case 'baidu':
          handel = function handel(results) {
            if (results.count === '0') {
              return results.suggestion.cities;
            } else {
              return results.pois.map(function (result) {
                return {
                  lon: result.location !== '' ? result.location.split(',')[0] : 0,
                  lat: result.location !== '' ? result.location.split(',')[1] : 0,
                  id: result.id,
                  parentid: result['parent'],
                  address: {
                    name: result.name,
                    province: result.pname,
                    cityname: result.cityname,
                    areaname: result.adname,
                    addinfo: result.address,
                    type: result.type
                  },
                  original: result
                };
              });
            }
          };
          break;
        case 'gaode':
          handel = function handel(results) {
            if (results.count === '0') {
              return []; // results.suggestion.cities;
            } else {
              return results.pois.map(function (result) {
                return {
                  lon: result.location !== '' ? result.location.split(',')[0] : 0,
                  lat: result.location !== '' ? result.location.split(',')[1] : 0,
                  id: result.id,
                  parentid: result['parent'],
                  address: {
                    name: result.name,
                    province: result.pname,
                    cityname: result.cityname,
                    areaname: result.adname,
                    addinfo: result.address,
                    type: result.type
                  },
                  original: result
                };
              });
            }
          };
          break;
        default:
          break;

      }
      return handel;
    }
  }, {
    key: 'handelDirection',
    value: function handelDirection(source) {
      var handel = null;
      switch (source) {
        case 'baidu':
          break;
        case 'gaode':
          handel = function handel(results) {
            if (results.count === '0') {
              return [];
            } else {
              return results.route.paths.map(function (result) {
                return {
                  distance: result.distance,
                  restriction: result.restriction,
                  paths: result.steps,
                  original: result
                };
              });
            }
          };
          break;
        default:
          break;

      }
      return handel;
    }
  }, {
    key: 'handelGeocode',
    value: function handelGeocode(source) {
      var handel = null;
      switch (source) {
        case 'baidu':
          break;
        case 'gaode':
          handel = function handel(results) {
            if (results.count === '0') {
              return [];
            } else {
              return results.geocodes.map(function (result) {
                return {
                  lon: result.location !== '' ? result.location.split(',')[0] : 0,
                  lat: result.location !== '' ? result.location.split(',')[1] : 0,
                  address: {
                    province: result.province,
                    cityname: result.city,
                    areaname: result.district,
                    addinfo: result.formatted_address,
                    type: result.level,
                    code: result.adcode
                  },
                  original: result
                };
              });
            }
          };
          break;
        default:
          break;

      }
      return handel;
    }
  }]);

  return webApi;
}();

t("gpsExt.tileSuperMapRest", tileSuperMapRest);
t("gpsExt.dataMathUtil", dataMathUtil);
t("gpsExt.util", util);
t("gpsExt.tileOptions", tileOptions);
t("gpsExt.graphicOptions", graphicOptions);
t("gpsExt.units", dUnit);
t("gpsExt.GraphicRender", GraphicSource);
t("gpsExt.Graphic", Graphic);
t("gpsExt.webApi", webApi);
t("gpsExt.requestHttp", requestHttp);

export default {
  tileSuperMapRest:tileSuperMapRest,
  dataMathUtil:dataMathUtil,
  util:util,
  tileOptions:tileOptions,
  graphicOptions:graphicOptions,
  dUnit:dUnit,
  GraphicRender:GraphicSource,
  Graphic:Graphic,
  webApi:webApi,
  requestHttp:requestHttp
}
