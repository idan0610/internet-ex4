/**
 * Created by owner on 14/01/2016.
 */

var fs = require("fs");

/**
 * The response Object
 * @param _socket
 */
var responseObject = function (_socket) {
    this.statusCode = 200;
    this.fields = [];
    this.version = "HTTP/1.1";
    this.socket = _socket;
    var self = this;

    /**
     * sets a field's value
     * @param fieldToAdd - field of value
     * @param value - value to set to
     */
    this.set = function (fieldToAdd, value){
        if(typeof fieldToAdd != 'object') {
            var field = {};
            field[0] = fieldToAdd.toLowerCase();
            field[1] = value;
            self.fields.push({
                key: field[0],
                value: field[1]
            });
        }
        else {
            for(var key in fieldToAdd) {
                if (fieldToAdd.hasOwnProperty(key)) {
                    self.fields.push({
                        key: key.toLowerCase(),
                        value: fieldToAdd[key]
                    });
                }
            }

        }
    };

    /**
     * Updating the status of the response
     * @param code - status to update
     * @returns {responseObject}
     */
    this.status = function (code) {
        this.statusCode = code;
        return this;
    };

    /**
     * return fields value
     * @param field
     * @returns {*} - field's value
     */
    this.get = function (field) {
        for (var find in this.fields){
            if (this.fields[find].key === field.toLowerCase()){
                return this.fields[find].value;
            }
        }
        //return this.fields[Object.keys(this.fields[find])[0]];
    };

    /**
     * Inserting cookie header
     * @param name of cookie
     * @param value of cookie
     * @param options of cookie
     */
    this.cookie = function (name, value, options) {
        var cookie = name + "=";
        if (typeof value === "string") {
             cookie += value;
        }
        else {
            cookie += JSON.stringify(value);
        }
        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                cookie += "; " + option + "=" + options[option];
            }
        }
        this.set("Set-Cookie", cookie);
    };

    /**
     * Building a pre-body response
     * @returns {string}
     */
    this.build = function(){
        var statMess= {
            400: 'Bad Request',
            505: 'HTTP Version Not Supported',
            404: 'Not Found',
            415: 'Unsupported Media Type',
            500: 'Internal Server Error',
            200: 'OK',
            403: 'Forbidden',
            405: 'Method Not Allowed'
        };
        var responseString = "\r\n" + this.version.toUpperCase() + " " +
            this.statusCode +' ' + statMess[this.statusCode]+ "\r\n";
        for (var field in this.fields) {
            if(this.fields.hasOwnProperty(field) && typeof this.fields[field].value !== "undefined") {
                responseString += this.fields[field].key + ": " + this.fields[field].value + "\r\n";
            }
        }
        return responseString;

    };

    /**
     * Sends the body to socket, as a part of the response
     * @param body - to return as response
     */
    this.send = function (body){
        //there is no body
        if(arguments.length==0 || typeof body=='undefined' ){
            this.socket.write(this.build() + "\r\n");
            this.socket.sendCalled = true;
        }
        //the given argument is object
        else if(typeof body === "object"){
            this.json(body);
        }

        else{
            //set content length
            this.set('Content-Length', body.length);

            //set type
            if (this.get("Content-Type") !== "application/json") {
                this.set('Content-Type', 'text/html');
            }

            if (!this.socket.writable) {
                return;
            }
            this.socket.write(this.build() + "\r\n" + body);
            this.socket.sendCalled = true;
        }
    };
    /**
     * This function is responsible for sending a file in socket as response
     * @param path
     */
    this.sendFile = function (path) {

        if (!this.socket.writable) {
            return;
        }

        //create pipe to send the file
        this.socket.write(this.build());
        this.socket.write("\r\n");
        this.socket.sendCalled = true;
        var fileAsAstream = fs.createReadStream(path);
        fileAsAstream.pipe(this.socket, {end: false});
    };

    /**
     *  Sends a body of json type to socket, as a part of the response
     * @param body - to return as response
     */
    this.json = function (body)
    {
        if (typeof body === "object"){
            this.set("Content-Type", "application/json");
            this.send(JSON.stringify(body));
        }
        else{
            this.send(body);
        }
    }

};

exports.responseObject = responseObject;