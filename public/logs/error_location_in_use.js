"use strict"

var consoleAppender_error_location_in_use = JL.createConsoleAppender('consoleAppender_error_location_in_use');
var ajaxAppender_error_location_in_use = JL.createAjaxAppender('ajaxAppender_error_location_in_use');

JL().setOptions({"appenders": [ajaxAppender_error_location_in_use, consoleAppender_error_location_in_use]});

JL("ClientToServerLogs").fatal("\n\n Remove location error: Location is still part of a tour");