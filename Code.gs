/*jslint browser, devel, maxlen: 80, single, white*/
/*global HtmlService, Logger, PropertiesService, SpreadsheetApp*/

function include(filename) {
  'use strict';
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetData(sheet) {
  'use strict';
  return sheet.getDataRange().getValues();
}

/**
* getData is called asynchronously from the browser
*/
function getData() {
  'use strict';
  var playedNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('playedNumsSsId')
  );
  var drawnNumsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('drawnNumsSsId')
  );
  var gameRulesSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties().getProperty('gameRulesSsId')
  );
  return JSON.stringify(
    {
      playedNumsArr: playedNumsSs.getSheets().map(getSheetData),
      drawnNumsArr: drawnNumsSs.getSheets().map(getSheetData),
      gameRulesArr: gameRulesSs.getSheets().map(getSheetData)
    }
  );
}

function doGet() {
  'use strict';
  var mode = HtmlService.SandboxMode.IFRAME;
  return HtmlService.createTemplateFromFile('Index').evaluate()
  .setSandboxMode(mode);
}
