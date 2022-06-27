// Source: https://github.com/choraria/google-apps-script/blob/master/Sheets/Webhooks/POST.gs

function doPost(e) {
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

  let { parameters, postData: { contents, type } = {} } = e;
  let response = {};

  if (type === 'text/plain' || type === 'text/html' || type === 'application/xml') {
    response = {
      status: 'error',
      message: `Unsupported data-type: ${type}`
    }
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = activeSpreadsheet.getSheets();

  const activeSheetsAndNewParams = gidHandlerForPost(parameters, activeSpreadsheet, allSheets);
  const activeSheets = activeSheetsAndNewParams.activeSheetNames;
  parameters = activeSheetsAndNewParams.revisedParameters;

  let keys = [];

  if (type === 'application/json') {
    let jsonData;
    try {
      jsonData = JSON.parse(contents);
    } catch (e) {
      response = {
        status: 'error',
        message: 'Invalid JSON format'
      };
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    };

    jsonData = Array.isArray(jsonData) ? jsonData.map(data => flatten(data)) : [flatten(jsonData)];
    keys = Array.isArray(jsonData) ? ((jsonData[0].constructor === Object || jsonData[0].constructor === Array) ? Object.keys(jsonData[0]) : jsonData[0]) : Object.keys(jsonData);
    if (keys.length > 0) {
      activeSheets.forEach(activeSheetName => {
        let activeSheet = activeSpreadsheet.getSheetByName(activeSheetName);
        let headers = activeSheet.getDataRange().offset(0, 0, 1).getValues()[0];
        if (headers.length == 0 || (headers.length == 1 && headers[0].length == 0)) {
          activeSheet.appendRow(keys);
          activeSheet.setFrozenRows(1);
          headers = keys;
        }
        let rowData = []
        jsonData.forEach(rowLevelData => [rowLevelData].map(row => rowData.push(headers.map(key => row[String(key)] || ''))));

        activeSheet.getRange(activeSheet.getLastRow() + 1, 1, rowData.length, rowData[0].length).setValues(rowData);
      });
      response = {
        status: 'success',
        message: 'Data logged successfully'
      };
      lock.releaseLock();
      return ok200Status === true ?
        HtmlService.createHtmlOutput('Data logged successfully').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) :
        ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    } else {
      response = {
        status: 'success',
        message: 'No parameters detected'
      };
      lock.releaseLock();
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    if (parameters) {
      keys = Object.keys(parameters);
      if (keys.length > 0) {
        const cartesianData = cartesian(parameters);
        activeSheets.forEach(activeSheetName => {
          let activeSheet = activeSpreadsheet.getSheetByName(activeSheetName);
          let headers = activeSheet.getDataRange().offset(0, 0, 1).getValues()[0];
          if (headers.length == 0 || (headers.length == 1 && headers[0].length == 0)) {
            activeSheet.appendRow(keys);
            activeSheet.setFrozenRows(1);
            headers = keys;
          }
          let rowData = []
          cartesianData.forEach(rowLevelData => [rowLevelData].map(row => rowData.push(headers.map(key => row[String(key)] || ''))));

          activeSheet.getRange(activeSheet.getLastRow() + 1, 1, rowData.length, rowData[0].length).setValues(rowData);
        });
        response = {
          status: 'success',
          message: 'Data logged successfully'
        };
        lock.releaseLock();
        return ok200Status === true ?
          HtmlService.createHtmlOutput('Data logged successfully').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) :
          ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
      } else {
        response = {
          status: 'success',
          message: 'No parameters detected'
        };
        lock.releaseLock();
        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
}

function gidHandlerForPost(params, activeSpreadsheet, allSheets) {
  let existingSheetIds = [];
  let postDefaultSheet;
  let newParameters = {};
  allSheets.forEach(sheet => existingSheetIds.push(sheet.getSheetId().toString()));

  let defaultWebhookPostSheetId = documentProperties.getProperty('defaultWebhookPostSheetId');
  let newDefaultWebhookPostSheetName = `[POST] Webhook — ${new Date().getTime().toString()}`;

  let checkDefaultOrCreateNewPostSheet = false;

  let keys = Object.keys(params);
  if (keys.includes('gid')) {
    const gidValues = params['gid'];
    const matchingGids = existingSheetIds.filter(sheetId => gidValues.includes(sheetId));
    const nonMatchingGids = gidValues.filter(gid => !matchingGids.includes(gid));
    if (matchingGids.length === 0) {
      checkDefaultOrCreateNewPostSheet = true;
    } else {
      newParameters = params;
      delete newParameters["gid"];
      if (nonMatchingGids.length > 0) {
        newParameters["gid"] = nonMatchingGids;
      }
      if (matchingGids.length === 1) {
        postDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == matchingGids[0]);
        return {
          activeSheetNames: [postDefaultSheet[0].getSheetName()],
          revisedParameters: newParameters,
        };
      } else {
        let validSheetNames = [];
        matchingGids.forEach(gid => {
          postDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == gid);
          if (postDefaultSheet.length !== 0) {
            validSheetNames.push(postDefaultSheet[0].getSheetName())
          }
        });
        return {
          activeSheetNames: validSheetNames,
          revisedParameters: newParameters,
        }
      }
    }
  } else {
    checkDefaultOrCreateNewPostSheet = true;
  }

  if (checkDefaultOrCreateNewPostSheet) {
    if (!defaultWebhookPostSheetId) {
      defaultWebhookPostSheetId = activeSpreadsheet.insertSheet().setName(newDefaultWebhookPostSheetName).getSheetId().toString();
      documentProperties.setProperty('defaultWebhookPostSheetId', defaultWebhookPostSheetId);
      return {
        activeSheetNames: [newDefaultWebhookPostSheetName],
        revisedParameters: params,
      };
    } else {
      postDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == defaultWebhookPostSheetId);
      if (postDefaultSheet.length !== 0) {
        return {
          activeSheetNames: [postDefaultSheet[0].getSheetName()],
          revisedParameters: params,
        };
      } else {
        defaultWebhookPostSheetId = activeSpreadsheet.insertSheet().setName(newDefaultWebhookPostSheetName).getSheetId().toString();
        documentProperties.setProperty('defaultWebhookPostSheetId', defaultWebhookPostSheetId);
        return {
          activeSheetNames: [newDefaultWebhookPostSheetName],
          revisedParameters: params,
        };
      }
    }
  }
}

// https://hawksey.info/blog/2020/04/google-apps-script-patterns-writing-rows-of-data-to-google-sheets-the-v8-way/#Flattening_nested_JSON_and_template_literals
// Based on https://stackoverflow.com/a/54897035/1027723
const flatten = (obj, prefix = '', res = {}) =>
  Object.entries(obj).reduce((r, [key, val]) => {
    const k = `${prefix}${key}`;
    if (typeof val === 'object' && val !== null) {
      flatten(val, `${k}_`, r);
    } else {
      res[k] = val;
    }
    return r;
  }, res);
