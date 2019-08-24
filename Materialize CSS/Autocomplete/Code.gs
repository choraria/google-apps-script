var ID = 'Enter-Your-SpreadSheetID-Here';
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
