function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BoldX Menu')
    .addItem('Show sidebar', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Index').setTitle('BoldX Sidebar');
  SpreadsheetApp.getUi().showSidebar(html);
}

const ss = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

function main(range, csvWords) {
  const values = ss.getRange(range).getValues();
  const rawWords = csvWords.split(",");
  const words = [];
  rawWords.forEach(word => {
    words.push(word.trim());
  });


  for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
    const row = values[rowIndex];
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const value = row[colIndex];
      if (checkWords(value, words)) {
        setBoldFormat(value, words, rowIndex, colIndex);
      }
    }
  }
}

function checkWords(value, words) {
  const wordArray = value.match(/\b(\S+)\b/g);
  const hasWord = words.some((value) => wordArray.indexOf(value) !== -1);
  return hasWord;
}

function setBoldFormat(value, words, rowIndex, colIndex) {
  const range = ss.getRange(rowIndex + 1, colIndex + 1);
  const boldX = SpreadsheetApp.newTextStyle().setBold(true).build();
  for (let wordIndex in words) {
    let word = words[wordIndex];
    const richTextValue = range.getRichTextValue().copy();
    const startIndex = value.indexOf(word);
    if (startIndex > 0) {
      const endIndex = startIndex + word.length;
      const formattedOutput = richTextValue.setTextStyle(startIndex, endIndex, boldX).build();
      range.setRichTextValue(formattedOutput);
      SpreadsheetApp.flush();
    }
  }
}
