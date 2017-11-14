/*jslint browser, devel, maxlen: 80, single, white*/
/*global HtmlService, Logger, PropertiesService, SpreadsheetApp*/

function include(filename) {
  'use strict';
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetData(sheet) {
  'use strict';
  return {
    name: sheet.getName(),
    data: sheet.getDataRange().getValues()
  };
}

/**
* getData is called asynchronously from the browser
* @return {string} stringified json of spreadsheet data.
*/
function getData() {
  'use strict';
  var playedNumsSs = {};
  var drawnNumsSs = {};
  var gameRulesSs = {};
  var lotteryJsonStr = '';
  // TODO: uncomment the cache related code
  //  var cache = CacheService.getScriptCache();
  //  var cached = cache.get("lottery-json-string");
  //  if (cached != null) {
  //    return cached;
  //  }
  playedNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('playedNumsSsId')
  );
  drawnNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('drawnNumsSsId')
  );
  gameRulesSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('gameRulesSsId')
  );
  lotteryJsonStr = JSON.stringify(
    {
      playedNumsArr: playedNumsSs.getSheets().map(getSheetData),
      drawnNumsArr: drawnNumsSs.getSheets().map(getSheetData),
      gameRulesArr: gameRulesSs.getSheets().map(getSheetData)
    }
  );
  //  cache.put("lottery-json-string", lotteryJsonStr, 3600); // cache for one hour
  return lotteryJsonStr;
}

function doGet() {
  'use strict';
  var mode = HtmlService.SandboxMode.IFRAME;
  return HtmlService.createTemplateFromFile('Index').evaluate()
  .setSandboxMode(mode);
}
