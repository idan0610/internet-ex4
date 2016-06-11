/**
 * Created by owner on 18/01/2016.
 */

/**
 * The request Object
 * @param _method - the request's method
 * @param _version - the request's version
 * @param _path - the request's path
 * @param _protocol - the request's protocol
 * @param _body - the request's body
 * @param _fields - the request's fields
 * @param _host - the request'shost
 * @param _cookies - the request's cookies
 * @param _query - the request's query
 * @param _connection - the request's connection
 */
var requestObject = function() {
    this.method = "";
    this.version = "";
    this.path = "";
    this.protocol = "";
    this.body = "";
    this.host = "";
    this.cookies =  {};
    this.query = {};
    this.connection = "";
    this.contentLength = 0;
    this.params = {};
    this.resource = "";
    this.href = "";
    this.fields = [];
    this.endOfHeaders = false;

    /**
     * @param field
     * @returns {*} - field's value
     */
    this.get = function (field){
        for (var obj in this.fields){
            if (this.fields.hasOwnProperty(obj) && this.fields[obj].key === field){
                break;
            }
        }
        return this.fields[obj].value;
    };

    /**
     * returns the the value of a given field.
     * If the field does not exist, the defaultValue is called.
     * If defaultValue is not provided it defaulted as null.
     * @param name - field to return its value.
     * @param defaultValue - called if the field does not exist,it defaulted as null.
     * @returns {*} - The value of a given field or defaultValue.
     */
    this.param = function (name, defaultValue){
        if (defaultValue === "undefined"){
            defaultValue = null;
        }

        if (name in this.params) {
            return this.params[name];
        }

        if (name in this.query) {
            return this.query[name];
        }

        return defaultValue;
    };

    /**
     * Declares whether a type of the request is supported or not.
     * @param type - type to check if supported.
     * @returns {boolean} true iff the type of the request is supported.
     */
    this.is = function (type){
        var case1 = /^\w+$/i;
        var case2 = /^\w+\/\w+$/i;
        var case3 = /^\w+\/\*$/i;
        var content = this.get("Content-Type").split("/");
        if(content[1].indexOf(";") !== -1){
            content[1] = content[1].slice(0, content[1].indexOf(";"));
        }
        if(case1.test(type) && type === content[1]) {
            return true;
        }
        if (case2.test(type) && type === content[0] + "/" + content[1]){
            return true;
        }

        if (case3.test(type) && type === content[0] + "/*"){
            return true;
        }

        return false;
    }


};

exports.requestObject = requestObject;