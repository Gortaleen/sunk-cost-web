/*jslint browser, maxlen: 80, white*/
/*global
CacheService, HtmlService, Logger, PropertiesService, Session,
SpreadsheetApp
*/

var DEBUG = false;
var NUM_ROWS = 10;

//**************************************************************************

function deleteCache() {
  "use strict";
  var cache = CacheService.getScriptCache();
  var projectName = PropertiesService.getScriptProperties()
    .getProperties()
    .projectName;
  cache.remove(projectName.replace(" ", "-") + "-json-string");
}

//**************************************************************************

function include(filename) {
  "use strict";
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

//**************************************************************************

function getSheetData(sheet) {
  "use strict";
  return {
    name: sheet.getName(),
    data: sheet.getDataRange().getDisplayValues()
  };
}

function getLargeTableData(sheet) {
  "use strict";
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var row = lastRow - (NUM_ROWS - 1);
  var column = 1;
  var numRows = NUM_ROWS;
  var numColumns = lastColumn;

  return sheet.getRange(row, column, numRows, numColumns)
    .getDisplayValues();
}

function getActiveNums(sheet) {
  "use strict";
  var t = new Date();
  t.setMonth(t.getMonth() - 6);
  return {
    name: sheet.getName(),
    data: sheet.getDataRange()
      .getDisplayValues()
      .filter((row, idx) => {
        var d = new Date(row[9]);
        return idx === 0 || d >= t;
      })
  };
}

//**************************************************************************

/**
* getData is called asynchronously from the browser
* @return {string} stringified json of spreadsheet data.
*/
function getData() {
  "use strict";
  var playedNumsSs = {};
  var drawnNumsSs = {};
  var gameRulesSs = {};
  var kittySheet = {};
  var lotteryJsonStr = "";
  var projectName = PropertiesService.getScriptProperties()
    .getProperties()
    .projectName;
  // Cache variables
  var cache = CacheService.getScriptCache();
  var key = projectName.replace(" ", "-") + "-json-string";
  var expirationInSeconds = 3600; // cache for one hour
  var cached = {};
  //
  if (DEBUG === false) {
    cached = cache.get(key);
    if (cached !== null) {
      return cached;
    }
  }
  playedNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().playedNumsSsId
  );
  drawnNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().drawnNumsSsId
  );
  gameRulesSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().gameRulesSsId
  );
  kittySheet = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().kittySsId
  ).getSheetByName("Balance Sheet");
  lotteryJsonStr = JSON.stringify(
    {
      playedNumsArr: playedNumsSs.getSheets().map(getActiveNums),
      drawnNumsArr: drawnNumsSs.getSheets().map(
        sheet => {
          return {
            name: sheet.getName(),
            data: getLargeTableData(sheet)
          };
        }
      ),
      gameRulesArr: gameRulesSs.getSheets().map(getSheetData),
      kittyArr: getLargeTableData(kittySheet),
      projectName: projectName,
      kittyBalance: kittySheet.getRange(1, 6).getDisplayValues()
    }
  );
  if (DEBUG === false) {
    cache.put(key, lotteryJsonStr, expirationInSeconds);
  }
  return lotteryJsonStr;
}

//**************************************************************************

function doGet() {
  "use strict";
  var tmpl = HtmlService.createTemplateFromFile("Index");
  tmpl.projectName = PropertiesService.getScriptProperties()
    .getProperties()
    .projectName;
  tmpl.userID = Session.getActiveUser().getEmail();
  return tmpl.evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  //  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//**************************************************************************
