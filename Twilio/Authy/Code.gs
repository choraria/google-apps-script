var authyKey = 'YourAuthyAPIKeyGoesHere';

var userSession = Session.getTemporaryActiveUserKey();
var userProperties = PropertiesService.getUserProperties();

function addNewUser(formData) {
  var addUserURL = "https://api.authy.com/protected/json/users/new";
  var userPayload = {
    "send_install_link_via_sms": false,
    "user[email]" : formData.email,
    "user[cellphone]" : formData.phoneNumber,
    "user[country_code]" : formData.country
  };
  var addUserOptions = {
    "method" : "POST",
    "payload" : userPayload,
    "muteHttpExceptions": true
  };
  addUserOptions.headers = { 
    "X-Authy-API-Key" : authyKey
  };
  var newUser = UrlFetchApp.fetch(addUserURL, addUserOptions);
  var newUserResponse = newUser.getContentText();
  var userResponse = JSON.parse(newUserResponse);
  if (newUser.getResponseCode() == 200) {
    if (userResponse["success"] == true) {
      var authyID = JSON.stringify(userResponse["user"]["id"]);
      userProperties.setProperty(userSession, authyID);
      var newProperties = {};
      newProperties[authyID] = JSON.stringify({
        userLoggedIn: '',
        pushAuthUuid: ''
      });
      userProperties.setProperties(newProperties);
      return 'Registered Successfully!';
    } else {
      return 'Something went wrong :(';
    }
  } else {
    return 'Something went wrong :(';
  }
}

function verifyTOTP(token) {
  var authyID = userProperties.getProperty(userSession);
  if (authyID !== null) {
    var verifyTOTPURL = "https://api.authy.com/protected/json/verify/" + token + "/" + authyID;
    var varifyTOTPOptions = {
      "method" : "GET",
      "muteHttpExceptions": true
    };
    varifyTOTPOptions.headers = { 
      "X-Authy-API-Key" : authyKey
    };
    var verifyTOTP = UrlFetchApp.fetch(verifyTOTPURL, varifyTOTPOptions);
    var verifyTOTPResponse = verifyTOTP.getContentText();
    var TOTPResponse = JSON.parse(verifyTOTPResponse);  
    if (verifyTOTP.getResponseCode() == 200) {
      if (TOTPResponse["success"] == "true" && TOTPResponse["token"] == "is valid" && TOTPResponse["message"] == "Token is valid.") {
        var updateProperties = JSON.stringify({
          userLoggedIn: true,
          pushAuthUuid: ''
        });
        userProperties.setProperty(authyID, updateProperties);
        return 'Logging you in!';
      } else {
        return 'Something went wrong :(';
      }
    } else {
      return 'Something went wrong :(';
    }
  } else {
    return 'Please sign-up first to login.'
  }
}

function pushAuth() {
  var authyID = userProperties.getProperty(userSession);
  if (authyID !== null) {
    var pushAuthURL = "https://api.authy.com/onetouch/json/users/" + authyID + "/approval_requests";
    var pushAuthPayload = {
      "message": "Login requested from Google Apps Script."
    };
    var pushAuthOptions = {
      "method" : "POST",
      "payload" : pushAuthPayload,
      "muteHttpExceptions": true
    };
    pushAuthOptions.headers = { 
      "X-Authy-API-Key" : authyKey
    };
    var newPushAuthReq = UrlFetchApp.fetch(pushAuthURL, pushAuthOptions);
    var newPushAuthResponse = newPushAuthReq.getContentText();
    var pushAuthResponse = JSON.parse(newPushAuthResponse);
    if (newPushAuthReq.getResponseCode() == 200) {
      if (pushAuthResponse["success"] == true) {
        var pushAuthUuid = pushAuthResponse["approval_request"]["uuid"];
        var updateProperties = JSON.stringify({
          userLoggedIn: '',
          pushAuthUuid: pushAuthUuid
        });
        userProperties.setProperty(authyID, updateProperties);
        return 'Please check your phone...';
      } else {
        return 'Something went wrong :(';
      }
    } else {
      return 'Something went wrong :(';
    }
  } else {
    return 'Please sign-up first to login.'
  }
}

function doGet(e) {
  var htmlFile;
  var title;
  if (loginStatus()) {
    htmlFile = 'Dashboard';
    title = 'Login Using Authy!'
  } else {
    htmlFile = 'Index';
    title = 'Login Using Authy!'    
  }
  return HtmlService.createHtmlOutputFromFile(htmlFile).setTitle(title);
}

function doPost(e) {
  if (JSON.parse(e.postData.contents).callback_action == "approval_request_status") {
    var pushAuthParams = JSON.parse(e.postData.contents);
    var pushAuthCallbackUuid = pushAuthParams.uuid;
    var authyID = pushAuthParams.authy_id;  
    if (JSON.parse(userProperties.getProperty(authyID)).pushAuthUuid == pushAuthCallbackUuid) {
      if (pushAuthParams.status == "approved") {
        var updateProperties = JSON.stringify({
          userLoggedIn: true,
          pushAuthUuid: pushAuthCallbackUuid
        });
        userProperties.setProperty(authyID, updateProperties);
      }
    }
  }
}

function loginStatus() {
  var loginStatus = false;
  var authyID = userProperties.getProperty(userSession);
  if (authyID !== null) {
    var loginStatus = JSON.parse(userProperties.getProperty(authyID)).userLoggedIn;
  }
  return loginStatus;
}

function webAppURL(linkAddr) {
  var linkAddr = ScriptApp.getService().getUrl();
  return linkAddr;
}

function userLogout() {
  var authyID = userProperties.getProperty(userSession);
  if (authyID !== null) {
    userProperties.deleteProperty(authyID);
    userProperties.deleteProperty(userSession)
    return true;
  } else {
    return false;
  }
}
