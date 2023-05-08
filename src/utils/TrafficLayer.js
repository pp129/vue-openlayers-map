/* eslint-disable */
import ImageLayer from "ol/layer/Image";
import ImageCanvasSource from "ol/source/ImageCanvas";

/**
 * @openlayers叠加百度路况矢量瓦片
 */

function TrafficLayer(options) {
    options = options || {};
    this.options = options;
    options.colors = options.colors || [
        'rgba(0,192,73,0.99609375)',
        'rgba(242,48,48,0.99609375)',
        'rgba(255,159,25,0.99609375)'
    ];
    var colors = options.colors;
    this.map = options.map;
    this.canvas = null;
    this.tileType = options.tileType;
    const size = this.map.getSize();
    var extent = this.map.getView().calculateExtent(size);

    var layer = new ImageLayer({
        extent: extent,
        source: new ImageCanvasSource({
            canvasFunction: this.canvasFunction.bind(this),
            ratio: 1,
            projection: 'EPSG:4326'
        })
    });
    this.layer = layer;

    this.map.on('precompose', ()=> {
        var size = this.map.getSize();
        var extent = this.map.getView().calculateExtent(size);
        layer.setExtent(extent);
    }, false);

    this.parseColors(colors);
    this.tileSize = 256;
    this.ratio = devicePixelRatio;
    this.drawTogether = false;
    this.cache = {};
    this._loadCount = {};
    if (options.getTileUrl) {
        this.getTileUrl = options.getTileUrl;
    }
}

TrafficLayer.prototype.canvasFunction = function(extent, resolution, pixelRatio, size, projection) {
    var canvas = this.canvas;
    if (!canvas) {
        var view = this.map.getView();
        canvas = document.createElement('canvas');
        this.canvas = canvas;

    }

    canvas.width = size[0];
    canvas.height = size[1];
    this.update({
        resolution: resolution,
        canvas: canvas
    });

    var ctx = canvas.getContext('2d');

    var radius = 30;
    /*
    var pixel = map.getPixelFromCoordinate(ol.proj.transform([116.403497,39.914779], 'EPSG:4326', 'EPSG:3857'));
    ctx.fillStyle = 'rgba(0, 0, 250, 0.5)';
    ctx.fillRect(pixel[0] - radius / 2, pixel[1] - radius / 2, radius, radius);
    */

    /*
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    var pixel = map.getPixelFromCoordinate([12958191.03,4825971.76]);
    ctx.fillRect(pixel[0] - radius / 2, pixel[1] - radius / 2, radius, radius);
    */
    return canvas;
};

TrafficLayer.prototype.parseColors = function (colors) {
    this.arrFeatureStyles = [
        [2, colors[0] || 'rgba(79,210,125,1)', 2, 2, 0, [], 0, 0],
        [2, colors[0] || 'rgba(79,210,125,1)', 3, 2, 0, [], 0, 0],
        [2, colors[0] || 'rgba(79,210,125,1)', 3, 2, 0, [], 0, 0],
        [2, colors[0] || 'rgba(79,210,125,1)', 5, 2, 0, [], 0, 0],
        [2, colors[0] || 'rgba(79,210,125,1)', 6, 2, 0, [], 0, 0],
        [2, colors[2] || 'rgba(255,208,69,1)', 2, 2, 0, [], 0, 0],
        [2, colors[2] || 'rgba(255,208,69,1)', 3, 2, 0, [], 0, 0],
        [2, colors[2] || 'rgba(255,208,69,1)', 3, 2, 0, [], 0, 0],
        [2, colors[2] || 'rgba(255,208,69,1)', 5, 2, 0, [], 0, 0],
        [2, colors[2] || 'rgba(255,208,69,1)', 6, 2, 0, [], 0, 0],
        [2, colors[1] || 'rgba(232,14,14,1)', 2, 2, 0, [], 0, 0],
        [2, colors[1] || 'rgba(232,14,14,1)', 3, 2, 0, [], 0, 0],
        [2, colors[1] || 'rgba(232,14,14,1)', 3, 2, 0, [], 0, 0],
        [2, colors[1] || 'rgba(232,14,14,1)', 5, 2, 0, [], 0, 0],
        [2, colors[1] || 'rgba(232,14,14,1)', 6, 2, 0, [], 0, 0],
        [2, colors[3] || 'rgba(181,0,0,1)', 2, 2, 0, [], 0, 0],
        [2, colors[3] || 'rgba(181,0,0,1)', 3, 2, 0, [], 0, 0],
        [2, colors[3] || 'rgba(181,0,0,1)', 3, 2, 0, [], 0, 0],
        [2, colors[3] || 'rgba(181,0,0,1)', 5, 2, 0, [], 0, 0],
        [2, colors[3] || 'rgba(181,0,0,1)', 6, 2, 0, [], 0, 0],
        [2, 'rgba(255,255,255,1)', 4, 0, 0, [], 0, 0],
        [2, 'rgba(255,255,255,1)', 5.5, 0, 0, [], 0, 0],
        [2, 'rgba(255,255,255,1)', 7, 0, 0, [], 0, 0],
        [2, 'rgba(255,255,255,1)', 8.5, 0, 0, [], 0, 0],
        [2, 'rgba(255,255,255,1)', 10, 0, 0, [], 0, 0]
    ]
};

TrafficLayer.prototype.setColors = function (colors) {
    this.parseColors(colors);
};

TrafficLayer.prototype.initialize = function (map) {
    var me = this;
    if (!this._initialize) {
        this.canvaslayer = new CanvasLayer({
            map: map,
            update: function () {
                me.update(this);
            }
        });
        this._initialize = true;
    }
};

TrafficLayer.prototype.clearCache = function (map) {
    this.cache = {};
};

TrafficLayer.prototype.setMap = function (map) {
    if (map) {
        this.map = map;
        if (this._initialize) {
            this.canvaslayer.show();
        } else {
            this.initialize(map);
        }
    } else {
        this.canvaslayer.hide();
    }
};

TrafficLayer.prototype.draw = function (options) {
    options = options || {};
    if (options.clearCache) {
        this.clearCache();
    }
    if (options.drawTogether) {
        this.drawTogether = true;
    }
    this.update();
};

TrafficLayer.prototype.clear = function () {
    var canvas = this.canvaslayer.canvas;
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = ctx.canvas.width;
    ctx.canvas.height = ctx.canvas.height;
};

TrafficLayer.prototype.update = function (canvaslayer) {
    var map = this.map;
    if (canvaslayer) {
        this.canvaslayer = canvaslayer;
    } else {
        canvaslayer = this.canvaslayer;
    }

    var canvas = canvaslayer.canvas;
    var ctx = canvas.getContext('2d');

    if (!this.drawTogether) {
        this.clear();
    }


    var zoom;
    var levelUnits;

    // 获取当前地图的米/像素单位比例

    if (this.tileType == 'bd09') {
        zoom = Math.round(map.getView().getZoom() + 1);
        this.zoomUnits = Math.pow(2, (18 - zoom));
        levelUnits = this.zoomUnits * 256;
    } else if (this.tileType == 'WGS84') {
        zoom = Math.round(map.getView().getZoom());
        this.zoomUnits = 2 * Math.PI * 6378137 / 256 / Math.pow(2, zoom);
        levelUnits = this.zoomUnits * 256;
    } else {
        zoom = Math.round(map.getView().getZoom());
        this.zoomUnits = Math.pow(2.0, 2 - zoom) * 0.3515625;
        levelUnits = 256 * this.zoomUnits;
    }

    var center = map.getView().getCenter();

    var centerPoint = {
        x: center[0],
        y: center[1]
    };
    var row, column, fromRow, fromColumn, toRow, toColumn;

    var zoomUnits = this.zoomUnits;
    var diffRatio = zoomUnits / this.canvaslayer.resolution;

    var width = map.getSize()[0] / diffRatio;
    var height = map.getSize()[1] / diffRatio;
    if (this.tileType == 'bd09') {
        row = Math.ceil(centerPoint.x / levelUnits);
        column = Math.ceil(centerPoint.y / levelUnits);

        var cell = [
            row, column, (centerPoint.x - row * levelUnits) / levelUnits * this.tileSize,
            (centerPoint.y - column * levelUnits) / levelUnits * this.tileSize
        ];
        fromRow = cell[0] - Math.ceil((width / 2 - cell[2]) / this.tileSize);
        fromColumn = cell[1] - Math.ceil((height / 2 - cell[3]) / this.tileSize);
        toRow = cell[0] + Math.ceil((width / 2 + cell[2]) / this.tileSize);
        toColumn = cell[1] + Math.ceil((height / 2 + cell[3]) / this.tileSize);
    } else if (this.tileType == 'WGS84') {
        width = map.getSize()[0];
        height = map.getSize()[1];
        row = Math.ceil(Math.round((centerPoint.x + 20037508.34) / levelUnits));
        column = Math.ceil(Math.round((20037508.34 - centerPoint.y) / levelUnits));
        fromRow = row - Math.ceil(width / 2 / this.tileSize);
        toRow = row + Math.ceil(width / 2 / this.tileSize);
        fromColumn = column - Math.ceil(height / 2 / this.tileSize);
        toColumn = column + Math.ceil(height / 2 / this.tileSize);
    } else {
        width = map.getSize()[0];
        height = map.getSize()[1];
        row = Math.ceil(Math.round((centerPoint.x + 180.0) / levelUnits));
        column = Math.ceil(Math.round((90.0 - centerPoint.y) / levelUnits));
        fromRow = row - Math.ceil(width / 2 / this.tileSize);
        toRow = row + Math.ceil(width / 2 / this.tileSize);
        fromColumn = column - Math.ceil(height / 2 / this.tileSize);
        toColumn = column + Math.ceil(height / 2 / this.tileSize);
    }


    var tilesOrder = [];
    for (var i = fromRow; i <= toRow; i++) {
        for (var j = fromColumn; j <= toColumn; j++) {
            tilesOrder.push([i, j]);
        }
    }

    this.tilesOrder = tilesOrder;
    this._loadCount = {};

    var size = map.getSize();
    ctx.translate(size[0] * devicePixelRatio * (1 - diffRatio) / 2, size[1] * devicePixelRatio * (1 - diffRatio) / 2);

    //根据屏幕分辨率修改坐标
    ctx.scale(this.ratio * diffRatio, this.ratio * diffRatio);

    /*
    var point = [12957658.47,4829891.26];
    ctx.fillStyle = 'blue';
    var size = map.getSize();
    var px = (point[0] - center[0]) / zoomUnits + size[0] / 2;
    var py = size[1] / 2 - (point[1] - center[1]) / zoomUnits;
    ctx.fillRect(px - 5, py - 5, 10, 10);
    */

    for (var i = 0; i < tilesOrder.length; i++) {
        var x = tilesOrder[i][0];
        var y = tilesOrder[i][1];
        var z = zoom;
        this._loadCount[x + '_' + y + '_' + z] = false;
        this.showTile(x, y, z);
    }
};
TrafficLayer.prototype.lngLatToMerc = function(point){
    if (point === null || point === undefined) {
      return {x: 0, y: 0};
    }

    if (point["lng"] > 180 || point["lng"] < -180 || point["lat"] > 90 || point["lat"] < -90) {
        return {x: 0, y: 0};
    }
    if (this.tileType == 'WGS84') {
        var mercator = {};
        var earthRad = 6378137.0;
        mercator.lng = point.lng * Math.PI / 180 * earthRad;
        var a = point.lat * Math.PI / 180;
        mercator.lat = earthRad / 2 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
        return {x: Number(mercator["lng"].toFixed(2)), y: Number(mercator["lat"].toFixed(2))};
    }
}
TrafficLayer.prototype.isAllLoaded = function () {
    var flag = true;
    for (var key in this._loadCount) {
        if (!this._loadCount[key]) {
            flag = false;
            break;
        }
    }
    return flag;
};

TrafficLayer.prototype.showTile = function (x, y, z) {
    this._parseDataAndDraw(x, y, z);
};

TrafficLayer.prototype.drawCurrentData = function () {
    this.clear();
    var z;
    if (this.tileType == 'bd09') {
        z = Math.round(this.map.getZoom() + 1);
    } else if (this.tileType == 'WGS84') {
        z = Math.round(this.map.getZoom());
    }
    for (var i = 0; i < this.tilesOrder.length; i++) {
        var x = this.tilesOrder[i][0];
        var y = this.tilesOrder[i][1];
        var cacheData = this.cache[this.getCacheKey(x, y, z)];
        if (cacheData) {
            this._drawFeatures(cacheData, x, y);
        }
    }
    this.drawTogether = false;
};

TrafficLayer.prototype.getCacheKey = function (x, y, z) {
    return x + '_' + y + '_' + z;
};

/**
 * 解析并绘制数据
 * y: 行号
 * row: 列号
 */
TrafficLayer.prototype._parseDataAndDraw = function (x, y, z) {
    var me = this;
    var cacheKey = this.getCacheKey(x, y, z);
    // _t代表traffic
    // 生成随机数
    var timeStamp = (Math.random() * 100000).toFixed(0);
    // cbkName = '_t' + parseInt(x + '' + y + '' + z).toString(36),
    var cbkName = '_cbk' + timeStamp;

    if (!window.BMap) {
        window.BMap = {};
    }

    var url = this.getTileUrl(x, y, z, 'BMap.' + cbkName);

    BMap[cbkName] = callback;

    function callback (json) {
        me._loadCount[x + '_' + y + '_' + z] = true;

        // var content = json['content'] && json['content']['tf'];

        // if (json['data']) {
        //     content = json['data'];
        // }

        var content = json['result'] && json['result']['trafficData'];

        if (content) {
            me.cache[cacheKey] = {
                traffic: content,
                precision: json['precision'] || 1
            };
        } else {
            me.cache[cacheKey] = null;
        }

        if (me.drawTogether) {
            me.isAllLoaded() && me.drawCurrentData();
        } else {
            me._drawFeatures(me.cache[cacheKey], x, y);
        }

        delete BMap[cbkName];
    }

    if (me.cache[cacheKey] !== undefined) {
        me._loadCount[x + '_' + y + '_' + z] = true;
        if (me.drawTogether) {
            me.isAllLoaded() && me.drawCurrentData();
        } else {
            me._drawFeatures(me.cache[cacheKey], x, y, z);
        }
    } else {
        this.request(url);
    }

};


TrafficLayer.prototype.getTileUrl = function (x, y, z, cbkName) {
    var trafficURL = this.options.trafficURL || 'http://its.map.baidu.com:8002/traffic/?qt=vtraffic';

    var url = trafficURL
        + '&x=' + x
        + '&y=' + y
        + '&z=' + z
        + '&fn=' + cbkName +'&t='+ new Date().getTime();

    return url;
}

/**
 * 绘制路况数据
 * data: 数据
 * col: 行号
 * row: 列号
 */
TrafficLayer.prototype._drawFeatures = function (json, col, row, z) {
    var canvas = this.canvaslayer.canvas;
    var ctx = canvas.getContext('2d'),
        getRgba = this.getRGBA,
        getLineCap = this.getLineCap,
        getLineJoin = this.getLineJoin,
        p = 10; //精度

    var centerPoint = this.map.getView().getCenter();

    var zoomUnits = this.zoomUnits;
    var diffRatio = zoomUnits / this.canvaslayer.resolution;

    var centerPixX = -centerPoint[0] / zoomUnits,
        centerPixY = centerPoint[1] / zoomUnits,
        centerPosition = [centerPixX, centerPixY];

    if (this.tileType == 'bd09') {
        var posX = col * this.tileSize + centerPosition[0];
        var posY = (-1 - row) * this.tileSize + centerPosition[1];
        posX = this.map.getSize()[0] / 2 + posX;
        posY = this.map.getSize()[1] / 2 + posY;
    } else if (this.tileType == 'WGS84') {
        var halfSize = Math.PI * 6378137;
        var posX = (col * this.tileSize * zoomUnits - halfSize) / zoomUnits + centerPosition[0];
        var posY = centerPosition[1] - (halfSize - row * this.tileSize * zoomUnits) / zoomUnits;
        posX = this.map.getSize()[0] / 2 + posX;
        posY = this.map.getSize()[1] / 2 + posY;
    } else {
        var xHalfSize = 180;
        var yHalfSize = 90;
        var posX = (col * this.tileSize * zoomUnits - xHalfSize) / zoomUnits + centerPosition[0];
        var posY = centerPosition[1] - (yHalfSize - row * this.tileSize * zoomUnits) / zoomUnits;
        posX = this.map.getSize()[0] / 2 + posX;
        posY = this.map.getSize()[1] / 2 + posY;
    }


    ctx.save();

    ctx.translate(posX, posY);

    if (json && json.traffic) {
        var precision = json.precision || 1;
        p = p * precision;

        var data = json.traffic;

        for (var i = 0, l = data.length; i < l; i++){
            var item = data[i],
                scrPts = item[1],
                style0 = this.arrFeatureStyles[item[3]],
                style1 = this.arrFeatureStyles[item[4]],
                x = scrPts[0] / p,
                y = scrPts[1] / p;

            ctx.beginPath();
            ctx.moveTo(x, y);
            for (var j = 2, ll = scrPts.length; j < ll; j += 2) {
                x += scrPts[j] / p;
                y += scrPts[j + 1] / p;
                ctx.lineTo(x, y); // 画线
            }

            //绘制背景色
            ctx.strokeStyle = style0[1];
            if (item[3] >= 15 && item[3] <= 19) {
                ctx.strokeStyle = 'rgba(186, 0, 0, 1)';
            }
            ctx.lineWidth = style0[2];
            ctx.lineCap = getLineCap(style0[3]);
            ctx.lineJoin = getLineJoin(style0[4]);
            ctx.stroke();
            //绘制前景色
            /*
            ctx.strokeStyle = getRgba(style1[1]);
            ctx.lineWidth = style1[2] ;
            ctx.lineCap = getLineCap(style1[3]);
            ctx.lineJoin = getLineJoin(style1[4]);
            ctx.stroke();
            */

        }

    }

    ctx.restore();
};

TrafficLayer.prototype.request = function (url, cbk) {

    if (cbk) {
        // 生成随机数
        var timeStamp = (Math.random() * 100000).toFixed(0);
        // 全局回调函数
        BMap['_rd']['_cbk' + timeStamp] = function (json){
            cbk && cbk(json);
            delete BMap['_rd']['_cbk' + timeStamp];
        };
        url += '&callback=BMap._rd._cbk' + timeStamp;
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.src = url;
    // 脚本加载完成后进行移除
    if (script.addEventListener) {
        script.addEventListener('load', function(e) {
            var t = e.target;
            t.parentNode.removeChild(t);
        }, false);
    } else if (script.attachEvent) {
        script.attachEvent('onreadystatechange', function(e) {
            var t = window.event.srcElement;
            if (t && (t.readyState === 'loaded' || t.readyState === 'complete')) {
                t.parentNode.removeChild(t);
            }
        });
    }

    // 使用setTimeout解决ie6无法发送问题
    setTimeout(function() {
        document.getElementsByTagName('head')[0].appendChild(script);
        script = null;
    }, 1);
};

/**
 * 获取RGBA颜色值
 * nColor: 颜色数值
 */
TrafficLayer.prototype.getRGBA = function (nColor) {
    nColor = nColor >>> 0; //先转化为无符号8位
    var r = (nColor >> 24) & 255,
        g = (nColor >> 16) & 255,
        b = (nColor >> 8) & 255,
        a = (nColor & 255) / 256;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};

/**
 * 获取线帽样式
 * n: 线帽索引值
 */
TrafficLayer.prototype.getLineCap = function (n) {
    return ['butt', 'square', 'round'][n];
};

/**
 * 获取线连接处样式
 * n: 线连接处索引值
 */
TrafficLayer.prototype.getLineJoin = function (n) {
    return ['miter', 'bevel', 'round'][n];
};

export default TrafficLayer;
