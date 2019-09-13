function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Realtime Data');
}

function randomQuotes() {
  var baseURL = 'https://thesimpsonsquoteapi.glitch.me/quotes';
  var quotesData = UrlFetchApp.fetch(baseURL, { muteHttpExceptions: true });
  var quote;
  var imageURL;
  if (quotesData.getResponseCode() == 200 || quotesData.getResponseCode() == 201) {
    var response = quotesData.getContentText();
    var data = JSON.parse(response)[0];
    quote = data["quote"];
    imageURL = data["image"];
  } else {
    quote = 'Random Quote Generator is broken!';
    imageURL = 'https://cdn.shopify.com/s/files/1/1061/1924/products/Sad_Face_Emoji_large.png?v=1480481055';
  }
  var randomQuote = {
    "quote": quote,
    "imageTag": '<img class="responsive-img" src="' + imageURL + '">'
  }
  return randomQuote;
}

function getTime() {
  var now = new Date();
  return now;
}
