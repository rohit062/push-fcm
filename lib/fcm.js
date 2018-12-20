/**
 * @author Rohit Salaria
 * @description entry point of constants module
 * @createOn 19-Dec-2018
 */

const { httpsRequest } = require('../lib');

class FCM {

  constructor(serverKey, host, port, path, agent){
    this.serverKey = serverKey;
    this.fcmObject = this._initilizeFcmObject( host, port, path, agent );
    this.retries = 0;
  }

  _initilizeFcmObject(host, port, path, agent) {
    let result = {
      host: host || 'fcm.googleapis.com',
      port: port || 443,
      path: path || '/fcm/send',
      method: 'POST',
      headers: {}
    };
    if (agent) {
      result.agent = agent;
    }
    return result;
  }

  _initilizeFcmHeadears(payload){
    if(typeof payload !== 'string'){
      payload = JSON.stringify(payload);
    }
    let headers = {
      'Host': this.fcmObject.host,
      'Authorization': 'key=' + this.serverKey,
      'Content-Type': 'application/json',
      'Content-Length': new Buffer(payload).length
    };
    return headers;
  }
  _onCompletion(requestResponse, fallback) {
    let body = {};
    if((requestResponse.headers["Retry-After"] || 1) && this.retries < 3){
      this.retries += 1;
      return setTimeout(() => {console.log(this);this._sendFcmPush(fallback)}, this.retries * 1000);
    }
    if(requestResponse.statusCode === 400){
      return fallback(new Error(requestResponse.body));
    }
    try{
      body = JSON.parse(requestResponse.body);
      return fallback(null,body);
    }catch(exp){
      console.log(exp)
      body = requestResponse.data;
      if (requestResponse.statusCode === 401){
        return fallback(new Error("NotAuthorizedError"));
      }
      return fallback(new Error("InvalidServerResponse"));
    }
  }

  _onError(error, fallback){
    // process the error example (log or retry) and then call the fallback function
    return fallback(error);
  }
  _sendFcmPush(fallback){
    new httpsRequest(this.fcmObject, this.payload, this._onCompletion.bind(this), this._onError.bind(this), fallback).sendHttpsRequest();
  }
  send(payload, cb){
    return new Promise( (resolve, reject) => {
      this.payload = payload;
      this.fcmObject.headers = this._initilizeFcmHeadears(payload);
      function _fallback (error, result) {
        if(error){
          return reject(error);
        }
        return resolve(result);
      }
      this._sendFcmPush(cb || _fallback);
    });
  }
}

exports.FCM = FCM;