var projectId = 'XXXXXXXX';
var datasetId = 'YYYYYYYYY';
var tableId = 'ZZZZZZZZ';

function doGet(e) {
  var params = JSON.stringify(e.parameters);
  var jsonMapping = JSON.parse(params)
  var param1 = jsonMapping["param1"][0]
  var param2 = jsonMapping["param2"][0]
  var request = {
    'query': "INSERT INTO `" + projectId + "."+ datasetId + "." + tableId + "` VALUES ('" + param1 + "','" + param2 + "')",
    'useLegacySql': false
  }
  var queryResults = BigQuery.Jobs.query(request, projectId);
  var jobId = queryResults.jobReference.jobId;
  return ContentService.createTextOutput('Successful')
}
