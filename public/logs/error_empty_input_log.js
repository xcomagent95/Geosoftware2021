"use strict"
// These are to possible appenders to log statements
var consoleAppender_error_empty_input_log = JL.createConsoleAppender('consoleAppender_error_empty_input_log');
var ajaxAppender_error_empty_input_log=JL.createAjaxAppender('ajaxAppender_error_empty_input_log');

JL().setOptions({"appenders": [ajaxAppender_error_empty_input_log, consoleAppender_error_empty_input_log]});

JL("ClientToServerLogs").fatal("\n\nAdding object FAILED: NO INPUT available");