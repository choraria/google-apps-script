var sheetID = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
var ss = SpreadsheetApp.openById(sheetID)
var date = new Date();
var sheetName = Utilities.formatDate(date, "IST", "MMM-yy");

/* Use this to test different months (change the values at the end of `testDate`)
var testDate = new Date(date.setDate(date.getDate()-400))
var sheetName = Utilities.formatDate(testDate, "IST", "MMM-yy");
*/

function NewMonthNewSheet() {  
  var activeSheet = ss.getSheetByName(sheetName)  
  if (activeSheet == null) {
    activeSheet = ss.insertSheet().setName(sheetName);
    activeSheet.appendRow(["Header 1"])
  } else {
    activeSheet.appendRow(["Normal Data"])
  }
}
