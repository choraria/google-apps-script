var ID = '1I3nhVn_YnyfZHjbjKPIkS_k72Qn8IfXt9mpF26k8bUg';
var ss = SpreadsheetApp.openById(ID);
var sheetName = 'Sheet1';
var activeSheet = ss.getSheetByName(sheetName);

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Index');
}

function getOptions() {
  var rangeValues = activeSheet.getRange(2,1,activeSheet.getLastRow()-1,1).getValues();
  return rangeValues;
}
