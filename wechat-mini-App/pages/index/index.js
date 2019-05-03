// pages/iot/dashboard.js
import * as echarts from '../../ec-canvas/echarts';

const app = getApp();
let chart = null;
function initChart(canvas, width, height) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {
    backgroundColor: "#f8f8f8",
    color: ["#37A2DA", "#32C5E9", "#67E0E3"],
    series: [{
      name: '空气质量',
      min: 0,                     // 最小值
      max: 500,   
      splitNumber: 10,  
      type: 'gauge',
      detail: {
        formatter: '{value}'
      },
      axisLine: {
        show: true,
        lineStyle: {
          width: 10,
          shadowBlur: 0,
          color: [
            [0.3, '#67e0e3'],
            [0.7, '#37a2da'],
            [1, '#fd666d']
          ]
        }
      },
      data: [{
        value: 80,
        name:'空气质量'
      }],
      splitLine: {           // 分隔线
        show: true,        // 默认显示，属性show控制显示与否
        length: 13,         // 属性length控制线长
        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
          color: '#aaa',
          width: 2,
          type: 'solid'
        }
      },
      title: {
        show: true,
        offsetCenter: [0, 70],       // x, y，单位px
        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          color: '#333',
          fontSize: 15
        }
      },
      pointer: {
        length: '90%',
        width: 6,
        color: 'auto'
      }

    }]
  };

  chart.setOption(option, true);

  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    "temperature": '',
    "lightRGB": '',
    "humidity": '',
    "lightStatus": '',
    "pm25": '',
    "pm10": '',
    ec: {
      onInit: initChart
    },
    timer:''
  },

  refreshDevice: function () {
    var that = this;
    wx.request({
      url: '替换你的fc的http触发地址',
      method: 'POST',
      data: {
        "deviceName": "设备", "productKey": "产品"
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data)

        wx.hideLoading()
        that.setData({
          temperature: res.data.temperature,
          humidity: res.data.humidity,
          lightStatus: (res.data.lightStatus == 'on' ? '开' : '关'),
          lightRGB: res.data.lightRGB
        })
        if (chart != null){
          let option = chart.getOption();
          option.series[0].data[0].value = res.data.pm25;
          chart.setOption(option);
        }

      }
    })
  },
  switchLight: function () {
    if (this.data.lightStatus == '开'){
      this.sendCommand("off", "black");
    }else{
      this.sendCommand("on", "white");
    }
    
  },
  setRed: function () {
    this.sendCommand("on", "red");
  },
  setGreen: function () {
    this.sendCommand("on", "green");
  },
  setBlue: function () {
    this.sendCommand("on", "blue");
  },
  sendCommand: function (lightStatus,color) {
    wx.showLoading({
      title: '处理中...',
    })
    var that = this;
    wx.request({
      url: '替换你的fc的http触发地址',
      method: 'POST',
      data: {
        "deviceName": "设备", "productKey": "产品", "color": color,
        "lightStatus": lightStatus
      },
      header: {
        'content-type': 'application/json'
      },
      success(res) {
        console.log(res.data)
        that.setDelay()
      }
    })

  },
  setDelay:function() {
    setTimeout(this.refreshDevice, 1000);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      timer: setInterval(this.refreshDevice, 1000)
    })
  },
  onHide: function () {
    clearInterval(this.data.timer)
  }
  
})