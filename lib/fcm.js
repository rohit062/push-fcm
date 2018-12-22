/**
 * @author Rohit Salaria
 * @description entry point of constants module
 * @createOn 19-Dec-2018
 */

const { httpsRequest } = require('../lib');
const constants = require('../constants');

class FCM {

  constructor(serverKey, fcmOpts = {} ){
    this.serverKey = serverKey;
    this.fcmObject = this._initilizeFcmObject( fcmOpts.host, fcmOpts.port, fcmOpts.path, fcmOpts.agent );
    this.retries = 0;
    this.dryRun = fcmOpts.dryRun;
  }

  _initilizeFcmObject(host, port, path, agent) {
    let result = {
      host: host || constants.fcmConstants.fcm.host,
      port: port || constants.fcmConstants.fcm.port,
      path: path || constants.fcmConstants.fcm.path,
      method: constants.fcmConstants.fcm.method,
      headers: {}
    };
    if (agent) {
      result.agent = agent;
    }
    return result;
  }

  _initilizeFcmHeadears(payload){
    if(typeof payload !== constants.generalConstants.javaScript.typeOf.string){
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
    // retry to send the push if you get retry after flag in header
    if((requestResponse.headers["Retry-After"] || requestResponse.statusCode === 503) && this.retries < 3){
      this.retries += 1;
      return setTimeout(() => { this._sendFcmPush(fallback) }, this.retries * 1000);
    }
    if(requestResponse.statusCode === 400){
      return fallback(new Error(requestResponse.body));
    }
    try{
      body = JSON.parse(requestResponse.body);
      return fallback(null, body);
    }catch(exp){
      body = requestResponse.data;
      if (requestResponse.statusCode === 401){
        return fallback(new Error(constants.errorConstants.errorMessages.fcmError.notAuthorizedError));
      }
      return fallback(new Error(constants.errorConstants.errorMessages.fcmError.invalidServerResponse));
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
      if(this.dryRun &&  !this.payload.hasOwnProperty('dry_run') ){
        this.payload.dry_run = true; // set the fcm for test environment to not send push the devices
      }
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

module.exports = FCM;