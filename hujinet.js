/**
 * Created by owner on 29/12/2015.
 */

var net = require("net");
var fs = require("fs");
var url = require("url");
var hujirequestparser = require("./hujirequestparser");
var hujiRequest = require("./hujiRequest");
var hujiResponse = require("./hujiResponse");

/**
 * creats server via the net module
 * @param options
 * @param connectionListener
 */
var createServer = function(options, connectionListener) {
    return net.createServer(options, connectionListener);
};

/**
 * Translate a resource to regex
 * @param resource
 * @returns {RegExp}
 */
var resRegex = function (resource){
    var array = resource.resource.split("/");
    var result = "^";
    for (var i = 1; i < array.length; i++){// \x\:y\z
        if (array[i].indexOf(":")=== 0){
            result += "/(" + "\\w+" + ")";
        }
        else{
            result += "/" + array[i] ;
        }
    }
    if(result.length == 2)
    {
        return new RegExp("^(?:(?:/)(?:.*))?$");
    }
    return new RegExp(result + "(?:(?:/)(?:.*))?$");

};

/**
 * finds a resources matches a path
 * @param path
 * @param resources - list of resources the server provides
 * @param startIndex - the resource index to start from
 * @returns - the index of the matching resource. -1 if not found
 */
var getResource = function(path, resources, startIndex) {
    for (var i = startIndex; i < resources.length;  i++) {
        var regex = resRegex(resources[i]);
        if (regex.test(path)) {
            return i;
        }
    }
    return -1;
};

/**
 * set a parameter of the request to be - key = word in resource, value = the equivalent match in the path
 * @param request
 */
var extractParams = function (request){
    var regex = resRegex(request.resource);
    var values = regex.exec(request.path);
    var j = 1;
    var array = request.resource.resource.split("/");
    for (var i = 0; i < array.length; i++){
        if (array[i].indexOf(":")=== 0){
            request.params[array[i].replace(':', '')] = values[j];
            j++;
        }
    }
};

/**
 * setes the response due to the request given as data.
 * @param data - request as data
 * @param socket
 * @param resources - server resources
 * @param startIndex - index of the resource to start the search from
 */
var handleData = function (request, response, resources, startIndex) {

    // check method
    var methods = ["get", "head", "post", "put", "delete", "trace",
        "options", "connect", "patch"];
    if (!request.method.toLowerCase() in methods) {
        response.status(500).send("Server Error");
        response.set("Connection", "close");
        return;
    }

    // check version
    if (request.version.toLowerCase() !== "http/1.0" && request.version.toLowerCase() !== "http/1.1") {
        response.status(500).send("Server Error");
        response.set("Connection", "close");
        return;
    }

    // use url module to configure path, protocol, host and query of request
    var urlObj = url.parse(request.href, true, true);
    request.path = urlObj.pathname;
    request.protocol = urlObj.protocol.replace(":", "");
    request.host = urlObj.host;
    request.query = urlObj.query;

    // check resource
    var resIndex = getResource(request.path, resources, startIndex);
    if (resIndex === -1) {
        if (response.socket.sendCalled === false) {
            response.status(404).send("The requested resource not found");
        }
        response.set("Connection", "close");
        return;
    }
    request.resource = resources[resIndex];

    // extract parameters from path and store them as fields
    extractParams(request);

    // Start configure response according the request
    var version = request.version;
    var connection = "";
    if ((version === "http/1.0" && request.connection !== "keep-alive") || request.connection === "close") {
        connection = "close";
    }
    else {
        connection = "keep-alive";
    }

    response.version = version;
    response.set("Connection", connection);

    for (var cookie in request.cookies) {
        if (request.cookies.hasOwnProperty(cookie)) {
            response.cookie(cookie, request.cookies[cookie]);
        }
    }

    request.resource.requestHandler(request, response, function () {
        handleData(request, response, resources, resIndex + 1);
    });

    if (response.socket.sendCalled === false) {
        response.set("Connection", "close");
        response.status(500).send("Server Error");
    }

    if (response.get("Connection") !== "keep-alive") {
        response.socket.end();
    }
};

exports.createServer = createServer;
exports.handleData = handleData;
exports.resRegex = resRegex;