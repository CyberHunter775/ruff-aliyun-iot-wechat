const getRawBody = require('raw-body');

const co = require('co');
const RPCClient = require('@alicloud/pop-core').RPCClient;

const options = {
    accessKey: "替换accessKey",
    accessKeySecret: "替换accessKeySecret",
};
//1.创建client
const iotClient = new RPCClient({
    accessKeyId: options.accessKey,
    secretAccessKey: options.accessKeySecret,
    endpoint: options.endpoint || 'https://iot.cn-shanghai.aliyuncs.com',
    apiVersion: options.apiVersion || '2018-01-20'
});
// 

module.exports.handler = function(req, resp, context) {

    try {
        getRawBody(req, function(err, body) {
            if (err) {
                resp.send(JSON.stringify(err))
                return;
            }
            body = JSON.parse(decodeURIComponent(body.toString()))

            const productKey = body.productKey;
            const deviceName = body.deviceName;

            const qos = body.qos || 1;


            co(function*() {
                try {
                    // 2.构造iot API
                    // 这里是POP API的Action
                    const action = 'GetDeviceShadow';
                    // 这里是POP API的入参params

                    const params = {
                        ProductKey: productKey,
                        DeviceName: deviceName
                    };

                    //2.发送请求
                    const response = yield iotClient.request(action, params);
                    const ShadowMessage = JSON.parse(response.ShadowMessage)
                    resp.send(JSON.stringify(ShadowMessage.state.reported))
                } catch (err) {
                    resp.send(JSON.stringify(err));
                }
            });


        })

    } catch (err) {
        resp.send("err：" + JSON.stringify(err))
    }

};