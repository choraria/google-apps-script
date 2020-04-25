function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  .setTitle('FirebaseUI | Firebase Authentication');
}

function webAppUrl() {
  return ScriptApp.getService().getUrl();
}
