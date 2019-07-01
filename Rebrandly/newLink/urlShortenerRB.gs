function URLShortener() {
  var data = {
    "title": "Your Title Goes Here",
    "slashtag": "1234567890",
    "destination": "https://example.com/?utm_source=email&utm_medium=mobile&utm_content=1234567890",
    "domain": {
      "id": "YYYYYYYYYYYYYYYYYYYYYYYY"
    }
  };
  var url = "https://api.rebrandly.com/v1/links"
  var options = {
    'method': 'POST',
    "contentType": "application/json",
    'payload': JSON.stringify(data),
    'headers': {
      "apikey":"ZZZZZZZZZZZZZZZZZZZZZZ",
      "workspace":"XXXXXXXXXXXXXXXXXXXXX"
    },
  };
  var response = UrlFetchApp.fetch(url, options);
  var json = response.getContentText();
  var data = JSON.parse(json);
  var id = data["id"];
  var shortUrl = data["shortUrl"];
  Logger.log(id,shortUrl)
}
