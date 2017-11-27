/*jslint browser, maxlen: 80, white*/
/*global CacheService, HtmlService, Logger, PropertiesService, SpreadsheetApp*/

var DEBUG = false;

//**************************************************************************

function deleteCache() {
  "use strict";
  CacheService.getScriptCache().remove("sunk-cost-json-string");
}

//**************************************************************************

function include(filename) {
  "use strict";
  var cache = {};
  var key = "sunk-cost-" + filename + "-html";
  var value = "";
  var expirationInSeconds = 21600;  // cache for six hours
  var cached = {};
  var value = "";
  if (DEBUG) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  }
  cache = CacheService.getScriptCache();
  key = "sunk-cost-" + filename + "-html";
  cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }
  value = HtmlService.createHtmlOutputFromFile(filename).getContent();
  cache.put(key, value, expirationInSeconds);
  return value;
}

//**************************************************************************

function getSheetData(sheet) {
  "use strict";
  return {
    name: sheet.getName(),
    data: sheet.getDataRange().getDisplayValues()
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
  var kittySs = {};
  var lotteryJsonStr = "";
  // Cache variables
  var cache = CacheService.getScriptCache();
  var key = "sunk-cost-json-string";
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
  kittySs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().kittySsId
  );
  lotteryJsonStr = JSON.stringify(
    {
      playedNumsArr: playedNumsSs.getSheets().map(getSheetData),
      drawnNumsArr: drawnNumsSs.getSheets().map(getSheetData),
      gameRulesArr: gameRulesSs.getSheets().map(getSheetData),
      kittyArr: kittySs.getSheetByName("Balance Sheet")
      .getDataRange().getDisplayValues()
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
  return HtmlService.createTemplateFromFile("Index").evaluate()
  .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

//**************************************************************************
