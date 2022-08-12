import { pinyin, customPinyin } from 'pinyin-pro'

customPinyin({
  厦门: 'xiamen'
})

const cityMap = [
  {
    letter: 'B',
    name: '北京市',
    longitude: 116.405285,
    latitude: 39.904989
  },
  {
    letter: 'T',
    name: '天津市',
    longitude: 117.190182,
    latitude: 39.125596
  },
  {
    letter: 'S',
    name: '石家庄市',
    longitude: 114.502461,
    latitude: 38.045474
  },
  {
    letter: 'T',
    name: '唐山市',
    longitude: 118.175393,
    latitude: 39.635113
  },
  {
    letter: 'Q',
    name: '秦皇岛市',
    longitude: 119.586579,
    latitude: 39.942531
  },
  {
    letter: 'H',
    name: '邯郸市',
    longitude: 114.490686,
    latitude: 36.612273
  },
  {
    letter: 'X',
    name: '邢台市',
    longitude: 114.508851,
    latitude: 37.0682
  },
  {
    letter: 'B',
    name: '保定市',
    longitude: 115.482331,
    latitude: 38.867657
  },
  {
    letter: 'Z',
    name: '张家口市',
    longitude: 114.884091,
    latitude: 40.811901
  },
  {
    letter: 'C',
    name: '承德市',
    longitude: 117.939152,
    latitude: 40.976204
  },
  {
    letter: 'C',
    name: '沧州市',
    longitude: 116.857461,
    latitude: 38.310582
  },
  {
    letter: 'L',
    name: '廊坊市',
    longitude: 116.704441,
    latitude: 39.523927
  },
  {
    letter: 'H',
    name: '衡水市',
    longitude: 115.665993,
    latitude: 37.735097
  },
  {
    letter: 'S',
    name: '太原市',
    longitude: 112.549248,
    latitude: 37.857014
  },
  {
    letter: 'D',
    name: '大同市',
    longitude: 113.295259,
    latitude: 40.09031
  },
  {
    letter: 'Y',
    name: '阳泉市',
    longitude: 113.583285,
    latitude: 37.861188
  },
  {
    letter: 'C',
    name: '长治市',
    longitude: 113.113556,
    latitude: 36.191112
  },
  {
    letter: 'J',
    name: '晋城市',
    longitude: 112.851274,
    latitude: 35.497553
  },
  {
    letter: 'S',
    name: '朔州市',
    longitude: 112.433387,
    latitude: 39.331261
  },
  {
    letter: 'J',
    name: '晋中市',
    longitude: 112.736465,
    latitude: 37.696495
  },
  {
    letter: 'Y',
    name: '运城市',
    longitude: 111.003957,
    latitude: 35.022778
  },
  {
    letter: 'X',
    name: '忻州市',
    longitude: 112.733538,
    latitude: 38.41769
  },
  {
    letter: 'L',
    name: '临汾市',
    longitude: 111.517973,
    latitude: 36.08415
  },
  {
    letter: 'L',
    name: '吕梁市',
    longitude: 111.134335,
    latitude: 37.524366
  },
  {
    letter: 'H',
    name: '呼和浩特市',
    longitude: 111.670801,
    latitude: 40.818311
  },
  {
    letter: 'B',
    name: '包头市',
    longitude: 109.840405,
    latitude: 40.658168
  },
  {
    letter: 'W',
    name: '乌海市',
    longitude: 106.825563,
    latitude: 39.673734
  },
  {
    letter: 'C',
    name: '赤峰市',
    longitude: 118.956806,
    latitude: 42.275317
  },
  {
    letter: 'T',
    name: '通辽市',
    longitude: 122.263119,
    latitude: 43.617429
  },
  {
    letter: 'E',
    name: '鄂尔多斯市',
    longitude: 109.99029,
    latitude: 39.817179
  },
  {
    letter: 'H',
    name: '呼伦贝尔市',
    longitude: 119.758168,
    latitude: 49.215333
  },
  {
    letter: 'B',
    name: '巴彦淖尔市',
    longitude: 107.416959,
    latitude: 40.757402
  },
  {
    letter: 'W',
    name: '乌兰察布市',
    longitude: 113.114543,
    latitude: 41.034126
  },
  {
    letter: 'X',
    name: '兴安盟',
    longitude: 122.070317,
    latitude: 46.076268
  },
  {
    letter: 'X',
    name: '锡林郭勒盟',
    longitude: 116.090996,
    latitude: 43.944018
  },
  {
    letter: 'A',
    name: '阿拉善盟',
    longitude: 105.706422,
    latitude: 38.844814
  },
  {
    letter: 'S',
    name: '沈阳市',
    longitude: 123.429096,
    latitude: 41.796767
  },
  {
    letter: 'D',
    name: '大连市',
    longitude: 121.618622,
    latitude: 38.91459
  },
  {
    letter: 'A',
    name: '鞍山市',
    longitude: 122.995632,
    latitude: 41.110626
  },
  {
    letter: 'F',
    name: '抚顺市',
    longitude: 123.921109,
    latitude: 41.875956
  },
  {
    letter: 'B',
    name: '本溪市',
    longitude: 123.770519,
    latitude: 41.297909
  },
  {
    letter: 'D',
    name: '丹东市',
    longitude: 124.383044,
    latitude: 40.124296
  },
  {
    letter: 'J',
    name: '锦州市',
    longitude: 121.135742,
    latitude: 41.119269
  },
  {
    letter: 'Y',
    name: '营口市',
    longitude: 122.235151,
    latitude: 40.667432
  },
  {
    letter: 'F',
    name: '阜新市',
    longitude: 121.648962,
    latitude: 42.011796
  },
  {
    letter: 'L',
    name: '辽阳市',
    longitude: 123.18152,
    latitude: 41.269402
  },
  {
    letter: 'P',
    name: '盘锦市',
    longitude: 122.06957,
    latitude: 41.124484
  },
  {
    letter: 'T',
    name: '铁岭市',
    longitude: 123.844279,
    latitude: 42.290585
  },
  {
    letter: 'C',
    name: '朝阳市',
    longitude: 120.451176,
    latitude: 41.576758
  },
  {
    letter: 'H',
    name: '葫芦岛市',
    longitude: 120.856394,
    latitude: 40.755572
  },
  {
    letter: 'C',
    name: '长春市',
    longitude: 125.3245,
    latitude: 43.886841
  },
  {
    letter: 'J',
    name: '吉林市',
    longitude: 126.55302,
    latitude: 43.843577
  },
  {
    letter: 'S',
    name: '四平市',
    longitude: 124.370785,
    latitude: 43.170344
  },
  {
    letter: 'L',
    name: '辽源市',
    longitude: 125.145349,
    latitude: 42.902692
  },
  {
    letter: 'T',
    name: '通化市',
    longitude: 125.936501,
    latitude: 41.721177
  },
  {
    letter: 'B',
    name: '白山市',
    longitude: 126.427839,
    latitude: 41.942505
  },
  {
    letter: 'S',
    name: '松原市',
    longitude: 124.823608,
    latitude: 45.118243
  },
  {
    letter: 'B',
    name: '白城市',
    longitude: 122.841114,
    latitude: 45.619026
  },
  {
    letter: 'Y',
    name: '延边朝鲜族自治州',
    longitude: 129.513228,
    latitude: 42.904823
  },
  {
    letter: 'H',
    name: '哈尔滨市',
    longitude: 126.642464,
    latitude: 45.756967
  },
  {
    letter: 'Q',
    name: '齐齐哈尔市',
    longitude: 123.95792,
    latitude: 47.342081
  },
  {
    letter: 'J',
    name: '鸡西市',
    longitude: 130.975966,
    latitude: 45.300046
  },
  {
    letter: 'H',
    name: '鹤岗市',
    longitude: 130.277487,
    latitude: 47.332085
  },
  {
    letter: 'S',
    name: '双鸭山市',
    longitude: 131.157304,
    latitude: 46.643442
  },
  {
    letter: 'D',
    name: '大庆市',
    longitude: 125.11272,
    latitude: 46.590734
  },
  {
    letter: 'Y',
    name: '伊春市',
    longitude: 128.899396,
    latitude: 47.724775
  },
  {
    letter: 'J',
    name: '佳木斯市',
    longitude: 130.361634,
    latitude: 46.809606
  },
  {
    letter: 'Q',
    name: '七台河市',
    longitude: 131.015584,
    latitude: 45.771266
  },
  {
    letter: 'M',
    name: '牡丹江市',
    longitude: 129.618602,
    latitude: 44.582962
  },
  {
    letter: 'H',
    name: '黑河市',
    longitude: 127.499023,
    latitude: 50.249585
  },
  {
    letter: 'S',
    name: '绥化市',
    longitude: 126.99293,
    latitude: 46.637393
  },
  {
    letter: 'D',
    name: '大兴安岭地区',
    longitude: 124.711526,
    latitude: 52.335262
  },
  {
    letter: 'S',
    name: '上海市',
    longitude: 121.472644,
    latitude: 31.231706
  },
  {
    letter: 'U',
    name: '南京市',
    longitude: 118.767413,
    latitude: 32.041544
  },
  {
    letter: 'W',
    name: '无锡市',
    longitude: 120.301663,
    latitude: 31.574729
  },
  {
    letter: 'X',
    name: '徐州市',
    longitude: 117.184811,
    latitude: 34.261792
  },
  {
    letter: 'C',
    name: '常州市',
    longitude: 119.946973,
    latitude: 31.772752
  },
  {
    letter: 'S',
    name: '苏州市',
    longitude: 120.619585,
    latitude: 31.299379
  },
  {
    letter: 'U',
    name: '南通市',
    longitude: 120.864608,
    latitude: 32.016212
  },
  {
    letter: 'L',
    name: '连云港市',
    longitude: 119.178821,
    latitude: 34.600018
  },
  {
    letter: 'H',
    name: '淮安市',
    longitude: 119.021265,
    latitude: 33.597506
  },
  {
    letter: 'Y',
    name: '盐城市',
    longitude: 120.139998,
    latitude: 33.377631
  },
  {
    letter: 'Y',
    name: '扬州市',
    longitude: 119.421003,
    latitude: 32.393159
  },
  {
    letter: 'Z',
    name: '镇江市',
    longitude: 119.452753,
    latitude: 32.204402
  },
  {
    letter: 'S',
    name: '泰州市',
    longitude: 119.915176,
    latitude: 32.484882
  },
  {
    letter: 'S',
    name: '宿迁市',
    longitude: 118.275162,
    latitude: 33.963008
  },
  {
    letter: 'H',
    name: '杭州市',
    longitude: 120.153576,
    latitude: 30.287459
  },
  {
    letter: 'U',
    name: '宁波市',
    longitude: 121.549792,
    latitude: 29.868388
  },
  {
    letter: 'W',
    name: '温州市',
    longitude: 120.672111,
    latitude: 28.000575
  },
  {
    letter: 'J',
    name: '嘉兴市',
    longitude: 120.750865,
    latitude: 30.762653
  },
  {
    letter: 'H',
    name: '湖州市',
    longitude: 120.102398,
    latitude: 30.867198
  },
  {
    letter: 'S',
    name: '绍兴市',
    longitude: 120.582112,
    latitude: 29.997117
  },
  {
    letter: 'J',
    name: '金华市',
    longitude: 119.649506,
    latitude: 29.089524
  },
  {
    letter: 'Q',
    name: '衢州市',
    longitude: 118.87263,
    latitude: 28.941708
  },
  {
    letter: 'Z',
    name: '舟山市',
    longitude: 122.106863,
    latitude: 30.016028
  },
  {
    letter: 'S',
    name: '台州市',
    longitude: 121.428599,
    latitude: 28.661378
  },
  {
    letter: 'L',
    name: '丽水市',
    longitude: 119.921786,
    latitude: 28.451993
  },
  {
    letter: 'H',
    name: '合肥市',
    longitude: 117.283042,
    latitude: 31.86119
  },
  {
    letter: 'W',
    name: '芜湖市',
    longitude: 118.376451,
    latitude: 31.326319
  },
  {
    letter: 'B',
    name: '蚌埠市',
    longitude: 117.363228,
    latitude: 32.939667
  },
  {
    letter: 'H',
    name: '淮南市',
    longitude: 117.018329,
    latitude: 32.647574
  },
  {
    letter: 'M',
    name: '马鞍山市',
    longitude: 118.507906,
    latitude: 31.689362
  },
  {
    letter: 'H',
    name: '淮北市',
    longitude: 116.794664,
    latitude: 33.971707
  },
  {
    letter: 'T',
    name: '铜陵市',
    longitude: 117.816576,
    latitude: 30.929935
  },
  {
    letter: 'A',
    name: '安庆市',
    longitude: 117.043551,
    latitude: 30.50883
  },
  {
    letter: 'H',
    name: '黄山市',
    longitude: 118.317325,
    latitude: 29.709239
  },
  {
    letter: 'C',
    name: '滁州市',
    longitude: 118.316264,
    latitude: 32.303627
  },
  {
    letter: 'F',
    name: '阜阳市',
    longitude: 115.819729,
    latitude: 32.896969
  },
  {
    letter: 'S',
    name: '宿州市',
    longitude: 116.984084,
    latitude: 33.633891
  },
  {
    letter: 'L',
    name: '六安市',
    longitude: 116.507676,
    latitude: 31.752889
  },
  {
    letter: 'H',
    name: '亳州市',
    longitude: 115.782939,
    latitude: 33.869338
  },
  {
    letter: 'C',
    name: '池州市',
    longitude: 117.489157,
    latitude: 30.656037
  },
  {
    letter: 'X',
    name: '宣城市',
    longitude: 118.757995,
    latitude: 30.945667
  },
  {
    letter: 'F',
    name: '福州市',
    longitude: 119.306239,
    latitude: 26.075302
  },
  {
    letter: 'xiamen',
    name: '厦门市',
    longitude: 118.11022,
    latitude: 24.490474
  },
  {
    letter: 'P',
    name: '莆田市',
    longitude: 119.007558,
    latitude: 25.431011
  },
  {
    letter: 'S',
    name: '三明市',
    longitude: 117.635001,
    latitude: 26.265444
  },
  {
    letter: 'Q',
    name: '泉州市',
    longitude: 118.589421,
    latitude: 24.908853
  },
  {
    letter: 'Z',
    name: '漳州市',
    longitude: 117.661801,
    latitude: 24.510897
  },
  {
    letter: 'U',
    name: '南平市',
    longitude: 118.178459,
    latitude: 26.635627
  },
  {
    letter: 'L',
    name: '龙岩市',
    longitude: 117.02978,
    latitude: 25.091603
  },
  {
    letter: 'U',
    name: '宁德市',
    longitude: 119.527082,
    latitude: 26.65924
  },
  {
    letter: 'U',
    name: '南昌市',
    longitude: 115.892151,
    latitude: 28.676493
  },
  {
    letter: 'J',
    name: '景德镇市',
    longitude: 117.214664,
    latitude: 29.29256
  },
  {
    letter: 'P',
    name: '萍乡市',
    longitude: 113.852186,
    latitude: 27.622946
  },
  {
    letter: 'J',
    name: '九江市',
    longitude: 115.992811,
    latitude: 29.712034
  },
  {
    letter: 'X',
    name: '新余市',
    longitude: 114.930835,
    latitude: 27.810834
  },
  {
    letter: 'Y',
    name: '鹰潭市',
    longitude: 117.033838,
    latitude: 28.238638
  },
  {
    letter: 'G',
    name: '赣州市',
    longitude: 114.940278,
    latitude: 25.85097
  },
  {
    letter: 'J',
    name: '吉安市',
    longitude: 114.986373,
    latitude: 27.111699
  },
  {
    letter: 'Y',
    name: '宜春市',
    longitude: 114.391136,
    latitude: 27.8043
  },
  {
    letter: 'F',
    name: '抚州市',
    longitude: 116.358351,
    latitude: 27.98385
  },
  {
    letter: 'S',
    name: '上饶市',
    longitude: 117.971185,
    latitude: 28.44442
  },
  {
    letter: 'J',
    name: '济南市',
    longitude: 117.000923,
    latitude: 36.675807
  },
  {
    letter: 'Q',
    name: '青岛市',
    longitude: 120.355173,
    latitude: 36.082982
  },
  {
    letter: 'Z',
    name: '淄博市',
    longitude: 118.047648,
    latitude: 36.814939
  },
  {
    letter: 'Z',
    name: '枣庄市',
    longitude: 117.557964,
    latitude: 34.856424
  },
  {
    letter: 'D',
    name: '东营市',
    longitude: 118.66471,
    latitude: 37.434564
  },
  {
    letter: 'Y',
    name: '烟台市',
    longitude: 121.391382,
    latitude: 37.539297
  },
  {
    letter: 'W',
    name: '潍坊市',
    longitude: 119.107078,
    latitude: 36.70925
  },
  {
    letter: 'J',
    name: '济宁市',
    longitude: 116.587245,
    latitude: 35.415393
  },
  {
    letter: 'S',
    name: '泰安市',
    longitude: 117.129063,
    latitude: 36.194968
  },
  {
    letter: 'W',
    name: '威海市',
    longitude: 122.116394,
    latitude: 37.509691
  },
  {
    letter: 'R',
    name: '日照市',
    longitude: 119.461208,
    latitude: 35.428588
  },
  {
    letter: 'L',
    name: '临沂市',
    longitude: 118.326443,
    latitude: 35.065282
  },
  {
    letter: 'D',
    name: '德州市',
    longitude: 116.307428,
    latitude: 37.453968
  },
  {
    letter: 'L',
    name: '聊城市',
    longitude: 115.980367,
    latitude: 36.456013
  },
  {
    letter: 'B',
    name: '滨州市',
    longitude: 118.016974,
    latitude: 37.383542
  },
  {
    letter: 'H',
    name: '菏泽市',
    longitude: 115.469381,
    latitude: 35.246531
  },
  {
    letter: 'Z',
    name: '郑州市',
    longitude: 113.665412,
    latitude: 34.757975
  },
  {
    letter: 'K',
    name: '开封市',
    longitude: 114.341447,
    latitude: 34.797049
  },
  {
    letter: 'L',
    name: '洛阳市',
    longitude: 112.434468,
    latitude: 34.663041
  },
  {
    letter: 'P',
    name: '平顶山市',
    longitude: 113.307718,
    latitude: 33.735241
  },
  {
    letter: 'A',
    name: '安阳市',
    longitude: 114.352482,
    latitude: 36.103442
  },
  {
    letter: 'H',
    name: '鹤壁市',
    longitude: 114.295444,
    latitude: 35.748236
  },
  {
    letter: 'X',
    name: '新乡市',
    longitude: 113.883991,
    latitude: 35.302616
  },
  {
    letter: 'J',
    name: '焦作市',
    longitude: 113.238266,
    latitude: 35.23904
  },
  {
    letter: 'P',
    name: '濮阳市',
    longitude: 115.041299,
    latitude: 35.768234
  },
  {
    letter: 'X',
    name: '许昌市',
    longitude: 113.826063,
    latitude: 34.022956
  },
  {
    letter: 'L',
    name: '漯河市',
    longitude: 114.026405,
    latitude: 33.575855
  },
  {
    letter: 'S',
    name: '三门峡市',
    longitude: 111.194099,
    latitude: 34.777338
  },
  {
    letter: 'U',
    name: '南阳市',
    longitude: 112.540918,
    latitude: 32.999082
  },
  {
    letter: 'S',
    name: '商丘市',
    longitude: 115.650497,
    latitude: 34.437054
  },
  {
    letter: 'X',
    name: '信阳市',
    longitude: 114.075031,
    latitude: 32.123274
  },
  {
    letter: 'Z',
    name: '周口市',
    longitude: 114.649653,
    latitude: 33.620357
  },
  {
    letter: 'Z',
    name: '驻马店市',
    longitude: 114.024736,
    latitude: 32.980169
  },
  {
    letter: 'J',
    name: '济源市',
    longitude: 112.590047,
    latitude: 35.090378
  },
  {
    letter: 'W',
    name: '武汉市',
    longitude: 114.298572,
    latitude: 30.584355
  },
  {
    letter: 'H',
    name: '黄石市',
    longitude: 115.077048,
    latitude: 30.220074
  },
  {
    letter: 'S',
    name: '十堰市',
    longitude: 110.787916,
    latitude: 32.646907
  },
  {
    letter: 'Y',
    name: '宜昌市',
    longitude: 111.290843,
    latitude: 30.702636
  },
  {
    letter: 'X',
    name: '襄阳市',
    longitude: 112.144146,
    latitude: 32.042426
  },
  {
    letter: 'E',
    name: '鄂州市',
    longitude: 114.890593,
    latitude: 30.396536
  },
  {
    letter: 'J',
    name: '荆门市',
    longitude: 112.204251,
    latitude: 31.03542
  },
  {
    letter: 'X',
    name: '孝感市',
    longitude: 113.926655,
    latitude: 30.926423
  },
  {
    letter: 'J',
    name: '荆州市',
    longitude: 112.23813,
    latitude: 30.326857
  },
  {
    letter: 'H',
    name: '黄冈市',
    longitude: 114.879365,
    latitude: 30.447711
  },
  {
    letter: 'X',
    name: '咸宁市',
    longitude: 114.328963,
    latitude: 29.832798
  },
  {
    letter: 'S',
    name: '随州市',
    longitude: 113.37377,
    latitude: 31.717497
  },
  {
    letter: 'E',
    name: '恩施土家族苗族自治州',
    longitude: 109.48699,
    latitude: 30.283114
  },
  {
    letter: 'X',
    name: '仙桃市',
    longitude: 113.453974,
    latitude: 30.364953
  },
  {
    letter: 'Q',
    name: '潜江市',
    longitude: 112.896866,
    latitude: 30.421215
  },
  {
    letter: 'T',
    name: '天门市',
    longitude: 113.165862,
    latitude: 30.653061
  },
  {
    letter: 'S',
    name: '神农架林区',
    longitude: 110.671525,
    latitude: 31.744449
  },
  {
    letter: 'C',
    name: '长沙市',
    longitude: 112.982279,
    latitude: 28.19409
  },
  {
    letter: 'Z',
    name: '株洲市',
    longitude: 113.151737,
    latitude: 27.835806
  },
  {
    letter: 'X',
    name: '湘潭市',
    longitude: 112.944052,
    latitude: 27.82973
  },
  {
    letter: 'H',
    name: '衡阳市',
    longitude: 112.607693,
    latitude: 26.900358
  },
  {
    letter: 'S',
    name: '邵阳市',
    longitude: 111.46923,
    latitude: 27.237842
  },
  {
    letter: 'Y',
    name: '岳阳市',
    longitude: 113.132855,
    latitude: 29.37029
  },
  {
    letter: 'C',
    name: '常德市',
    longitude: 111.691347,
    latitude: 29.040225
  },
  {
    letter: 'Z',
    name: '张家界市',
    longitude: 110.479921,
    latitude: 29.127401
  },
  {
    letter: 'Y',
    name: '益阳市',
    longitude: 112.355042,
    latitude: 28.570066
  },
  {
    letter: 'C',
    name: '郴州市',
    longitude: 113.032067,
    latitude: 25.793589
  },
  {
    letter: 'Y',
    name: '永州市',
    longitude: 111.608019,
    latitude: 26.434516
  },
  {
    letter: 'H',
    name: '怀化市',
    longitude: 109.97824,
    latitude: 27.550082
  },
  {
    letter: 'L',
    name: '娄底市',
    longitude: 112.008497,
    latitude: 27.728136
  },
  {
    letter: 'X',
    name: '湘西土家族苗族自治州',
    longitude: 109.739735,
    latitude: 28.314296
  },
  {
    letter: 'G',
    name: '广州市',
    longitude: 113.280637,
    latitude: 23.125178
  },
  {
    letter: 'S',
    name: '韶关市',
    longitude: 113.591544,
    latitude: 24.801322
  },
  {
    letter: 'S',
    name: '深圳市',
    longitude: 114.085947,
    latitude: 22.547
  },
  {
    letter: 'Z',
    name: '珠海市',
    longitude: 113.553986,
    latitude: 22.224979
  },
  {
    letter: 'S',
    name: '汕头市',
    longitude: 116.708463,
    latitude: 23.37102
  },
  {
    letter: 'F',
    name: '佛山市',
    longitude: 113.122717,
    latitude: 23.028762
  },
  {
    letter: 'J',
    name: '江门市',
    longitude: 113.094942,
    latitude: 22.590431
  },
  {
    letter: 'Z',
    name: '湛江市',
    longitude: 110.364977,
    latitude: 21.274898
  },
  {
    letter: 'M',
    name: '茂名市',
    longitude: 110.919229,
    latitude: 21.659751
  },
  {
    letter: 'Z',
    name: '肇庆市',
    longitude: 112.472529,
    latitude: 23.051546
  },
  {
    letter: 'H',
    name: '惠州市',
    longitude: 114.412599,
    latitude: 23.079404
  },
  {
    letter: 'M',
    name: '梅州市',
    longitude: 116.117582,
    latitude: 24.299112
  },
  {
    letter: 'S',
    name: '汕尾市',
    longitude: 115.364238,
    latitude: 22.774485
  },
  {
    letter: 'H',
    name: '河源市',
    longitude: 114.697802,
    latitude: 23.746266
  },
  {
    letter: 'Y',
    name: '阳江市',
    longitude: 111.975107,
    latitude: 21.859222
  },
  {
    letter: 'Q',
    name: '清远市',
    longitude: 113.051227,
    latitude: 23.685022
  },
  {
    letter: 'D',
    name: '东莞市',
    longitude: 113.746262,
    latitude: 23.046237
  },
  {
    letter: 'Z',
    name: '中山市',
    longitude: 113.382391,
    latitude: 22.521113
  },
  {
    letter: 'C',
    name: '潮州市',
    longitude: 116.632301,
    latitude: 23.661701
  },
  {
    letter: 'J',
    name: '揭阳市',
    longitude: 116.355733,
    latitude: 23.543778
  },
  {
    letter: 'Y',
    name: '云浮市',
    longitude: 112.044439,
    latitude: 22.929801
  },
  {
    letter: 'U',
    name: '南宁市',
    longitude: 108.320004,
    latitude: 22.82402
  },
  {
    letter: 'L',
    name: '柳州市',
    longitude: 109.411703,
    latitude: 24.314617
  },
  {
    letter: 'G',
    name: '桂林市',
    longitude: 110.299121,
    latitude: 25.274215
  },
  {
    letter: 'W',
    name: '梧州市',
    longitude: 111.297604,
    latitude: 23.474803
  },
  {
    letter: 'B',
    name: '北海市',
    longitude: 109.119254,
    latitude: 21.473343
  },
  {
    letter: 'F',
    name: '防城港市',
    longitude: 108.345478,
    latitude: 21.614631
  },
  {
    letter: 'Q',
    name: '钦州市',
    longitude: 108.624175,
    latitude: 21.967127
  },
  {
    letter: 'G',
    name: '贵港市',
    longitude: 109.602146,
    latitude: 23.0936
  },
  {
    letter: 'Y',
    name: '玉林市',
    longitude: 110.154393,
    latitude: 22.63136
  },
  {
    letter: 'B',
    name: '百色市',
    longitude: 106.616285,
    latitude: 23.897742
  },
  {
    letter: 'H',
    name: '贺州市',
    longitude: 111.552056,
    latitude: 24.414141
  },
  {
    letter: 'H',
    name: '河池市',
    longitude: 108.062105,
    latitude: 24.695899
  },
  {
    letter: 'L',
    name: '来宾市',
    longitude: 109.229772,
    latitude: 23.733766
  },
  {
    letter: 'C',
    name: '崇左市',
    longitude: 107.353926,
    latitude: 22.404108
  },
  {
    letter: 'H',
    name: '海口市',
    longitude: 110.33119,
    latitude: 20.031971
  },
  {
    letter: 'S',
    name: '三亚市',
    longitude: 109.508268,
    latitude: 18.247872
  },
  {
    letter: 'S',
    name: '三沙市',
    longitude: 112.34882,
    latitude: 16.831039
  },
  {
    letter: 'D',
    name: '儋州市',
    longitude: 109.576782,
    latitude: 19.517486
  },
  {
    letter: 'W',
    name: '五指山市',
    longitude: 109.516662,
    latitude: 18.776921
  },
  {
    letter: 'Q',
    name: '琼海市',
    longitude: 110.466785,
    latitude: 19.246011
  },
  {
    letter: 'W',
    name: '文昌市',
    longitude: 110.753975,
    latitude: 19.612986
  },
  {
    letter: 'W',
    name: '万宁市',
    longitude: 110.388793,
    latitude: 18.796216
  },
  {
    letter: 'D',
    name: '东方市',
    longitude: 108.653789,
    latitude: 19.10198
  },
  {
    letter: 'D',
    name: '定安县',
    longitude: 110.349235,
    latitude: 19.684966
  },
  {
    letter: 'T',
    name: '屯昌县',
    longitude: 110.102773,
    latitude: 19.362916
  },
  {
    letter: 'C',
    name: '澄迈县',
    longitude: 110.007147,
    latitude: 19.737095
  },
  {
    letter: 'L',
    name: '临高县',
    longitude: 109.687697,
    latitude: 19.908293
  },
  {
    letter: 'B',
    name: '白沙黎族自治县',
    longitude: 109.452606,
    latitude: 19.224584
  },
  {
    letter: 'C',
    name: '昌江黎族自治县',
    longitude: 109.053351,
    latitude: 19.260968
  },
  {
    letter: 'L',
    name: '乐东黎族自治县',
    longitude: 109.175444,
    latitude: 18.74758
  },
  {
    letter: 'L',
    name: '陵水黎族自治县',
    longitude: 110.037218,
    latitude: 18.505006
  },
  {
    letter: 'B',
    name: '保亭黎族苗族自治县',
    longitude: 109.70245,
    latitude: 18.636371
  },
  {
    letter: 'Q',
    name: '琼中黎族苗族自治县',
    longitude: 109.839996,
    latitude: 19.03557
  },
  {
    letter: 'Z',
    name: '重庆市',
    longitude: 106.504962,
    latitude: 29.533155
  },
  {
    letter: 'C',
    name: '成都市',
    longitude: 104.065735,
    latitude: 30.659462
  },
  {
    letter: 'Z',
    name: '自贡市',
    longitude: 104.773447,
    latitude: 29.352765
  },
  {
    letter: 'P',
    name: '攀枝花市',
    longitude: 101.716007,
    latitude: 26.580446
  },
  {
    letter: 'L',
    name: '泸州市',
    longitude: 105.443348,
    latitude: 28.889138
  },
  {
    letter: 'D',
    name: '德阳市',
    longitude: 104.398651,
    latitude: 31.127991
  },
  {
    letter: 'M',
    name: '绵阳市',
    longitude: 104.741722,
    latitude: 31.46402
  },
  {
    letter: 'G',
    name: '广元市',
    longitude: 105.829757,
    latitude: 32.433668
  },
  {
    letter: 'S',
    name: '遂宁市',
    longitude: 105.571331,
    latitude: 30.513311
  },
  {
    letter: 'U',
    name: '内江市',
    longitude: 105.066138,
    latitude: 29.58708
  },
  {
    letter: 'L',
    name: '乐山市',
    longitude: 103.761263,
    latitude: 29.582024
  },
  {
    letter: 'U',
    name: '南充市',
    longitude: 106.082974,
    latitude: 30.795281
  },
  {
    letter: 'M',
    name: '眉山市',
    longitude: 103.831788,
    latitude: 30.048318
  },
  {
    letter: 'Y',
    name: '宜宾市',
    longitude: 104.630825,
    latitude: 28.760189
  },
  {
    letter: 'G',
    name: '广安市',
    longitude: 106.633369,
    latitude: 30.456398
  },
  {
    letter: 'D',
    name: '达州市',
    longitude: 107.502262,
    latitude: 31.209484
  },
  {
    letter: 'Y',
    name: '雅安市',
    longitude: 103.001033,
    latitude: 29.987722
  },
  {
    letter: 'B',
    name: '巴中市',
    longitude: 106.753669,
    latitude: 31.858809
  },
  {
    letter: 'Z',
    name: '资阳市',
    longitude: 104.641917,
    latitude: 30.122211
  },
  {
    letter: 'A',
    name: '阿坝藏族羌族自治州',
    longitude: 102.221374,
    latitude: 31.899792
  },
  {
    letter: 'G',
    name: '甘孜藏族自治州',
    longitude: 101.963815,
    latitude: 30.050663
  },
  {
    letter: 'L',
    name: '凉山彝族自治州',
    longitude: 102.258746,
    latitude: 27.886762
  },
  {
    letter: 'G',
    name: '贵阳市',
    longitude: 106.713478,
    latitude: 26.578343
  },
  {
    letter: 'L',
    name: '六盘水市',
    longitude: 104.846743,
    latitude: 26.584643
  },
  {
    letter: 'Z',
    name: '遵义市',
    longitude: 106.937265,
    latitude: 27.706626
  },
  {
    letter: 'A',
    name: '安顺市',
    longitude: 105.932188,
    latitude: 26.245544
  },
  {
    letter: 'B',
    name: '毕节市',
    longitude: 105.28501,
    latitude: 27.301693
  },
  {
    letter: 'T',
    name: '铜仁市',
    longitude: 109.191555,
    latitude: 27.718346
  },
  {
    letter: 'Q',
    name: '黔西南布依族苗族自治州',
    longitude: 104.897971,
    latitude: 25.08812
  },
  {
    letter: 'Q',
    name: '黔东南苗族侗族自治州',
    longitude: 107.977488,
    latitude: 26.583352
  },
  {
    letter: 'Q',
    name: '黔南布依族苗族自治州',
    longitude: 107.517156,
    latitude: 26.258219
  },
  {
    letter: 'K',
    name: '昆明市',
    longitude: 102.712251,
    latitude: 25.040609
  },
  {
    letter: 'Q',
    name: '曲靖市',
    longitude: 103.797851,
    latitude: 25.501557
  },
  {
    letter: 'Y',
    name: '玉溪市',
    longitude: 102.543907,
    latitude: 24.350461
  },
  {
    letter: 'B',
    name: '保山市',
    longitude: 99.167133,
    latitude: 25.111802
  },
  {
    letter: 'Z',
    name: '昭通市',
    longitude: 103.717216,
    latitude: 27.336999
  },
  {
    letter: 'L',
    name: '丽江市',
    longitude: 100.233026,
    latitude: 26.872108
  },
  {
    letter: 'P',
    name: '普洱市',
    longitude: 100.972344,
    latitude: 22.777321
  },
  {
    letter: 'L',
    name: '临沧市',
    longitude: 100.08697,
    latitude: 23.886567
  },
  {
    letter: 'C',
    name: '楚雄彝族自治州',
    longitude: 101.546046,
    latitude: 25.041988
  },
  {
    letter: 'H',
    name: '红河哈尼族彝族自治州',
    longitude: 103.384182,
    latitude: 23.366775
  },
  {
    letter: 'W',
    name: '文山壮族苗族自治州',
    longitude: 104.24401,
    latitude: 23.36951
  },
  {
    letter: 'X',
    name: '西双版纳傣族自治州',
    longitude: 100.797941,
    latitude: 22.001724
  },
  {
    letter: 'D',
    name: '大理白族自治州',
    longitude: 100.225668,
    latitude: 25.589449
  },
  {
    letter: 'D',
    name: '德宏傣族景颇族自治州',
    longitude: 98.578363,
    latitude: 24.436694
  },
  {
    letter: 'U',
    name: '怒江傈僳族自治州',
    longitude: 98.854304,
    latitude: 25.850949
  },
  {
    letter: 'D',
    name: '迪庆藏族自治州',
    longitude: 99.706463,
    latitude: 27.826853
  },
  {
    letter: 'L',
    name: '拉萨市',
    longitude: 91.132212,
    latitude: 29.660361
  },
  {
    letter: 'R',
    name: '日喀则市',
    longitude: 88.885148,
    latitude: 29.267519
  },
  {
    letter: 'C',
    name: '昌都市',
    longitude: 97.178452,
    latitude: 31.136875
  },
  {
    letter: 'L',
    name: '林芝市',
    longitude: 94.362348,
    latitude: 29.654693
  },
  {
    letter: 'S',
    name: '山南市',
    longitude: 91.766529,
    latitude: 29.236023
  },
  {
    letter: 'U',
    name: '那曲市',
    longitude: 92.060214,
    latitude: 31.476004
  },
  {
    letter: 'A',
    name: '阿里地区',
    longitude: 80.105498,
    latitude: 32.503187
  },
  {
    letter: 'X',
    name: '西安市',
    longitude: 108.948024,
    latitude: 34.263161
  },
  {
    letter: 'T',
    name: '铜川市',
    longitude: 108.979608,
    latitude: 34.916582
  },
  {
    letter: 'B',
    name: '宝鸡市',
    longitude: 107.14487,
    latitude: 34.369315
  },
  {
    letter: 'X',
    name: '咸阳市',
    longitude: 108.705117,
    latitude: 34.333439
  },
  {
    letter: 'W',
    name: '渭南市',
    longitude: 109.502882,
    latitude: 34.499381
  },
  {
    letter: 'Y',
    name: '延安市',
    longitude: 109.49081,
    latitude: 36.596537
  },
  {
    letter: 'H',
    name: '汉中市',
    longitude: 107.028621,
    latitude: 33.077668
  },
  {
    letter: 'Y',
    name: '榆林市',
    longitude: 109.741193,
    latitude: 38.290162
  },
  {
    letter: 'A',
    name: '安康市',
    longitude: 109.029273,
    latitude: 32.6903
  },
  {
    letter: 'S',
    name: '商洛市',
    longitude: 109.939776,
    latitude: 33.868319
  },
  {
    letter: 'L',
    name: '兰州市',
    longitude: 103.823557,
    latitude: 36.058039
  },
  {
    letter: 'J',
    name: '嘉峪关市',
    longitude: 98.277304,
    latitude: 39.786529
  },
  {
    letter: 'J',
    name: '金昌市',
    longitude: 102.187888,
    latitude: 38.514238
  },
  {
    letter: 'B',
    name: '白银市',
    longitude: 104.173606,
    latitude: 36.54568
  },
  {
    letter: 'T',
    name: '天水市',
    longitude: 105.724998,
    latitude: 34.578529
  },
  {
    letter: 'W',
    name: '武威市',
    longitude: 102.634697,
    latitude: 37.929996
  },
  {
    letter: 'Z',
    name: '张掖市',
    longitude: 100.455472,
    latitude: 38.932897
  },
  {
    letter: 'P',
    name: '平凉市',
    longitude: 106.684691,
    latitude: 35.54279
  },
  {
    letter: 'J',
    name: '酒泉市',
    longitude: 98.510795,
    latitude: 39.744023
  },
  {
    letter: 'Q',
    name: '庆阳市',
    longitude: 107.638372,
    latitude: 35.734218
  },
  {
    letter: 'D',
    name: '定西市',
    longitude: 104.626294,
    latitude: 35.579578
  },
  {
    letter: 'L',
    name: '陇南市',
    longitude: 104.929379,
    latitude: 33.388598
  },
  {
    letter: 'L',
    name: '临夏回族自治州',
    longitude: 103.212006,
    latitude: 35.599446
  },
  {
    letter: 'G',
    name: '甘南藏族自治州',
    longitude: 102.911008,
    latitude: 34.986354
  },
  {
    letter: 'X',
    name: '西宁市',
    longitude: 101.778916,
    latitude: 36.623178
  },
  {
    letter: 'H',
    name: '海东市',
    longitude: 102.10327,
    latitude: 36.502916
  },
  {
    letter: 'H',
    name: '海北藏族自治州',
    longitude: 100.901059,
    latitude: 36.959435
  },
  {
    letter: 'H',
    name: '黄南藏族自治州',
    longitude: 102.019988,
    latitude: 35.517744
  },
  {
    letter: 'H',
    name: '海南藏族自治州',
    longitude: 100.619542,
    latitude: 36.280353
  },
  {
    letter: 'G',
    name: '果洛藏族自治州',
    longitude: 100.242143,
    latitude: 34.4736
  },
  {
    letter: 'Y',
    name: '玉树藏族自治州',
    longitude: 97.008522,
    latitude: 33.004049
  },
  {
    letter: 'H',
    name: '海西蒙古族藏族自治州',
    longitude: 97.370785,
    latitude: 37.374663
  },
  {
    letter: 'Y',
    name: '银川市',
    longitude: 106.278179,
    latitude: 38.46637
  },
  {
    letter: 'S',
    name: '石嘴山市',
    longitude: 106.376173,
    latitude: 39.01333
  },
  {
    letter: 'W',
    name: '吴忠市',
    longitude: 106.199409,
    latitude: 37.986165
  },
  {
    letter: 'G',
    name: '固原市',
    longitude: 106.285241,
    latitude: 36.004561
  },
  {
    letter: 'Z',
    name: '中卫市',
    longitude: 105.189568,
    latitude: 37.514951
  },
  {
    letter: 'W',
    name: '乌鲁木齐市',
    longitude: 87.617733,
    latitude: 43.792818
  },
  {
    letter: 'K',
    name: '克拉玛依市',
    longitude: 84.873946,
    latitude: 45.595886
  },
  {
    letter: 'T',
    name: '吐鲁番市',
    longitude: 89.184078,
    latitude: 42.947613
  },
  {
    letter: 'H',
    name: '哈密市',
    longitude: 93.51316,
    latitude: 42.833248
  },
  {
    letter: 'C',
    name: '昌吉回族自治州',
    longitude: 87.304012,
    latitude: 44.014577
  },
  {
    letter: 'B',
    name: '博尔塔拉蒙古自治州',
    longitude: 82.074778,
    latitude: 44.903258
  },
  {
    letter: 'B',
    name: '巴音郭楞蒙古自治州',
    longitude: 86.150969,
    latitude: 41.768552
  },
  {
    letter: 'A',
    name: '阿克苏地区',
    longitude: 80.265068,
    latitude: 41.170712
  },
  {
    letter: 'K',
    name: '克孜勒苏柯尔克孜自治州',
    longitude: 76.172825,
    latitude: 39.713431
  },
  {
    letter: 'K',
    name: '喀什地区',
    longitude: 75.989138,
    latitude: 39.467664
  },
  {
    letter: 'H',
    name: '和田地区',
    longitude: 79.92533,
    latitude: 37.110687
  },
  {
    letter: 'Y',
    name: '伊犁哈萨克自治州',
    longitude: 81.317946,
    latitude: 43.92186
  },
  {
    letter: 'S',
    name: '塔城地区',
    longitude: 82.985732,
    latitude: 46.746301
  },
  {
    letter: 'A',
    name: '阿勒泰地区',
    longitude: 88.13963,
    latitude: 47.848393
  },
  {
    letter: 'S',
    name: '石河子市',
    longitude: 86.041075,
    latitude: 44.305886
  },
  {
    letter: 'A',
    name: '阿拉尔市',
    longitude: 81.285884,
    latitude: 40.541914
  },
  {
    letter: 'T',
    name: '图木舒克市',
    longitude: 79.077978,
    latitude: 39.867316
  },
  {
    letter: 'W',
    name: '五家渠市',
    longitude: 87.526884,
    latitude: 44.167401
  },
  {
    letter: 'B',
    name: '北屯市',
    longitude: 87.824932,
    latitude: 47.353177
  },
  {
    letter: 'T',
    name: '铁门关市',
    longitude: 85.501218,
    latitude: 41.827251
  },
  {
    letter: 'S',
    name: '双河市',
    longitude: 82.353656,
    latitude: 44.840524
  },
  {
    letter: 'K',
    name: '可克达拉市',
    longitude: 80.63579,
    latitude: 43.6832
  },
  {
    letter: 'K',
    name: '昆玉市',
    longitude: 79.287372,
    latitude: 37.207994
  },
  {
    letter: 'H',
    name: '胡杨河市',
    longitude: 84.8275959,
    latitude: 44.69288853
  },
  {
    letter: 'S',
    name: '台湾省',
    longitude: 121.509062,
    latitude: 25.044332
  },
  {
    letter: 'X',
    name: '香港特别行政区',
    longitude: 114.173355,
    latitude: 22.320048
  },
  {
    letter: 'X',
    name: '香港',
    longitude: 114.173355,
    latitude: 22.320048
  },
  {
    letter: 'A',
    name: '澳门特别行政区',
    longitude: 113.54909,
    latitude: 22.198951
  },
  {
    letter: 'A',
    name: '澳门',
    longitude: 113.54909,
    latitude: 22.198951
  }
]

export const getCenterByCity = (city) => {
  const index = cityMap.findIndex(x => {
    return x.name === city || x.name === `${city}市` ||
      pinyin(x.name.split('市')[0], {
        toneType: 'none',
        type: 'array'
      }).join('') === city.toLowerCase()
  })
  if (index > -1) {
    return [cityMap[index].longitude, cityMap[index].latitude]
  } else {
    return false
  }
}
