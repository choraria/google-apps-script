var Key = 'XXXXXXXXXXX'
var Token = 'YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY'
var aSID = 'ZZZZZZZZZZZZZZZZZZZZZZZZZZ'

function Connect2Nos() {
  ExoAPI.authenticate(Key, Token, aSID)
  var From = 'AAAAAAAAAA'
  var To = 'BBBBBBBBBB'
  var CalerId = 'CCCCCCCCCC'
  var dial = ExoAPI.connectTwoNumbers(From, To, CalerId)
  var Sid = dial.Call.Sid
  Logger.log(Sid)
}
