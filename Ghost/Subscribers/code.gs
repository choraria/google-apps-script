/**//* ======================================================== *//**/
/**/                                                              /**/
/**/   // Make changes only to this segment                       /**/
/**/                                                              /**/
/**/ var sheetID = "Enter-Your-Sheet-ID";                         /**/
/**/ var timeZone = "IST";                                        /**/
/**/                                                              /**/
/**//* ======================================================== *//**/


/* ==================== DO NOT CHANGE ANYTHING BELOW THIS LINE  ======================== */


var ss = SpreadsheetApp.openById(sheetID);
var subscribers = "subscribers"
var sheetName;

function doPost(e) {
  if (JSON.parse(e.postData.contents).subscriber.previous.id == undefined) {
    return addSubscriber(e)
  } else if (JSON.parse(e.postData.contents).subscriber.current.id == undefined) {
    return deleteSubscriber(e)
  }
}

function addSubscriber(e) {
  var params = JSON.parse(e.postData.contents).subscriber.current
  var id = params.id
  var email = params.email
  var status = params.status
  var subscribed_url = params.subscribed_url
  var subscribed_referrer = params.subscribed_referrer
  var created_at = params.created_at
  created_at = Utilities.formatDate(new Date(created_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  var updated_at = params.updated_at
  updated_at = Utilities.formatDate(new Date(updated_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  var name = params.name
  var post_id = params.post_id
  var unsubscribed_url = params.unsubscribed_url
  var unsubscribed_at = params.unsubscribed_at
  if (unsubscribed_at == null) {
    unsubscribed_at = null
  } else {
    unsubscribed_at = Utilities.formatDate(new Date(unsubscribed_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  }
  var state = true
  sheetName = subscribers;
  var activeSheet = ss.getSheetByName(sheetName);  
  if (activeSheet == null) {
    activeSheet = ss.insertSheet().setName(sheetName);
    activeSheet.appendRow (
      [
        "id",
        "email",
        "status",
        "subscribed_url",
        "subscribed_referrer",
        "created_at",
        "updated_at",
        "name",
        "post_id",
        "unsubscribed_url",
        "unsubscribed_at",
        "state"
      ]
    )
    activeSheet.setFrozenRows(1)
    activeSheet.appendRow (
      [
        id,
        email,
        status,
        subscribed_url,
        subscribed_referrer,
        created_at,
        updated_at,
        name,
        post_id,
        unsubscribed_url,
        unsubscribed_at,
        state
      ]
    )
    removeEmptyColumns(sheetName);
    ss.deleteSheet(ss.getSheetByName('Sheet1'))
  } else {
    activeSheet.appendRow (
      [
        id,
        email,
        status,
        subscribed_url,
        subscribed_referrer,
        created_at,
        updated_at,
        name,
        post_id,
        unsubscribed_url,
        unsubscribed_at,
        state
      ]
    )    
  }
  removeDuplicateRows(sheetName)
  return ContentService.createTextOutput('"addSubscriber":"Successful"')
}

function deleteSubscriber(e) {
  var params = JSON.parse(e.postData.contents).subscriber.previous
  var id = params.id
  var email = params.email
  var status = params.status
  var subscribed_url = params.subscribed_url
  var subscribed_referrer = params.subscribed_referrer
  var created_at = params.created_at
  created_at = Utilities.formatDate(new Date(created_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  var updated_at = params.updated_at
  updated_at = Utilities.formatDate(new Date(updated_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  var name = params.name
  var post_id = params.post_id
  var unsubscribed_url = params.unsubscribed_url
  var unsubscribed_at = params.unsubscribed_at
  if (unsubscribed_at == null) {
    unsubscribed_at = null
  } else {
    unsubscribed_at = Utilities.formatDate(new Date(unsubscribed_at), timeZone, "dd MMM, yyyy HH:mm:ss");
  }
  sheetName = subscribers;
  var activeSheet = ss.getSheetByName(sheetName);  
  if (activeSheet == null) {
    activeSheet = ss.insertSheet().setName(sheetName);
    activeSheet.appendRow (
      [
        "id",
        "email",
        "status",
        "subscribed_url",
        "subscribed_referrer",
        "created_at",
        "updated_at",
        "name",
        "post_id",
        "unsubscribed_url",
        "unsubscribed_at",
        "state"
      ]
    )
    activeSheet.setFrozenRows(1)
    var state = false
    activeSheet.appendRow (
      [
        id,
        email,
        status,
        subscribed_url,
        subscribed_referrer,
        created_at,
        updated_at,
        name,
        post_id,
        unsubscribed_url,
        unsubscribed_at,
        state
      ]
    )
    removeEmptyColumns(sheetName);
    ss.deleteSheet(ss.getSheetByName('Sheet1'))
  } else {
    var values = activeSheet.getDataRange().getValues();
    var headers = values[0]
    var idIndex = headers.indexOf('id');
    var stateIndex = headers.indexOf('state');
    var statusIndex = headers.indexOf('status');
    var updated_atIndex = headers.indexOf('updated_at');
    var unsubscribed_urlIndex = headers.indexOf('unsubscribed_url');
    var unsubscribed_atIndex = headers.indexOf('unsubscribed_at');
    var sheetRow;
    var subscriberID = true
    for(var i=0, iLen=values.length; i<iLen; i++) {
      if (values[i][idIndex] == id) {
        sheetRow = i+1
        subscriberID = true
        break;
      } else {
        subscriberID = false
      }
    }
    ++stateIndex;
    ++statusIndex;
    ++updated_atIndex;
    ++unsubscribed_urlIndex;
    ++unsubscribed_atIndex;
    if (subscriberID == false) {
      var state = false
      activeSheet.appendRow (
        [
          id,
          email,
          status,
          subscribed_url,
          subscribed_referrer,
          created_at,
          updated_at,
          name,
          post_id,
          unsubscribed_url,
          unsubscribed_at,
          state
        ]
      )    
    } else {
      var state = activeSheet.getRange(sheetRow, stateIndex).getValue()
      if (state == true) {
        activeSheet.getRange(sheetRow, stateIndex).setValue(false)
        activeSheet.getRange(sheetRow, statusIndex).setValue(status)
        activeSheet.getRange(sheetRow, updated_atIndex).setValue(updated_at)
        activeSheet.getRange(sheetRow, unsubscribed_urlIndex).setValue(unsubscribed_url)
        activeSheet.getRange(sheetRow, unsubscribed_atIndex).setValue(unsubscribed_at)
      } else {
        var state = false
        activeSheet.appendRow (
          [
            id,
            email,
            status,
            subscribed_url,
            subscribed_referrer,
            created_at,
            updated_at,
            name,
            post_id,
            unsubscribed_url,
            unsubscribed_at,
            state
          ]
        )
      }
    }
    removeDuplicateRows(sheetName)
    return ContentService.createTextOutput('"deleteSubscriber":"Successful"')  
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

function removeDuplicateRows(sheetName) {
  var activeSheet = ss.getSheetByName(sheetName)
  var data = activeSheet.getDataRange().getValues();
  var newData = new Array();
  for(i in data){
    var row = data[i];
    var duplicate = false;
    for(j in newData){
      if(row.join() == newData[j].join()){
        duplicate = true;
      }
    }
    if(!duplicate){
      newData.push(row);
    }
  }
  activeSheet.clearContents();
  activeSheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
}
