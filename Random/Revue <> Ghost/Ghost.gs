let [id, secret] = GHOST_ACCESS_TOKEN.split(':');

const GHOST_API = {
  getMembers: function (jwt, nextPage) { // https://ghost.org/docs/admin-api/#members
    let url = `${GHOST_BASE_URL}/admin/members/?fields=email,name,created_at&page=${nextPage ? nextPage : 1}`;
    let options = {
      'method': 'GET',
      'headers': {
        'Authorization': `Ghost ${jwt}`, // https://ghost.org/docs/admin-api/#token-authentication
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
  addMember: function (jwt, email, name) {
    let url = `${GHOST_BASE_URL}/admin/members/`;
    let options = {
      'method': 'POST',
      'headers': {
        'Authorization': `Ghost ${jwt}`, // https://ghost.org/docs/admin-api/#token-authentication
      },
      'muteHttpExceptions': true,
      'contentType': 'application/json',
      'payload': JSON.stringify({
        "members": [
          {
            "email": email,
            "name": name,
          }
        ]
      }),
    }
    let res = UrlFetchApp.fetch(url, options);
    if (res.getResponseCode() === 200 || res.getResponseCode() === 201) {
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

function importGhostMembers(jwt) {
  jwt = jwt ? jwt : createJwt();
  let ghostMembers = GHOST_API.getMembers(jwt);
  if (ghostMembers) {
    let data = [["email", "first_name", "last_name", "created_at"]];
    while (data.length < ghostMembers.meta.pagination.total) {
      ghostMembers.members.forEach(member => {
        let name = member.name ? member.name.split(" ") : null;
        let first_name = name ? name.shift() : '';
        let last_name = name ? name.join(" ") : '';
        data.push([member.email.toLowerCase(), first_name, last_name, member.created_at.replace("T", " ").replace("Z", "")]);
      });
      ghostMembers = GHOST_API.getMembers(jwt, ghostMembers.meta.pagination.next);
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let activeSheet = ss.getSheetByName(GHOST_SHEET_NAME);
    if (!activeSheet) {
      ss.insertSheet().setName(GHOST_SHEET_NAME);
      activeSheet = ss.getSheetByName(GHOST_SHEET_NAME);
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
  } else {
    console.log("GHOST_API.getMembers failed");
  }
  return jwt;
}

function syncWithRevue() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const revueSheet = ss.getSheetByName(REVUE_SHEET_NAME);
  const ghostSheet = ss.getSheetByName(GHOST_SHEET_NAME);
  const revueData = revueSheet.getRange("A2:C").getValues();
  const ghostData = ghostSheet.getRange("A2:C").getValues();
  const revueEmails = revueData.map(cols => cols[0]);
  const ghostEmails = ghostData.map(cols => cols[0]);
  const freshEmails = ghostEmails.filter(email => !revueEmails.includes(email));
  const dataToSync = ghostData.filter(row => freshEmails.includes(row[0]))
  if (dataToSync.length > 0) {
    dataToSync.forEach(row => REVUE_API.addSubscriber(row[0], row[1] === '' ? null : row[1], row[2] === '' ? null : row[2]));
    importRevueList();
  } else {
    console.log("No new emails in Ghost to sync with Revue!");
  }
  return true;
}

function createJwt() { // adopted from https://www.labnol.org/code/json-web-token-201128
  const header = Utilities.base64EncodeWebSafe(JSON.stringify({
    alg: 'HS256',
    kid: id,
    typ: 'JWT'
  })).replace(/=+$/, '');

  const now = Date.now();
  let expires = new Date(now);
  expires.setMinutes(expires.getMinutes() + 5);

  const payload = Utilities.base64EncodeWebSafe(JSON.stringify({
    exp: Math.round(expires.getTime() / 1000),
    iat: Math.round(now / 1000),
    aud: '/v3/admin/'
  })).replace(/=+$/, '');

  // https://gist.github.com/tanaikech/707b2cd2705f665a11b1ceb2febae91e#sample-script
  // Convert hex 'secret' to byte array then base64Encode
  secret = secret
    .match(/.{2}/g)
    .map((e) =>
      parseInt(e[0], 16).toString(2).length == 4
        ? parseInt(e, 16) - 256
        : parseInt(e, 16)
    );

  const toSign = Utilities.newBlob(`${header}.${payload}`).getBytes();
  const signatureBytes = Utilities.computeHmacSha256Signature(toSign, secret);
  const signature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, '');
  const jwt = `${header}.${payload}.${signature}`;
  return jwt;
};
