/*jslint browser, maxlen: 80, white*/
/*global 
CacheService, HtmlService, Logger, PropertiesService, Session,
SpreadsheetApp
*/

var DEBUG = false;

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
  kittySs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperties().kittySsId
  );
  lotteryJsonStr = JSON.stringify(
    {
      playedNumsArr: playedNumsSs.getSheets().map(getSheetData),
      drawnNumsArr: drawnNumsSs.getSheets().map(getSheetData),
      gameRulesArr: gameRulesSs.getSheets().map(getSheetData),
      kittyArr: kittySs.getSheetByName("Balance Sheet")
      .getDataRange().getDisplayValues(),
      projectName: projectName
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
