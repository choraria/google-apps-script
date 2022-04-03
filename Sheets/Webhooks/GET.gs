function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  if (e && e.authMode == ScriptApp.AuthMode.NONE) {
    ui.createMenu('Webhooks')
      .addItem('Authorize', 'authorizeScript')
      .addToUi();
  }
}

function authorizeScript() {
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function doGet(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(28000);
  } catch (e) {
    response = {
      status: 'error',
      message: 'Request throttled'
    }
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
  const params = e.parameter;
  const keys = Object.keys(params);
  let response = {};

  if (keys.length > 0) {
    const ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let headers = ss.getDataRange().offset(0, 0, 1).getValues()[0];

    if (headers.length == 0 || (headers.length == 1 && headers[0].length == 0)) {
      ss.appendRow(keys);
      ss.setFrozenRows(1);
      headers = keys;
    }

    const rowData = [params].map(row => headers.map(key => row[String(key)] || ''));
    ss.getRange(ss.getLastRow() + 1, 1, rowData.length, rowData[0].length).setValues(rowData);

    response = {
      status: 'success',
      message: 'Data logged successfully'
    }
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } else {
    response = {
      status: 'success',
      message: 'No parameters detected'
    }
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
}
