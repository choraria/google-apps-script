const REVUE_API = {
  listAllLists: function () { // https://www.getrevue.co/api#get-/v2/lists
    let url = `${REVUE_BASE_URL}/v2/lists`;
    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Token ${REVUE_API_KEY}`,
      },
      'muteHttpExceptions': true,
      'contentType': 'application/json',
    };
    let res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
      });
      return false;
    }
  },
  startListExport: function (listId) { // https://www.getrevue.co/api#post-/v2/exports/lists/-id-
    let url = `${REVUE_BASE_URL}/v2/exports/lists/${listId}`;
    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Token ${REVUE_API_KEY}`,
      },
      'muteHttpExceptions': true,
      'contentType': 'application/json',
    };
    let res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
      });
      return false;
    }
  },
  getExport: function (exportId) { // https://www.getrevue.co/api#get-/v2/exports/-id-
    let url = `${REVUE_BASE_URL}/v2/exports/${exportId}`;
    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Token ${REVUE_API_KEY}`,
      },
      'muteHttpExceptions': true,
      'contentType': 'application/json',
    };
    let res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
      });
      return false;
    }
  },
  addSubscriber: function (email, firstName, lastName) { // https://www.getrevue.co/api#post-/v2/subscribers
    let url = `${REVUE_BASE_URL}/v2/subscribers`;
    let options = {
      'method': 'POST',
      'payload': JSON.stringify({
        "email": email,
        "first_name": firstName,
        "last_name": lastName,
        "double_opt_in": false
      }),
      'headers': {
        'Authorization': `Token ${REVUE_API_KEY}`,
      },
      'muteHttpExceptions': true,
      'contentType': 'application/json',
    };
    let res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200) {
      return JSON.parse(res);
    } else {
      console.log({
        responseCode: res.getResponseCode(),
        responseMessage: res.getContentText(),
      });
      return false;
    }
  }
}

function importRevueList() {
  let exportId = scriptProperties.getProperty("exportId");
  let timeTrigger = scriptProperties.getProperty("timeTriggerId");
  if (!exportId) {
    const startExport = REVUE_API.startListExport(REVUE_LIST_ID);
    if (startExport) {
      exportId = startExport.id;
    } else {
      console.log("REVUE_API.startListExport failed");
      return false;
    }
  }
  const exportData = REVUE_API.getExport(exportId);
  if (exportData) {
    const subscribed_url = exportData.subscribed_url;
    if (subscribed_url) {
      if (importData(subscribed_url)) {
        exportId ? scriptProperties.deleteProperty("exportId") : null;
        if (timeTrigger) {
          ScriptApp.getProjectTriggers().filter(trigger => trigger.getUniqueId() === timeTrigger ? ScriptApp.deleteTrigger(trigger) : null)
          scriptProperties.deleteProperty("timeTriggerId");
        }
        continueSync();
      } else {
        console.log("importData(subscribed_url) failed");
        return false;
      }
    } else {
      scriptProperties.setProperty("exportId", exportId);
      if (!timeTrigger) {
        timeTrigger = ScriptApp.newTrigger("importRevueList")
          .timeBased()
          .everyMinutes(1)
          .create()
          .getUniqueId();
        scriptProperties.setProperty("timeTriggerId", timeTrigger);
      }
    }
  } else {
    console.log("REVUE_API.getExport failed");
    return false;
  }
}

function importData(url) {
  const res = UrlFetchApp.fetch(url, { 'muteHttpExceptions': true });
  if (res.getResponseCode() === 200) {
    let data = [];
    res.getContentText().split("\n").forEach(row => data.push(row.split(",")));
    data.pop();
    // const json = data.slice(1, data.length).map(row => data[0].reduce((obj, curr, i) => (obj[curr] = row[i], obj), {}));

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let activeSheet = ss.getSheetByName(REVUE_SHEET_NAME);
    if (!activeSheet) {
      ss.insertSheet().setName(REVUE_SHEET_NAME);
      activeSheet = ss.getSheetByName(REVUE_SHEET_NAME);
      activeSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    } else {
      const headers = activeSheet.getRange("A1:D1").getValues();
      headers.length === 4 ? null : activeSheet.getRange("A1:D1").setValues([["email", "first_name", "last_name", "created_at"]]);
      const emailDataRange = activeSheet.getRange("A2:A");
      let sheetData = [];
      data.slice(1, data.length).forEach(row => !emailDataRange.createTextFinder(row[0]).matchEntireCell(true).findNext() ? sheetData.push(row) : null)
      sheetData.length > 0 ? activeSheet.getRange(activeSheet.getLastRow() + 1, 1, sheetData.length, data[0].length).setValues(sheetData) : null;
      activeSheet.getDataRange().sort({ column: 4, ascending: false });
    }
    activeSheet.setFrozenRows(1);
    activeSheet.getMaxColumns() > 4 ? activeSheet.deleteColumns(5, activeSheet.getMaxColumns() - 5 + 1) : null;
    return true;
  } else {
    console.log({
      responseCode: res.getResponseCode(),
      responseMessage: res.getContentText(),
    });
    return false;
  }
}

function syncWithGhost(jwt) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const revueSheet = ss.getSheetByName(REVUE_SHEET_NAME);
  const ghostSheet = ss.getSheetByName(GHOST_SHEET_NAME);
  const revueData = revueSheet.getRange("A2:C").getValues();
  const ghostData = ghostSheet.getRange("A2:C").getValues();
  const revueEmails = revueData.map(cols => cols[0]);
  const ghostEmails = ghostData.map(cols => cols[0]);
  const freshEmails = revueEmails.filter(email => !ghostEmails.includes(email));
  const dataToSync = revueData.filter(row => freshEmails.includes(row[0]))
  if (dataToSync.length > 0) {
    jwt = jwt ? jwt : createJwt();
    dataToSync.forEach(row => GHOST_API.addMember(jwt, row[0], `${row[1]} ${row[2]}`.trim()));
    importGhostMembers(jwt);
  } else {
    console.log("No new emails in Revue to sync with Ghost!");
  }
  return true;
}
