"use strict"

var consoleAppender = JL.createConsoleAppender('consoleAppender_doneLogs');
var ajaxAppender = JL.createAjaxAppender('ajaxAppender_doneLogs');

JL().setOptions({"appenders": [ajaxAppender, consoleAppender]});

JL("ClientToServerLogs").info("Action was successful: new object stored in database or deletet from it");
