/**
 * @author Rohit Salaria
 * @description entry point of constants module
 * @createOn 19-Dec-2018
 */

const https = require('https');
const constants = require('../constants');

class httpsRequest {

  constructor(requestOptions, payload, onCompletion, onError, fallback){
    this.requestOptions = requestOptions;
    this.onCompletion = onCompletion;
    this.onError = onError;
    this.fallback = fallback; 
    this.payload = payload;
    this.requestData = { body : '' };
  }

  _onHttpsRequestCompletion() {
    let requestData = this.requestData;
    if( typeof this.onCompletion  === constants.generalConstants.javaScript.typeOf.function ){
      // onRequestCompletion property exist
      // can perform actions on request completion
      this.onCompletion(requestData, this.fallback);
    }
  }

  _onHttpsError(error){
    if( typeof this.onError  === constants.generalConstants.javaScript.typeOf.function ){
      // onRequestCompletion property exist
      // can perform actions on error
      this.onError(error,  this.fallback);
    }
  }

  sendHttpsRequest() {
      let self = this;
      let httpsRequest = https.request(this.requestOptions, function httpsCallback(response) {
      self.requestData.statusCode = response.statusCode;
      self.requestData.statusMessage = response.statusMessage;
      self.requestData.headers = response.headers;

      response.on('data', function(chunk) {
        self.requestData.body += chunk;
      });
      response.on('end', self._onHttpsRequestCompletion.bind(self));

      response.on('close', self._onHttpsRequestCompletion.bind(self));
    });

    httpsRequest.on('error', self._onHttpsError.bind(self) );

    httpsRequest.end( JSON.stringify(this.payload));
  }
}

module.exports = httpsRequest;