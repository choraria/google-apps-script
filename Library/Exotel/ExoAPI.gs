/**
* Google Apps Script library for Exotel APIs - https://developer.exotel.com/api/
*
* @version v1
* @author Sourabh Choraria
* NOT officially maintained by Exotel
* Inspired by Coda.io
*/

/** Private Exotel helper functions. */
var _ = {
  authToken: null,
  tenant: null,
  subdomain: null,
  
  host: 'exotel.com/v1/Accounts/',
  
  ensure: function(value, message) {
    if (!value) {
      throw new Error(message);
    }
  },
  
  ensureAuthenticated: function() {
    _.ensure(_.authToken, 'Call ExoAPI.authenticate() first to set your token.')
  },
  
  getBaseOpts: function() {
    return {
      headers: {
        Authorization: 'Basic ' + _.authToken,
      },
    };
  },
  
  getQueryString: function(params) {
    var output = '';
    for (var param in params) {
      if (typeof params[param] === 'undefined') {
        continue;
      } else if (output) {
        output += '&';
      }      
      output += encodeURIComponent(param);
      output += '=';
      output += encodeURIComponent(params[param]);
    }
    return output ? '?' + output : '';
  }
}

/**
* Sets the required authentication credentials for use by the library.
*
* @param {String} apiKey The API key as per your Exotel dashboard.
* @param {String} apiToken The Token key as per your Exotel dashboard.
* @param {String} accSid The Account Sid of your Exotel account.
* @param {String} cluster The subdomain with the region of your Exotel account.
*/
function authenticate(apiKey, apiToken, accSid, cluster) {
  _.authToken = Utilities.base64Encode(apiKey + ":" + apiToken);
  _.tenant = accSid;
  _.subdomain = cluster;
}

/**
* Returns metadata for the specified telephone number.
*
* @param {String} number The number for which you require metadata.
* @returns {Object} Basic Telephone number metadata.
*/
function metaData(number) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/Numbers/' + number + '.json';    
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/Numbers/' + number + '.json';
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}

/**
* Outgoing call to connect two numbers
*
* @param {String} from The 'From' number which would be connected first.
* @param {String} to The 'To' number which would be connected after the 'From' number has answered the call.
* @param {String} callerID The 'ExoPhone' with which the call would be connected.
* @returns {Object} The response for connecting call for two numbers
*/
function connectTwoNumbers(from, to, callerID) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  opts.method = 'POST';
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/Calls/connect.json?From=' + from + '&To=' + to + '&CallerID=' + callerID;
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/Calls/connect.json?From=' + from + '&To=' + to + '&CallerID=' + callerID;
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}

/**
* Outgoing call to connect number to a call flow
*
* @param {String} from The 'From' number which would be connected first.
* @param {String} callerID The 'ExoPhone' with which the call would be connected.
* @param {String} flowID The 'APP ID' as per Exotel dashboard.
* @returns {Object} The response for connecting call with a call flow
*/
function connectNumberToFlow(from, callerID, flowID) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  opts.method = 'POST';
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/Calls/connect.json?From=' + from + '&CallerID=' + callerID + '&Url=http://my.exotel.com/' + _.tenant + '/exoml/start_voice/' + flowID;
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/Calls/connect.json?From=' + from + '&CallerID=' + callerID + '&Url=http://my.exotel.com/' + _.tenant + '/exoml/start_voice/' + flowID;
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}

/**
* Returns call details for the specified call SID.
*
* @param {String} callSid The SID for which you require call data.
* @returns {Object} Basic CDR of the call.
*/
function callDetails(callSid) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/Calls/' + callSid + '.json';    
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/Calls/' + callSid + '.json';
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}

/**
* Sending an SMS
*
* @param {String} callerID The 'ExoPhone' associated with the 'SenderID' via which you intend to send the SMS.
* @param {String} to The 'To' number to which you intend to send an SMS.
* @param {String} body The 'Approved' SMS template with it's substituted values.
* @returns {Object} The response for sending an SMS.
*/
function sendSMS(callerID, to, body) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  opts.method = 'POST';
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/Sms/send.json?From=' + callerID + '&To=' + to + '&Body=' + body;
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/Sms/send.json?From=' + callerID + '&To=' + to + '&Body=' + body;
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}

/**
* Returns SMS details for the specified SMS SID.
*
* @param {String} smsSid The SID for which you require SMS data.
* @returns {Object} Basic data of that SMS.
*/
function smsDetails(smsSid) {
  _.ensureAuthenticated();
  var opts = _.getBaseOpts();
  if (_.subdomain == '' || _.subdomain == 'undefined' || _.subdomain == null){
    var url = 'https://api.' + _.host + _.tenant + '/SMS/Messages/' + smsSid + '.json';    
  } else {
    var url = 'https://api.' + _.subdomain + '.' + _.host + _.tenant + '/SMS/Messages/' + smsSid + '.json';
  }
  url += _.getQueryString({});
  var response = UrlFetchApp.fetch(url, opts);
  return JSON.parse(response.getContentText());
}
