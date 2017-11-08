/*jslint browser, devel, maxlen: 80, single, this, white*/
/*global Logger, PropertiesService, SpreadsheetApp, UrlFetchApp*/

/**
* find extends Array object and is recursive
*      it returns the first array item for which
*      the passed in function matchFxn returns true
*      or, undefined if no match is found.
* @param {object} array
* @param {object} matchFxn
* @returns {object}
*/
function find(array, matchFxn) {
  'use strict';
  if (!array) {
    return undefined;
  }
  if (array.length === 0) {
    return undefined;
  }
  if (matchFxn(array[0]) !== true) {
    find(array.slice(1), matchFxn);
  }
  return array[0];
}

/**
* @param {object} matchFxn provides criteria 
*                          for array element match.
* @this {object} array to be matched
*/
Array.prototype.find = function (matchFxn) {
  'use strict';
  return find(this, matchFxn);
};

/**
*
*/
function getGameIdArr(curVal) {
  'use strict';
  return curVal[0] === 'game_id';
}

/**
*
*/
function fileOneDraw(curVal) {
  'use strict';
  var drawingsSheet = this;
  var startRow = Math.max(drawingsSheet.getLastRow(), 2);
  var startColumn = 1;
  var numRows = 1;
  var numColumns = 1;
  var lastDate = drawingsSheet.getSheetValues(
    startRow, 
    startColumn, 
    numRows, 
    numColumns)[0][0];
  //var drawDate = new Date(curVal.draw_date_display);
  var drawDate = new Date(curVal.draw_date);
  var rowContents = [];
  if (drawDate > lastDate) {
    rowContents = [
      //curVal.draw_date_display,
      curVal.draw_date,
      curVal.winning_num,
      curVal.jackpot,
      curVal.ball,
      curVal.bonus,
      curVal.next_draw_date,
      curVal.estimated_jackpot
    ];
    drawingsSheet.appendRow(rowContents);
  }
}

/**
*
*/
function getAndFileResults(sheetObj) {
  'use strict';
  var gameRulesSs = this.gameRulesSs;
  var drawingsSs = this.drawingsSs;
  var lotteryUrl = this.lotteryUrl;
  var gameRulesSheet = gameRulesSs.getSheetByName(sheetObj.getName());
  var gameRulesDataArr = gameRulesSheet.getDataRange().getValues();
  var gameIdArr = gameRulesDataArr.find(getGameIdArr);
  var gameId = gameIdArr[1];
  var response = UrlFetchApp.fetch(
    lotteryUrl + 
    //'/data/json/search/lotterygames/' +
    //gameId + '-data.json'
    '/data/json/games/lottery/' + 
    gameId + '.json'
  );
  var lotteryJson = JSON.parse(response.getContentText());
  //var gameName = lotteryJson.title;
  var gameName = lotteryJson.game_name;
  var drawingsSheet = drawingsSs.getSheetByName(gameName);
  lotteryJson.draws.reverse().forEach(fileOneDraw, drawingsSheet);
}

/**
*
*/
function main() {
  'use strict';
  var gameRulesSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties()
    .getProperty('gameRulesSsId')
  );
  var drawingsSs = SpreadsheetApp.openById(
    PropertiesService.getScriptProperties()
    .getProperty('drawingsSsId')
  );
  var lotteryUrl = PropertiesService.getScriptProperties()
  .getProperty('massLotteryUrl');
  // start update drawing results sheets
  gameRulesSs.getSheets()
  .forEach(
    getAndFileResults, 
    {
      gameRulesSs: gameRulesSs,
      drawingsSs: drawingsSs,
      lotteryUrl: lotteryUrl
    }
  );
  // end update drawing results sheets
}