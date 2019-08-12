var sessionUser = Session.getEffectiveUser();
var spreadsheetName = '[DND] Meetings Heatmap - ' + sessionUser;
var sheetName = 'Meetings'
var spreadsheetID;
if(DriveApp.getFilesByName(spreadsheetName).hasNext()) {  
  spreadsheetID = DriveApp.getFilesByName(spreadsheetName).next().getId();
} else {
  spreadsheetID = null;
}
var activeSheet;
if(spreadsheetID !== null) {
  activeSheet = SpreadsheetApp.openById(spreadsheetID).getSheetByName(sheetName);
} else {
  activeSheet = null;
}

function doGet(e) {
  if (Object.keys(e.parameter).length === 0) {  
    var htmlFile;
    var pageTitle;
    if(spreadsheetID !== null && activeSheet !== null) {
      var lastDate = activeSheet.getRange(activeSheet.getLastRow(), 1).getValue();
      var today = new Date();
      var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
      var MILLIS_PER_TWO_DAY = 1000 * 60 * 60 * 24 * 2;
      var yesterday = new Date(new Date().getTime() - MILLIS_PER_DAY)
      var dayBefore = new Date(new Date().getTime() - MILLIS_PER_TWO_DAY)
      if ((lastDate.getDate() == today.getDate() && lastDate.getMonth() == today.getMonth() && lastDate.getFullYear() == today.getFullYear()) || (lastDate.getDate() == yesterday.getDate() && lastDate.getMonth() == yesterday.getMonth() && lastDate.getFullYear() == yesterday.getFullYear()) || (lastDate.getDate() == dayBefore.getDate() && lastDate.getMonth() == dayBefore.getMonth() && lastDate.getFullYear() == dayBefore.getFullYear())) {
        htmlFile = 'Chart';
        pageTitle = 'Meetings Heatmap';
      } else {
        htmlFile = 'Processing';
        pageTitle = 'Data Processing...';
      }
    } else {
      htmlFile = 'Index';
      pageTitle = 'Meetings Heatmap | Index';
    }
  }
  return HtmlService.createHtmlOutputFromFile(htmlFile).setTitle(pageTitle);
}

function getUserInput(formData) {
  var startDate = new Date(formData.startDate);
  calEventsOriginal(startDate);
}

function calEventsOriginal(startDate) {
  if (spreadsheetID == null) {
    var createSpreadsheet = SpreadsheetApp.create(spreadsheetName)
    spreadsheetID = createSpreadsheet.getId();
    activeSheet = SpreadsheetApp.openById(spreadsheetID).insertSheet().setName(sheetName);
    activeSheet.appendRow(['Date', 'Meetings']);
    SpreadsheetApp.openById(spreadsheetID).deleteSheet(SpreadsheetApp.openById(spreadsheetID).getSheetByName('Sheet1'))
    removeEmptyColumns();      
    var startDate = new Date(startDate);
    var today = new Date();
    var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
    var nextDay = new Date(startDate.getTime() + MILLIS_PER_DAY)
    var totalDays = Math.floor((new Date().getTime() - startDate.getTime())/(24*3600*1000))
    for (var i = 0; i < totalDays; i++) {
      if (isTimeUpOriginal_(today)) {
        ScriptApp.newTrigger("getLastDate")
        .timeBased()
        .everyMinutes(1)
        .create();
        break;
      } else {
        if (nextDay < today) {
          var events = CalendarApp.getDefaultCalendar().getEventsForDay(nextDay).length
          activeSheet.appendRow([nextDay, events])
          nextDay = new Date(nextDay.getTime() + MILLIS_PER_DAY)
        }
      }
    }
  }
}

function isTimeUpOriginal_(today) {
  var now = new Date();
  return now.getTime() - today.getTime() > 3000;
}


function isTimeUp_(today) {
  var now = new Date();
  return now.getTime() - today.getTime() > 30000;
}

function getLastDate() {
  var lastDate = activeSheet.getRange(activeSheet.getLastRow(), 1).getValue();
  calEventsRepeat(lastDate)
}

function calEventsRepeat(lastDate) {
  var lastDate = new Date(lastDate);
  var today = new Date();
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var nextDay = new Date(lastDate.getTime() + MILLIS_PER_DAY)
  var totalDays = Math.floor((new Date().getTime() - lastDate.getTime())/(24*3600*1000))
  for (var i = 0; i < totalDays; i++) {  
    if (isTimeUp_(today)) {
      break;
    } else {
      if (nextDay < today) {
        if (nextDay.getDate() == today.getDate() && nextDay.getMonth() == today.getMonth() && nextDay.getFullYear() == today.getFullYear()) {
          var triggers = ScriptApp.getProjectTriggers();
          for (var i = 0; i < triggers.length; i++) {
            ScriptApp.deleteTrigger(triggers[i]);
          }
          ScriptApp.newTrigger("getPreviousDate")
          .timeBased()
          .everyDays(1)
          .create();
          var subject = 'Your Meetings Heatmap Is Ready!'
          var linkAddr = webAppURL(linkAddr);
          var message = 'Please visit the following link to access the visualization -\n' + linkAddr;
          MailApp.sendEmail(sessionUser, subject, message);
          break;
        } else {
          var events = CalendarApp.getDefaultCalendar().getEventsForDay(nextDay).length;
          activeSheet.appendRow([nextDay, events]);
          nextDay = new Date(nextDay.getTime() + MILLIS_PER_DAY);
        }
      }
    }
  }
}

function getPreviousDate() {
  var previousDate = activeSheet.getRange(activeSheet.getLastRow(), 1).getValue();
  calEventsDaily(previousDate);
}

function calEventsDaily(previousDate) {
  var previousDate = new Date(previousDate);
  var today = new Date();
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var nextDay = new Date(previousDate.getTime() + MILLIS_PER_DAY)
  var totalDays = Math.floor((new Date().getTime() - previousDate.getTime())/(24*3600*1000))
  for (var i = 0; i < totalDays; i++) {  
    if (isTimeUp_(today)) {
      break;
    } else {
      if (nextDay < today && nextDay.getDate() !== today.getDate()) {
        var events = CalendarApp.getDefaultCalendar().getEventsForDay(nextDay).length;
        activeSheet.appendRow([nextDay, events]);
        nextDay = new Date(nextDay.getTime() + MILLIS_PER_DAY);
      }
    }
  }
}

function getEvents() {
  var range = activeSheet.getRange(2,1,activeSheet.getLastRow()-1,2);
  var values = range.getValues();
  for(var i=0;i<values.length;i++) {
    values[i][0] = Utilities.formatString('%s/%s/%s',new Date(values[i][0]).getMonth()+1,new Date(values[i][0]).getDate(),new Date(values[i][0]).getFullYear());
  }
  return values;
}

function webAppURL(linkAddr) {
  var linkAddr = ScriptApp.getService().getUrl()
  return linkAddr
}

function removeEmptyColumns() {
  var maxColumns = activeSheet.getMaxColumns(); 
  var lastColumn = activeSheet.getLastColumn();
  if (maxColumns-lastColumn != 0){
    activeSheet.deleteColumns(lastColumn+1, maxColumns-lastColumn);
  }
}

function getLastDateProcessing() {
  var lastDate = activeSheet.getRange(activeSheet.getLastRow(), 1).getValue();
  lastDate = new Date(lastDate)
  return lastDate.toDateString();
}
