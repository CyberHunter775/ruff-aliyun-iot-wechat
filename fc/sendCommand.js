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
            const topicFullName = body.topicFullName;
            const message = body.message || {};

            const qos = body.qos || 1;


            co(function*() {
                try {
                    // 1.构造iot API
                    // 这里是POP API的Action
                    const action = 'Pub';
                    // 这里是POP API的入参params
                    const params = {
                        ProductKey: productKey,
                        TopicFullName: topicFullName,
                        MessageContent: new Buffer(JSON.stringify(message)).toString('base64'),
                        Qos: qos
                    };
                    //2.发送请求
                    const response = yield iotClient.request(action, params);

                    resp.send(JSON.stringify(response))
                } catch (err) {
                    resp.send(JSON.stringify(err));
                }
            });


        })

    } catch (err) {
        resp.send("err：" + JSON.stringify(err))
    }

};