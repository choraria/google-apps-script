const saveToDriveAsJson = false;

const ss = SpreadsheetApp.getActiveSpreadsheet();
const activeSheet = ss.getActiveSheet();

function getPrecedents() {
  const rawCellData = scanCurrentSheet();
  let result = {};
  rawCellData.forEach(cellData => {
    let rawRangesR1C1 = cellData.rangesR1C1;
    rawRangesR1C1.forEach(range => {
      let enumeratedData = enumerateRange(range, cellData.rowIndex, cellData.columnIndex);
      result[enumeratedData.cell] = Object.keys(result).includes(enumeratedData.cell)
        ? [...new Set(result[enumeratedData.cell].concat(enumeratedData.precedents))]
        : enumeratedData.precedents;
    });
    let rawCellR1C1 = cellData.cellsR1C1;
    rawCellR1C1.forEach(cell => {
      let cellA1Notation = convertCellsFromR1C1toA1Notation(cell, cellData.rowIndex, cellData.columnIndex);
      result[cellA1Notation.cell] = Object.keys(result).includes(cellA1Notation.cell)
        ? [...new Set(result[cellA1Notation.cell].concat(cellA1Notation.precedents))]
        : cellA1Notation.precedents;
    });
  });
  console.log(JSON.stringify(result, null, 2));
  saveToDriveAsJson ? DriveApp.createFile(`${ss.getName()} — ${activeSheet.getSheetName()} — graph.json`, JSON.stringify(result, null, 2), MimeType.PLAIN_TEXT) : null;
}

function scanCurrentSheet() {
  const formulasR1C1 = activeSheet.getDataRange().getFormulasR1C1();
  let result = [];
  formulasR1C1.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      let dict = {};
      if (cell) {
        dict["formula"] = cell;
        dict["rowIndex"] = rowIndex;
        dict["columnIndex"] = columnIndex;

        let formattedCell = JSON.parse(JSON.stringify(cell))
          .replace(/''/gmi, "'")
          .replace(/\\/gmi, "\\")

        dict["rangesR1C1"] = [];
        let rangesRegExPattern = `(?:[R|C]\\[-?\\d+\\]){0,2}:(?:[R|C]\\[-?\\d+\\]){0,2}`;
        try {
          cell.match(/!?(?:[R|C]\[-?\d+\]){0,2}:(?:[R|C]\[-?\d+\]){0,2}/gmi).filter(data => !data.includes("!") && data !== ":" ? dict["rangesR1C1"].push(data) : null);
        } catch (e) { }
        try {
          cell.match(/\b\w+!(?:[R|C]\[-?\d+\]){0,2}:(?:[R|C]\[-?\d+\]){0,2}/gmi).forEach(data => dict["rangesR1C1"].push(data));
        } catch (e) { }
        try {
          let moreRangeReferences = getMatchingRangeCellRef(formattedCell, rangesRegExPattern);
          moreRangeReferences.length > 0 ? moreRangeReferences.forEach(data => dict["rangesR1C1"].push(JSON.parse(JSON.stringify(data)))) : null;
        } catch (e) { }

        dict["cellsR1C1"] = [];
        let cellsRegExPattern = `(?<!:)R\\[\\-?\\d+\\]C\\[\\-?\\d+\\](?!:)`;
        try {
          cell.match(/!?(?<!:)R\[\-?\d+\]C\[\-?\d+\](?!:)/gmi).filter(data => !data.includes("!") ? dict["cellsR1C1"].push(data) : null);
        } catch (e) { }
        try {
          cell.match(/\b\w+!(?<!:)R\[\-?\d+\]C\[\-?\d+\](?!:)/gmi).forEach(data => dict["cellsR1C1"].push(data));
        } catch (e) { }
        try {
          let moreCellReferences = getMatchingRangeCellRef(formattedCell, cellsRegExPattern);
          moreCellReferences.length > 0 ? moreCellReferences.forEach(data => dict["cellsR1C1"].push(JSON.parse(JSON.stringify(data)))) : null;
        } catch (e) { }

        result.push(dict);
      }
    });
  });
  return result;
}

function getMatchingRangeCellRef(cell, regexPattern) {
  const sheets = ss.getSheets();
  let result = [];
  sheets.forEach(sheet => {
    let sheetNameFormat = sheet.getSheetName()
      .replace(/\\/gmi, "\\\\")
      .replace(/\//gmi, "\\\/")
      .replace(/\|/gmi, "\\\|")
      .replace(/\./gmi, "\\\.")
      .replace(/\+/gmi, "\\\+")
      .replace(/\*/gmi, "\\\*")
      .replace(/\?/gmi, "\\\?")
      .replace(/\^/gmi, "\\\^")
      .replace(/\$/gmi, "\\\$")
      .replace(/\(/gmi, "\\\(")
      .replace(/\)/gmi, "\\\)")
      .replace(/\[/gmi, "\\\[")
      .replace(/\]/gmi, "\\\]")
      .replace(/\{/gmi, "\\\{")
      .replace(/\}/gmi, "\\\}")
    let finalRegExPattern = new RegExp(`'${sheetNameFormat}'!${regexPattern}`, "gmi");
    let matchedReferences = cell.match(finalRegExPattern);
    matchedReferences?.forEach(data => result.push(data));
  });
  return result;
}

function enumerateRange(range, rowIndex, columnIndex) {
  let enumerated = [];
  const lastRow = activeSheet.getLastRow();
  const lastColumn = activeSheet.getLastColumn();
  const isDifferentSheet = range.includes("!");
  const rangeData = isDifferentSheet ? range.split("!") : null;
  range = isDifferentSheet ? rangeData[1] : range;
  let [startCell, endCell] = range.split(":");
  startCell = startCell.includes("R") && startCell.includes("C") ? startCell :
    (!startCell.includes("R") ? `R[${0 - rowIndex}]${startCell}` :
      (!startCell.includes("C") ? `${startCell}C[${(0 - columnIndex)}]` :
        startCell
      )
    );
  endCell = endCell.includes("R") && endCell.includes("C") ? endCell :
    (!endCell.includes("R") ? `R[${(lastRow - 1) - rowIndex}]${endCell}` :
      (!endCell.includes("C") ? `${endCell}C[${(lastColumn - 1) - columnIndex}]` :
        endCell
      )
    );
  const [, startRowIndex, startColumnIndex] = /R\[(-?\d+)\]C\[(-?\d+)\]/gmi.exec(startCell);
  const [, endRowIndex, endColumnIndex] = /R\[(-?\d+)\]C\[(-?\d+)\]/gmi.exec(endCell);
  const corrected = {
    startRowIndex: +startRowIndex + +rowIndex,
    startColumnIndex: +startColumnIndex + +columnIndex,
    endRowIndex: +endRowIndex + +rowIndex,
    endColumnIndex: +endColumnIndex + +columnIndex
  }
  for (let j = corrected.startColumnIndex; j <= corrected.endColumnIndex; j++) {
    for (let i = corrected.startRowIndex; i <= corrected.endRowIndex; i++) {
      let a1Notation = activeSheet.getRange(`R[${i}]C[${j}]`).getA1Notation();
      enumerated.push(isDifferentSheet ? `${rangeData[0]}!${a1Notation}` : a1Notation);
    }
  }
  const cell = activeSheet.getRange(`R[${rowIndex}]C[${columnIndex}]`).getA1Notation();
  return {
    cell: cell,
    precedents: [...new Set(enumerated)]
  };
}

function convertCellsFromR1C1toA1Notation(cellR1C1Reference, rowIndex, columnIndex) {
  let enumerated = [];
  const isDifferentSheet = cellR1C1Reference.includes("!");
  const cellReferenceData = isDifferentSheet ? cellR1C1Reference.split("!") : null;
  cellR1C1Reference = isDifferentSheet ? cellReferenceData[1] : cellR1C1Reference;

  const [, startRowIndex, startColumnIndex] = /R\[(-?\d+)\]C\[(-?\d+)\]/gmi.exec(cellR1C1Reference);
  const corrected = {
    startRowIndex: +startRowIndex + +rowIndex,
    startColumnIndex: +startColumnIndex + +columnIndex,
  }

  const a1Notation = ss.getRange(`R[${corrected.startRowIndex}]C[${corrected.startColumnIndex}]`).getA1Notation();
  enumerated.push(isDifferentSheet ? `${cellReferenceData[0]}!${a1Notation}` : a1Notation);
  const cell = activeSheet.getRange(`R[${rowIndex}]C[${columnIndex}]`).getA1Notation();
  return {
    cell: cell,
    precedents: [...new Set(enumerated)]
  };
}
