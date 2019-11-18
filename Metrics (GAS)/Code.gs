var sheetID = 'Your-Sheet-ID-Goes-Here';

/* ========== DO NOT EDIT BELOW THIS LINE ========== */

var token = ScriptApp.getOAuthToken();
var userProperties = PropertiesService.getUserProperties();
var endPoint = 'https://script.googleapis.com/v1/processes';
var pageSize = 200; // default = 50
var url = endPoint + '?pageSize=' + pageSize;
var headers = {
  'Accept':'application/json',
  'Authorization': 'Bearer ' + token
};
var options = {
  'method': 'GET',
  'headers': headers,
  'muteHttpExceptions': true
}

var ss = SpreadsheetApp.openById(sheetID);
var scriptLog = 'ScriptLog';

function fetchMetrics() {
  var today = new Date();
  var response = getScriptsData(url);
  if (response.turnPage) {
    var nextPageToken = response.data.nextPageToken;
    do {
      if (isTimeUp(today)) {
        var newTimeTrigger = ScriptApp.newTrigger("fetchOldMetrics")
        .timeBased()
        .everyMinutes(10)
        .create();
        userProperties.setProperty('newTimeTrigger', newTimeTrigger.getUniqueId());
        break;
      } else {
        var newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
        var newResponse = getScriptsData(newURL);
        var turnPage = newResponse.turnPage;
        nextPageToken = newResponse.data.nextPageToken;
      }
    }
    while (turnPage);
  }
}

function fetchOldMetrics() {
  var today = new Date();
  var nextPageToken = userProperties.getProperty('nextPageToken');
  var newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
  var response = getScriptsData(newURL);
  if (response.turnPage) {
    var nextPageToken = response.data.nextPageToken;
    do {
      if (isTimeUp(today)) {
        break;
      } else {
        newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
        var newResponse = getScriptsData(newURL);
        var turnPage = newResponse.turnPage;
        nextPageToken = newResponse.data.nextPageToken;
      }
    }
    while (turnPage);
  }
}

function getScriptsData(url) {
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200 ) {
    Logger.log(response);
  }
  
  var data = JSON.parse(response);  
  var processes = data.processes;
  var turnPage = true;
  if (processes !== undefined) {
    var nextPageToken = data.nextPageToken;
    userProperties.setProperty('nextPageToken', nextPageToken);
    logData(processes);
    turnPage = true;
  } else if (JSON.stringify(response) == '{}') {
    turnPage = false;
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
      var currentTimeTrigger = userProperties.getProperty('newTimeTrigger');
      if (triggers[i].getUniqueId() == currentTimeTrigger) {
        ScriptApp.deleteTrigger(triggers[i]);
      }
    }
    schedule();
  } else {
    turnPage = false;
  }
  return {
    "data": data,
    "turnPage": turnPage
  }
}

function logData(processes) {
  var sheetName = scriptLog;
  var activeSheet = ss.getSheetByName(sheetName);
  if (activeSheet == null) {
    activeSheet = ss.insertSheet(sheetName);
    activeSheet.appendRow(
      [
        "TriggerHash",
        "ProjectName",
        "FunctionName",
        "ProcessType",
        "ProcessStatus",
        "UserAccessLevel",
        "StartTime",
        "Duration"
      ]
    );
    activeSheet.setFrozenRows(1);
    try {
      ss.deleteSheet(ss.getSheetByName('Sheet1'))
    } catch (sheetErr) {
      Logger.log(sheetErr);
    }
    removeEmptyColumns(sheetName);
    logDataHelper(processes);
  } else {
    logDataHelper(processes);
  }
}

function logDataHelper(processes) {
  var sheetName = scriptLog;
  var activeSheet = ss.getSheetByName(sheetName);  
  for (var i = 0; i < processes.length; i++) {
    var process = processes[i];
    var projectName = process.projectName;
    var functionName = process.functionName;
    var processType = process.processType;
    var processStatus = process.processStatus;
    var userAccessLevel = process.userAccessLevel;
    var startTime = process.startTime;
    var duration = process.duration;
    var hashInput = projectName + functionName + processType + processStatus + userAccessLevel + startTime + duration;
    var triggerHash = MD5(hashInput);
    if (projectName !== 'undefined' && functionName !== 'undefined' && processType !== 'undefined' && userAccessLevel !== 'undefined') {
      activeSheet.appendRow(
        [
          triggerHash,
          projectName,
          functionName,
          processType,
          processStatus,
          userAccessLevel,
          Utilities.formatDate(new Date(startTime), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss"),
          duration.replace("s","")
        ]
      );
    }
  }  
}

function schedule() {
  ScriptApp.newTrigger("fetchFreshMetrics")
  .timeBased()
  .everyMinutes(10)
  .create();
}

function fetchFreshMetrics() {
  var today = new Date();
  var response = getNewScriptsData(url);
  if (response.turnPage) {
    var nextPageToken = response.data.nextPageToken;
    do {
      if (isTimeUp(today)) {
        var newTimeTriggerFresh = ScriptApp.newTrigger("fetchFreshMetricsCont")
        .timeBased()
        .everyMinutes(10)
        .create();
        userProperties.setProperty('newTimeTriggerFresh', newTimeTriggerFresh.getUniqueId());
        break;
      } else {
        var newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
        var newResponse = getNewScriptsData(newURL);
        var turnPage = newResponse.turnPage;
        nextPageToken = newResponse.data.nextPageToken;
      }
    } while (turnPage);
  }
}

function fetchFreshMetricsCont() {
  var today = new Date();
  var nextPageToken = userProperties.getProperty('nextTempPageToken');
  var newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
  var response = getNewScriptsData(newURL);
  if (response.turnPage) {
    var nextPageToken = response.data.nextPageToken;
    do {
      if (isTimeUp(today)) {
        break;
      } else {
        newURL = url + '&pageToken=' + encodeURIComponent(nextPageToken);
        var newResponse = getNewScriptsData(newURL);
        var turnPage = newResponse.turnPage;
        nextPageToken = newResponse.data.nextPageToken;
      }
    } while (turnPage);
  }
}

function getNewScriptsData(url) {
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200 ) {
    Logger.log(response);
  }  
  var data = JSON.parse(response);  
  var processes = data.processes;
  var turnPage = true;
  if (processes !== undefined) {
    var nextPageToken = data.nextPageToken;
    userProperties.setProperty('nextTempPageToken', nextPageToken);
    if (logFreshData(processes)) {
      turnPage = true;
    } else {
      turnPage = false;
    }
  } else {
    turnPage = false;
  }
  return {
    "data": data,
    "turnPage": turnPage
  }
}

function logFreshData(processes) {
  var sheetName = scriptLog;
  var activeSheet = ss.getSheetByName(sheetName);
  var hashValues = activeSheet.getRange(2,1,activeSheet.getLastRow()-1,1).getValues().toString();
  for (var i = 0; i < processes.length; i++) {
    var process = processes[i];
    var projectName = process.projectName;
    var functionName = process.functionName;
    var processType = process.processType;
    var processStatus = process.processStatus;
    var userAccessLevel = process.userAccessLevel;
    var startTime = process.startTime;
    var duration = process.duration;
    var hashInput = projectName + functionName + processType + processStatus + userAccessLevel + startTime + duration;
    var triggerHash = MD5(hashInput);
    var terminateFunction = true;
    if (hashValues.indexOf(triggerHash) == -1) {
      if (projectName !== 'undefined' && functionName !== 'undefined' && processType !== 'undefined' && userAccessLevel !== 'undefined') {
        activeSheet.appendRow(
          [
            triggerHash,
            projectName,
            functionName,
            processType,
            processStatus,
            userAccessLevel,
            Utilities.formatDate(new Date(startTime), Session.getScriptTimeZone(), "MM/dd/yyyy HH:mm:ss"),
            duration.replace("s","")
          ]
        );
        terminateFunction = false;
      }
    } else {
      var triggers = ScriptApp.getProjectTriggers();
      for (var j = 0; j < triggers.length; j++) {
        var timeTriggerCont = userProperties.getProperty('newTimeTriggerFresh');
        if (triggers[j].getUniqueId() == timeTriggerCont) {
          ScriptApp.deleteTrigger(triggers[j]);
        }
      }
      terminateFunction = true;
      break;
    }
  }
  if (terminateFunction) {
    return false;
  } else {
    return true;
  }
}

function removeEmptyColumns(sheetName) {
  var activeSheet = ss.getSheetByName(sheetName)
  var maxColumns = activeSheet.getMaxColumns(); 
  var lastColumn = activeSheet.getLastColumn();
  if (maxColumns-lastColumn != 0){
    activeSheet.deleteColumns(lastColumn+1, maxColumns-lastColumn);
  }
}

function isTimeUp(today) {
  var now = new Date();
  return now.getTime() - today.getTime() > 240000; // timeout at 4 mins.
}
