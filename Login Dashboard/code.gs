/**//* ======================================================== *//**/
/**/                                                              /**/
/**/   // Make changes only to this segment                       /**/
/**/                                                              /**/
/**/   var ID = "Your-SpreadsheetID-goes-here";                   /**/
/**/   var lock = 'admin'                                         /**/
/**/                                                              /**/
/**//* ======================================================== *//**/

/* ==================== DO NOT CHANGE ANYTHING BELOW THIS LINE  ======================== */

var conf = 'config'
var ss = SpreadsheetApp.openById(ID)

function doGet(e) {
  if (Object.keys(e.parameter).length === 0) {
    var htmlFile
    var sheetName = conf
    var activeSheet = ss.getSheetByName(sheetName)
    if (activeSheet !== null) {
      var values = activeSheet.getDataRange().getValues();
      for(var i=0, iLen=values.length; i<iLen; i++) {
        if(values[i][0] == 'Passcode') {
          var passCheck = activeSheet.getRange(i+1, 2).getValues()
          if(passCheck == lock) {
            htmlFile = 'Dashboard'
            activeSheet.getRange(i+1, 2).clearContent()
          } else {
            htmlFile = 'Login'
          }
        }
      }
    } else {
      config()
      htmlFile = 'Login'
    }
    return HtmlService.createHtmlOutputFromFile(htmlFile);
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

function validateUser(passcode) {
  if (passcode == lock) {
    var successMessage = 'Logging you in!';
    config(passcode)
    return successMessage
  } else {
    var errorMessage = 'Incorrect passcode :(';
    return errorMessage
  }
}

function config(passcode) {
  var sheetName = conf
  var activeSheet = ss.getSheetByName(sheetName)
  if (activeSheet == null) {
    activeSheet = ss.insertSheet().setName(sheetName);
    activeSheet.appendRow (["Config"])
    activeSheet.appendRow (["Lock"])
    activeSheet.appendRow (["Passcode"])
    removeEmptyColumns(sheetName);
    activeSheet.setFrozenRows(1)
    if (passcode !== undefined) {
      var values = activeSheet.getDataRange().getValues();
      var sheetRow;
      for(var i=0, iLen=values.length; i<iLen; i++) {
        if(values[i][0] == 'Passcode') {
          sheetRow = i+1
          activeSheet.getRange(sheetRow, 2).setValue(passcode)
        }
      }
    }
  } else {
    var values = activeSheet.getDataRange().getValues();
    var sheetRow;
    for(var i=0, iLen=values.length; i<iLen; i++) {
      if(values[i][0] == 'Passcode') {
        sheetRow = i+1
        activeSheet.getRange(sheetRow, 2).setValue(passcode)
      }
    }
  }
}

function webAppURL(linkAddr) {
  var linkAddr = ScriptApp.getService().getUrl()
  return linkAddr
}
