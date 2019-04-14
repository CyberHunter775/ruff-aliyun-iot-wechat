'use strict';
var MQTT = require('aliyun-iot-device-mqtt');

// 设备身份信息
var options = {
    productKey: "a1reIzwVQ5w",
    deviceName: "0UOjUFcMffM7YTjOGiv9",
    deviceSecret: "TvJNw5M1xB8M0NaI35I3eMh88I0oueUs",
    regionId: "cn-shanghai",
};

var updateShadowTopic = "/shadow/update/" + options.productKey + "/" + options.deviceName;
var getShadowTopic = "/shadow/get/" + options.productKey + "/" + options.deviceName;
/*
temperature
humidity
status
rgb
*/
var client = MQTT.createAliyunIotMqttClient(options);

var reported = {
    temperature: 0,
    humidity: 0,
    lightStatus: 'off',
    lightRGB: 'black',
}

$.ready(function(error) {
    if (error) {
        console.log(error);
        return;
    }

    //LCD显示屏
    $('#lcd').turnOn();
    $('#lcd').print('aliyun IoT');

    //10s上报一次
    setInterval(updateShadowData, 60 * 1000);

    client.subscribe(getShadowTopic)
    client.on('message', function(topic, message) {

        message = JSON.parse(message.toString())

        //设备影子的control事件
        if (topic == getShadowTopic && message.method == "control") {
            //{ "lightRGB": "red", "lightStatus": "on" }
            doAction(message.payload.state.desired)
        }

    })


});

$.end(function() {
    $('#lcd').turnOff();
});

//LED控制 { "lightRGB": "red", "lightStatus": "on" }
function doAction(desired) {
    console.log('topic', JSON.stringify(desired));

    if (desired.lightStatus == "on") {

        var rgb = [0xff, 0xff, 0xff];
        reported.lightRGB = 'white';
        if (desired.lightRGB == "red") {
            rgb = [0xFF, 0x00, 0x00];
        } else if (desired.lightRGB == "green") {
            rgb = [0x00, 0x80, 0x00];
        } else if (desired.lightRGB == "blue") {
            rgb = [0x1E, 0x20, 0xFF];
        }

        $('#light').setRGB(rgb, function(error, rgb) {
            if (!error) {
                reported.lightStatus = 'on';
                reported.lightRGB = desired.lightRGB;

                updateShadowData();
            }
        });
    } else {

        $('#light').turnOff(function(error, rgb) {
            if (!error) {
                reported.lightStatus = 'off';
                reported.lightRGB = 'black';

                updateShadowData();
            }
        });
    }

}

//上报温湿度
function updateShadowData() {
    try {
        $('#dht').getTemperature(function(error, temperature) {
        	console.log(error)
            if (!error) {
                reported.temperature = temperature;
            }
        });

        $('#dht').getRelativeHumidity(function(error, humidity) {
        	console.log(error)
            if (!error) {
                reported.humidity = humidity;
            }
        });
    } catch (err) { console.log(err) }

    $('#lcd').clear();
    $('#lcd').setCursor(0, 0);
    $('#lcd').print("T:" + reported.temperature + " C,H:" + reported.humidity + "%");

    $('#lcd').setCursor(0, 1);
    $('#lcd').print("LED:" + reported.lightStatus + ",C:" + reported.lightRGB);

    var data = {
        method: "update",
        state: {
            reported: reported
        },
        version: Date.now() //此处需要在旧version基础上 +1
    }
    console.log('updateShadow', JSON.stringify(data));
    client.publish(updateShadowTopic, JSON.stringify(data));
}