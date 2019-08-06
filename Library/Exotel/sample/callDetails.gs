var Key = 'XXXXXXXXXXX'
var Token = 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
var aSID = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZ'

function callDetails() {
  ExoAPI.authenticate(Key, Token, aSID)
  var SID = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
  var calldetail = ExoAPI.callDetails(SID)
  var Uri = calldetail.Call.Uri
  Logger.log(Uri)
}
