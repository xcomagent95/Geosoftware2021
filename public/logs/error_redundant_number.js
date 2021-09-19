"use strict"

// These are to possible appenders to log statements
var consoleAppender_error_redundant_number = JL.createConsoleAppender('consoleAppender_error_redundant_number');
var ajaxAppender_error_redundant_number = JL.createAjaxAppender('ajaxAppender_error_redundant_number');

JL().setOptions({"appenders": [ajaxAppender_error_redundant_number, consoleAppender_error_redundant_number]});

JL("ClientToServerLogs").fatal("\n\nAdd object error: ID is redundant");