/**
 * Created by owner on 28/12/2015.
 */

var hujiRequest = require("./hujiRequest");
var url = require("url");

/**
 * parsing the first line of a request
 * @param line - first line as string
 * @param request - the request (object)
 * @returns {boolean} - true iff line is fine and parsed successfully
 */
var parseFirstLine = function(line, request) {
    var lineArr = line.replace(/\s{2,}/g, ' ').split(" ");
    if (lineArr.length !== 3) {
        return false;
    }
    request.method = lineArr[0];
    request.href = lineArr[1];
    request.version = lineArr[2];

    return true;
};

/**
 * parsing a field (header) line of a request
 * @param line - field line
 * @param request - the request (object)
 * @returns {boolean} - true iff the parsing and the argument are well
 */
var parseField = function(line, request) {
    var pat = new RegExp(".+:.+");
    if(!pat.test(line)) {
        return false;
    }

    var field = line.split(/:(.+)?/);
    field[0] = field[0].trim();
    field[1] = field[1].trim();

    if (field[0].toLowerCase() === "connection"){
        request.connection = field[1].toLowerCase();
    }

    if (field[0].toLowerCase()=== "host"){
        request.href = "http://" + field[1] + request.href;
    }

    if (field[0].toLowerCase() === "cookie")
    {
        var cookieParams = field[1].split(";");

        for (var i = 0; i < cookieParams.length; i++){
            var paramObj = cookieParams[i].trim().split("=");
            request.cookies[paramObj[0]] = paramObj[1];
        }
    }

    if (field[0].toLowerCase() === "content-length")
    {
        request.contentLength = Number(field[1]);
    }

    request.fields.push({
        key: field[0],
        value: field[1]
    });

    return true;
};

exports.parseFirstLine = parseFirstLine;
exports.parseField = parseField;