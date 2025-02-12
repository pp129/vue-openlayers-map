//基础方法：
//数据线段+开始/结束米数返回新线段lineSpliceByMeter（经纬度二维数组，整线段米数，开始米数，结束米数）
//示例：lineSpliceByMeter([[116.473106,39.847408,0],[116.471657,39.8488,0]],20,40); 在这个线段里找20米开始，40米结束得这一段
//返回：[[20米对应经纬度],[40米对应经纬度]]
import { convertCoordinate } from "@/utils";

//计算2个点的长度
function getDistance(e1, n1, e2, n2) {
  const R = 6371;
  const { sin, cos, asin, PI, hypot } = Math;
  /** 根据经纬度获取点的坐标 */
  let getPoint = (e, n) => {
    e *= PI / 180;
    n *= PI / 180;
    //这里 R* 被去掉, 相当于先求单位圆上两点的距, 最后会再将这个距离放大 R 倍
    return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) };
  };
  let a = getPoint(e1, n1);
  let b = getPoint(e2, n2);
  let c = hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  let r = asin(c / 2) * 2 * R;
  return r * 1000;
}

//计算两点平面角度
function getAngle(lng_a, lat_a, lng_b, lat_b) {
  let a = ((90 - lat_b) * Math.PI) / 180;
  let b = ((90 - lat_a) * Math.PI) / 180;
  let AOC_BOC = ((lng_b - lng_a) * Math.PI) / 180;
  let cosc = Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b) * Math.cos(AOC_BOC);
  let sinc = Math.sqrt(1 - cosc * cosc);
  let sinA = (Math.sin(a) * Math.sin(AOC_BOC)) / sinc;
  let A = (Math.asin(sinA) * 180) / Math.PI;
  let res = 0;
  if (lng_b > lng_a && lat_b > lat_a) res = A;
  else if (lng_b > lng_a && lat_b < lat_a) res = 180 - A;
  else if (lng_b < lng_a && lat_b < lat_a) res = 180 - A;
  else if (lng_b < lng_a && lat_b > lat_a) res = 360 + A;
  else if (lng_b > lng_a && lat_b === lat_a) res = 90;
  else if (lng_b < lng_a && lat_b === lat_a) res = 270;
  else if (lng_b === lng_a && lat_b > lat_a) res = 0;
  else if (lng_b === lng_a && lat_b < lat_a) res = 180;
  return res;
}

export default class GDRouteFix {
  CODELINE = {};
  CODELINE_S = {};
  CODELINE_E = {};
  CODELINE_A = {};

  //1.1：处理路况数据 开始
  TMCLINKARR = [];
  TMCLINKOBJ = [];
  TMCLINKPOBJ = [];

  constructor(features) {
    this.initData(features);
    this.linkRender();
    return this.TMCLINKPOBJ;
  }

  //路况接口路网数据成为OBJ对象（1.2接口）
  initData(linkArr) {
    // console.log("linkArr", linkArr);
    for (let i = 0; i < linkArr.length; i++) {
      const { properties } = linkArr[i];
      const { link_id, coord_list, road_name } = properties;
      this.TMCLINKOBJ[link_id] = {
        ...properties,
        coordList: JSON.parse(coord_list),
        roadName: road_name,
        linkId: link_id,
      };

      //处理1.2的坐标
      let coordsArr = [];
      let coordsArr2 = [];
      for (let x = 0; x < this.TMCLINKOBJ[link_id].coordList.length; x++) {
        //尾点
        const coord = [this.TMCLINKOBJ[link_id].coordList[x], this.TMCLINKOBJ[link_id].coordList[x + 1]];
        coordsArr.push(coord);
        coordsArr2.push(coord);
        x = x + 1;

        //角度赋值
        if (x === 3) {
          this.TMCLINKOBJ[this.TMCLINKOBJ[link_id].linkId].firstAngle = parseInt(
            getAngle(
              this.TMCLINKOBJ[link_id].coordList[x - 3],
              this.TMCLINKOBJ[link_id].coordList[x - 2],
              this.TMCLINKOBJ[link_id].coordList[x - 1],
              this.TMCLINKOBJ[link_id].coordList[x]
            )
          );
        }

        if (x === this.TMCLINKOBJ[link_id].coordList.length - 1) {
          this.TMCLINKOBJ[this.TMCLINKOBJ[link_id].linkId].angle = parseInt(
            getAngle(
              this.TMCLINKOBJ[link_id].coordList[0],
              this.TMCLINKOBJ[link_id].coordList[1],
              this.TMCLINKOBJ[link_id].coordList[x - 1],
              this.TMCLINKOBJ[link_id].coordList[x]
            )
          );
          this.TMCLINKOBJ[this.TMCLINKOBJ[link_id].linkId].lastAngle = parseInt(
            getAngle(
              this.TMCLINKOBJ[link_id].coordList[x - 3],
              this.TMCLINKOBJ[link_id].coordList[x - 2],
              this.TMCLINKOBJ[link_id].coordList[x - 1],
              this.TMCLINKOBJ[link_id].coordList[x]
            )
          );
        }
      }
      console.log(this.TMCLINKOBJ[link_id].coordList);
      //获取一下首尾点
      let length = this.TMCLINKOBJ[link_id].coordList.length;
      const point1 = [this.TMCLINKOBJ[link_id].coordList[0], this.TMCLINKOBJ[link_id].coordList[1]]; //首点
      const point2 = [this.TMCLINKOBJ[link_id].coordList[length - 2], this.TMCLINKOBJ[link_id].coordList[length - 1]]; //尾点

      this.TMCLINKOBJ[link_id].lastPoint = point2;
      this.TMCLINKOBJ[link_id].firstPoint = point1;

      const p2x = point2[0].toFixed(5);
      const p2y = point2[1].toFixed(5);
      const p2str = p2x + "" + p2y;

      const p1x = point1[0].toFixed(5);
      const p1y = point1[1].toFixed(5);
      const p1str = p1x + "" + p1y;

      this.TMCLINKOBJ[link_id].lastPointStr = p2str;
      this.TMCLINKOBJ[link_id].firstPointStr = p1str;

      //充新编一下坐标数组
      this.TMCLINKOBJ[link_id].coordsArr = coordsArr2;

      //给LINK做位置编码，用于链接路口判定
      //结构：X4位小数（10米），Y4位小数（10米），道路等级(可选)，道路等功能(可选)，路名(可选)
      const code1 = point2[0].toFixed(4) + "_" + point2[1].toFixed(4);
      const code2 = code1 + "_" + this.TMCLINKOBJ[link_id].roadclass;

      this.CODELINE[code1] = this.TMCLINKOBJ[link_id];
      this.CODELINE[code2] = this.TMCLINKOBJ[link_id];

      this.CODELINE_A[p1str + "_" + p2str] = this.TMCLINKOBJ[link_id];

      this.TMCLINKARR.push(this.TMCLINKOBJ[link_id]);
    }
  }

  //流程2：绘制TMC道路分段-1.2接口
  linkRender() {
    //2.1绘制所有线段
    // console.log(this.TMCLINKOBJ);
    for (const x in this.TMCLINKOBJ) {
      //计算距离最近得link
      for (let i = 0; i < this.TMCLINKARR.length; i++) {
        const point1 = this.TMCLINKOBJ[x].coordsArr[0];
        const point2 = this.TMCLINKARR[i].coordsArr[this.TMCLINKARR[i].coordsArr.length - 1];

        const d = parseInt(getDistance(point1[0], point1[1], point2[0], point2[1]));
        let e = 0;

        const p1x = point1[0].toFixed(5);
        const p1y = point1[1].toFixed(5);
        const p1str = p1x + "" + p1y;

        const p2x = point2[0].toFixed(5);
        const p2y = point2[1].toFixed(5);
        const p2str = p2x + "" + p2y;

        if (this.TMCLINKARR[i].lastPointStr === p1str) {
          e = 1;
        }

        let aa = 0;
        //LINK头和尾角度
        if (this.TMCLINKOBJ[x].firstAngle <= 30) {
          aa = Math.abs(this.TMCLINKOBJ[x].firstAngle - (this.TMCLINKARR[i].lastAngle - 360));
        }
        if (this.TMCLINKARR[i].lastAngle <= 30) {
          aa = Math.abs(this.TMCLINKOBJ[x].firstAngle - 360 - this.TMCLINKARR[i].lastAngle);
        }
        if (this.TMCLINKARR[i].lastAngle > 30 && this.TMCLINKOBJ[x].firstAngle > 30) {
          aa = Math.abs(this.TMCLINKOBJ[x].firstAngle - this.TMCLINKARR[i].lastAngle);
        }

        let diffaaa = 0;

        //补丁LINK和原始LINK角度
        const aaa = getAngle(point2[0], point2[1], point1[0], point1[1]);
        if (this.TMCLINKOBJ[x].firstAngle <= 30) {
          diffaaa = Math.abs(this.TMCLINKOBJ[x].firstAngle - (aaa - 360));
        }
        if (aaa <= 30) {
          diffaaa = Math.abs(this.TMCLINKOBJ[x].firstAngle - 360 - aaa);
        }
        if (aaa > 30 && this.TMCLINKOBJ[x].firstAngle > 20) {
          diffaaa = Math.abs(this.TMCLINKOBJ[x].firstAngle - aaa);
        }

        let o = 0;

        //距离判定
        if (d > 35) {
          o = 1;
        }

        //补丁线和路网是否有头尾重复线
        if (this.CODELINE_A[p2str + "_" + p1str]) {
          o = 1;
        }

        if (o === 0 && e === 0 && aa <= 15 && diffaaa <= 15) {
          //console.log(d)

          const arr = [
            [point2[0], point2[1]],
            [point1[0], point1[1]],
          ];

          const coords = arr.map((x) => {
            return convertCoordinate(x, "gd-84");
          });
          // console.log(arr);

          // var polyline2 = new AMap.Polyline({
          //   map: mapObj,
          //   path: arr,
          //   zIndex: 100,
          //   strokeColor: "#ff00ff",
          //   strokeOpacity: 1,
          //   outlineColor: "#fff",
          //   isOutline: 0,
          //   strokeWeight: 5,
          //   borderWeight: 1,
          //   showDir: true,
          //   extData: p2str + "_" + p1str,
          // });
          // const polyline = new FeatureExt({
          //   geometry: new LineString([element.position, polylineCenter]),
          // });
          this.TMCLINKPOBJ.push({
            geometry: {
              coordinates: coords,
              type: "LineString",
            },
            properties: this.TMCLINKOBJ[x],
            type: "Feature",
          });
        }
      }
    }
  }
}
