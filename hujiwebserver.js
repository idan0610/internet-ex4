var fs = require("fs");
var hujinet = require("./hujinet");
var hujiRequest = require("./hujiRequest");
var hujiResponse = require("./hujiResponse");
var hujirequestparser = require("./hujirequestparser");

/**
 * The huji web server object creator
 *
 */
var hujiServer = function() {
    this.resources = [];
    this.clientsCount = 0;
    var self = this;

    //Creates server object via hujinet
    this.serverObj = hujinet.createServer(function(socket) {
        self.clientsCount++;
        socket.sendCalled = false;

        var onWindows = false;
        var request = new hujiRequest.requestObject();
        var response = new hujiResponse.responseObject(socket);

        // Set timeout for new socket
        socket.setTimeout(2000);
        socket.on("timeout", function () {
            socket.end();
            self.clientsCount--;
        });

        //defines socket.on
        socket.on("data", function (data) {
            if(data.toString().indexOf("\r\n") > -1)
            {
                onWindows = true;
            }
            var requestArray = data.toString("utf8").replace(/(\r\n|\n|\r)/gm, "\n").split("\n");
            var i = 0;
            // Parsing first line
            if (request.method === "") {
                if (!hujirequestparser.parseFirstLine(requestArray[i].trim(), request)) {
                    response.set("Connection", "close");
                    response.status(400).send("Bad Request");
                    return;
                }
                i++;
            }

            // Parsing Headers
            while(!request.endOfHeaders && i < requestArray.length) {
                if (requestArray[i] === ""){
                    if (i != requestArray.length - 1) {
                        request.endOfHeaders = true;
                    }
                }
                else if (!hujirequestparser.parseField(requestArray[i].trim(), request)) {
                    response.set("Connection", "close");
                    response.status(400).send("Bad Request");
                    return;
                }
                i++;
            }

            // Parsing Body
            while(i < requestArray.length && request.body.length < request.get("Content-Length")) {
                request.body += requestArray[i];
                if (i < requestArray.length - 1) {
                    if(onWindows) {
                        request.body += "\r\n";
                    }
                    else {
                        request.body += "\n";
                    }
                }
                i++;
            }

            if (request.endOfHeaders && request.body.length === request.contentLength)
            {
                var temp = request.body;
                try {
                    request.body = JSON.parse(request.body);
                }
                catch (err) {
                    request.body = temp;
                }

                //creates finalize the response after receiving all data
                try {
                    hujinet.handleData(request, response, self.resources, 0);
                }
                catch (err) {
                    response.set("Connection", "close");
                    response.status(500).send("Server Error");
                    return;
                }
                request = new hujiRequest.requestObject();
                response = new hujiResponse.responseObject(socket);
                onWindows = false;
            }
        });

        //reduces the counter, since we had a disconnection
        socket.on("close", function(had_error) {
            self.clientsCount--;
        });
    });

    /**
     *\Defines the resource parameters property for the server,
     * and how it should handle them.
     * @param resource - resource is the prefix of the resource
     * @param requestHandler - function that receives 3 arguments and should handle
     * a request due the provided resource
     */
    this.use = function(resource, requestHandler) {
        if (typeof requestHandler === "undefined" ) {
            requestHandler = resource;
            resource = '/';
        }
        self.resources.push({
            resource: resource,
            requestHandler: requestHandler
        });
    };

    /**
     * Stops the server operation and disconnect
     * @param callback
     */
    this.stop = function(callback) {
        if (this.serverObj)
        {
            this.serverObj.close(callback);
        }
    };
};

/**
 * A server object factory.
 * Creates sever objects
 * @param port - the port that the server should listen to.
 * @param callback - called in case of an error or when listen is called.
 * @returns {hujiServer}
 */
var start = function (port, callback) {
    var server = new hujiServer();

    Object.defineProperty(server, 'port', {
        get: function() { return port; }
    });

    server.serverObj.on("error", function(err) {
        callback(err);
    });

    server.serverObj.listen(port, callback);

    return server;
};

/**
 * A function that take care of a static serving
 * @param rootFolder - folder for a non-dynamic communication
 * @returns {Function} - request handler that handles a static scenario
 */
var static = function (rootFolder) {
    return function(request, response, next){
        var types = {
            'js': 'application/javascript',
            'txt': 'text/plain',
            'html': 'text/html',
            'css': 'text/css',
            'jpeg': 'image/jpeg',
            'jpg': 'image/jpg',
            'gif': 'image/gif'
        };

        var URL = request.path.replace(request.resource.resource, rootFolder);

        // makes files checks

        //file requested is in an unreachable folder
        if(URL.indexOf("..") != -1) {
            response.status(403).send("Cannot access to file");
            response.socket.end();
        }

        try {
            var stats = fs.statSync(URL);
        }
        catch (e) {
            // file does not exist
            response.status(404).send("The requested file was not found");
            response.socket.end();
        }

        // not a file
        if(!stats.isFile()) {
            response.status(404).send("The requested file was not found");
            response.socket.end();
        }

        // the type is not supported
        var postfix = URL.substr(URL.lastIndexOf('.')+1);
        if (!(postfix in types)) {
            response.status(403).send("Cannot access to file");
            response.socket.end();
        }

        var version = request.version;

        var connection = "";
        if ((version === "http/1.0" && request.connection !== "keep-alive") || request.connection === "close") {
            connection = "close";
        }
        else {
            connection = "keep-alive";
        }

        response.version = version;
        response.set("Content-Type", types[postfix]);
        response.set("Content-Length", stats.size);
        response.set("Connection", connection);
        response.sendFile(URL);
    };
};

/**
 * Our own mind up function.
 * Provides the current number of connected clients to the server
 * @param server - server to return its client count
 * @returns {Function} - A request handler function
 */
var myUse = function (server){

    /**
     * @returns {string} - myUse explanation
     */
    this.toString = function(){
        return "This function is responsible for providing the current number of connected clients to the server"
    };

    return function(request, response, next) {
        var body = "There are " + server.clientsCount + " connected to your server";
        response.status(200);
        response.send(body);
    }
};
exports.start = start;
exports.static = static;
exports.myUse = myUse;