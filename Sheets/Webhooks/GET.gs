// Source: https://github.com/choraria/google-apps-script/blob/master/Sheets/Webhooks/GET.gs

const documentProperties = PropertiesService.getDocumentProperties();
let ok200Status = '%200OKSTATUS%'; // replace '%200OKSTATUS%' from the add-on to either `true` or `false` (boolean)
let logTimeStamp = '%LOGTIMESTAMP%'; // replace '%LOGTIMESTAMP%' from the add-on to either `true` or `false` (boolean)

function onOpen(e) {
  if (documentProperties.getProperty('Authorized') !== 'true') {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Webhooks')
      .addItem('Authorize', 'authorizeScript')
      .addToUi();
  }
}

function authorizeScript() {
  SpreadsheetApp.getActiveSpreadsheet().toast('Authorization successful.', "🪝 Webhooks for Sheets");
  documentProperties.setProperty('Authorized', 'true');
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

  let params = e.parameters;

  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = activeSpreadsheet.getSheets();

  const activeSheetsAndNewParams = gidHandlerForGet(params, activeSpreadsheet, allSheets);
  const activeSheets = activeSheetsAndNewParams.activeSheetNames;
  params = activeSheetsAndNewParams.revisedParameters;

  let keys = Object.keys(params);
  let response = {};

  if (keys.length > 0) {
    logTimeStamp === true ? params["timestamp_incoming_webhook"] = [new Date()] : null;
    keys = Object.keys(params);
    const cartesianData = cartesian(params);

    activeSheets.forEach(activeSheetName => {
      let activeSheet = activeSpreadsheet.getSheetByName(activeSheetName);
      let headers = activeSheet.getDataRange().offset(0, 0, 1).getValues()[0];
      if (headers.length == 0 || (headers.length == 1 && headers[0].length == 0)) {
        activeSheet.appendRow(keys);
        activeSheet.setFrozenRows(1);
        if (logTimeStamp === true) {
          activeSheet.moveColumns(activeSheet.getRange(1, keys.indexOf("timestamp_incoming_webhook") + 1), 1);
          SpreadsheetApp.flush();
          activeSheet.getRange("A:A").setNumberFormat('dd/MM/yyyy HH:mm:ss');
          headers = activeSheet.getDataRange().offset(0, 0, 1).getValues()[0];
        } else {
          headers = keys;
        }
      }

      let rowData = [];
      cartesianData.forEach(rowLevelData => [rowLevelData].map(row => rowData.push(headers.map(key => row[String(key)] || ''))));
      activeSheet.getRange(activeSheet.getLastRow() + 1, 1, rowData.length, rowData[0].length).setValues(rowData);
    })

    response = {
      status: 'success',
      message: 'Data logged successfully'
    }
    lock.releaseLock();
    return ok200Status === true ?
      HtmlService.createHtmlOutput('Data logged successfully').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL) :
      ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  } else {
    response = {
      status: 'success',
      message: 'No parameters detected'
    }
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
  }
}

function gidHandlerForGet(params, activeSpreadsheet, allSheets) {
  let existingSheetIds = [];
  let getDefaultSheet;
  let newParameters = {};
  allSheets.forEach(sheet => existingSheetIds.push(sheet.getSheetId().toString()));

  let defaultWebhookGetSheetId = documentProperties.getProperty('defaultWebhookGetSheetId');
  let newDefaultWebhookGetSheetName = `[GET] Webhook — ${new Date().getTime().toString()}`;

  let checkDefaultOrCreateNewGetSheet = false;

  let keys = Object.keys(params);
  if (keys.includes('gid')) {
    const gidValues = params['gid'];
    const matchingGids = existingSheetIds.filter(sheetId => gidValues.includes(sheetId));
    const nonMatchingGids = gidValues.filter(gid => !matchingGids.includes(gid));
    if (matchingGids.length === 0) {
      checkDefaultOrCreateNewGetSheet = true;
    } else {
      newParameters = params;
      delete newParameters["gid"];
      if (nonMatchingGids.length > 0) {
        newParameters["gid"] = nonMatchingGids;
      }
      if (matchingGids.length === 1) {
        getDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == matchingGids[0]);
        return {
          activeSheetNames: [getDefaultSheet[0].getSheetName()],
          revisedParameters: newParameters,
        };
      } else {
        let validSheetNames = [];
        matchingGids.forEach(gid => {
          getDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == gid);
          if (getDefaultSheet.length !== 0) {
            validSheetNames.push(getDefaultSheet[0].getSheetName())
          }
        });
        return {
          activeSheetNames: validSheetNames,
          revisedParameters: newParameters,
        }
      }
    }
  } else {
    checkDefaultOrCreateNewGetSheet = true;
  }

  if (checkDefaultOrCreateNewGetSheet) {
    if (!defaultWebhookGetSheetId) {
      defaultWebhookGetSheetId = activeSpreadsheet.insertSheet().setName(newDefaultWebhookGetSheetName).getSheetId().toString();
      documentProperties.setProperty('defaultWebhookGetSheetId', defaultWebhookGetSheetId);
      return {
        activeSheetNames: [newDefaultWebhookGetSheetName],
        revisedParameters: params,
      };
    } else {
      getDefaultSheet = allSheets.filter(sheet => sheet.getSheetId() == defaultWebhookGetSheetId);
      if (getDefaultSheet.length !== 0) {
        return {
          activeSheetNames: [getDefaultSheet[0].getSheetName()],
          revisedParameters: params,
        };
      } else {
        defaultWebhookGetSheetId = activeSpreadsheet.insertSheet().setName(newDefaultWebhookGetSheetName).getSheetId().toString();
        documentProperties.setProperty('defaultWebhookGetSheetId', defaultWebhookGetSheetId);
        return {
          activeSheetNames: [newDefaultWebhookGetSheetName],
          revisedParameters: params,
        };
      }
    }
  }
}

function cartesian(parameters) {
  let keys = Object.keys(parameters);
  let depth = Object.values(parameters).reduce((product, { length }) => product * length, 1);
  let result = [];
  for (let i = 0; i < depth; i++) {
    let j = i;
    let dict = {};
    for (let key of keys) {
      let size = parameters[key].length;
      dict[key] = parameters[key][j % size];
      j = Math.floor(j / size);
    }
    result.push(dict);
  }
  return result;
}
