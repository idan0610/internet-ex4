/**
 * Created by owner on 19/01/2016.
 */
/*
 tester which tests our web-server's core functionality, including
 reviving and shutting it down
 */
var HOST = 'localhost';
var PORT = 8080;

var passed_counter = 0;
var failed_counter = 0;
var test_counter = 0;
var index = 0;
var timeout = 200;
var DEBUG = true;
var http = require('http');
var net = require('net');
http.globalAgent.maxSockets = 250;
var hujiwebserver = require('./hujiwebserver');
//work on server
var server = hujiwebserver.start(PORT, function(err) {

    // check if there were errors in revivng the server
    if (err) {
        console.log("test failed : could not revive server " + err);
        return;
    }
});

console.log("server successfully listening to port " + PORT);
console.log("starting test");

// register of all routes relevant for testing.
server.use("/", function(request, response, next) {
    if (request.path === "/") {
        response.send("Hello World!");
    }
    next();
});

server.use("/params/:param1/text/:param2", function(request, response, next) {
    response.send(request.params);
});

server.use("/lala", hujiwebserver.static("www"));

server.use("/exception", function (request, response, next) {
    throw new Error("Stam");
});

server.use("/query", function (request, response, next) {
    response.send(request.query);
});

server.use("/is", function (request, response, next) {
    response.send(request.is("html"));
});

server.use("/get", function(request, response, next) {
    response.send(request.get("Host"));
});

server.use("/body", function(request, response, next) {
    response.send(request.body);
});

setTimeout(function() {
    //server.stop();
    console.log("server shutdown")
}, 5000);
run_server_tests(); // start running test



/*
 * send a msg to the server with options and making sure the response is as expected
 *
 * options = {
 *              path:<path>,
 *              method:<method>,
 *              data:<data>,
 *              test_name:<test name>
 *            }
 * expected = {
 *              status:<status>,
 *              data:<data>
 *             }
 */
function single_server_test(options, expected) {
    var req_options = {
        hostname: HOST,
        port: PORT,
        path: options.path,
        method: options.method
    };


    // check if http request test should be sent with some headers
    if (options.headers) {
        req_options.headers = options.headers;
    }

    // send the http request test to the server
    var req = http.request(req_options, function(res) {
        var buffer = '';
        res.setEncoding('utf8');
        // accumulating the http response body
        res.on('data', function(chunk) {
            buffer += chunk;
        });

        // upon receiving the whole http repponse
        res.on('end', function() {
            test_counter++;
            res.buffer = buffer;


            // check if we pass the relevant test - namely what expected is what we got
            if (res.statusCode != expected.status || (expected.data && (expected.data != buffer)) ||
                (expected.func && !expected.func(res))) {

                console.warn("test #" + test_counter + ":  " + options.test_name + " ... FAILED");
                failed_counter++;

                // in case, we're in DEBUG mode show more details why the test failed.
                if (DEBUG) {
                    console.warn("--------------------------------------------------");

                    // check if http response status is not what we expected.
                    if (res.statusCode != expected.status) {
                        console.warn("got ", res.statusCode, " but expected", expected.status);
                    }

                    // check if http response body is not what we expected.
                    if (buffer != expected.data) {
                        console.warn("got ", buffer, " but expected", expected.data);
                    }

                    if (expected.func && !expected.func(res)) {
                        console.warn("func failed");
                        console.warn(expected.func.toString());
                    }
                    console.warn("--------------------------------------------------");
                }

                // current test succeeded
            } else {
                console.log("test #" + test_counter + ":  " + options.test_name + " ... PASSED");
                passed_counter++;
            }

            // check if it's the last test to run, and if so show total tester results.
            if (test_counter >= test_l.length) {
                report_test_results();
            }
        });

    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    if (options.data) {
        req.write(options.data);
    }
    req.end();

    // running the next test in our tester
    if (index < test_l.length - 1) {
        index += 1;
        setTimeout(function() {
            single_server_test(test_l[index].options, test_l[index].expected)
        }, 10);
    }
}

/**
 * dumps to STDOUT the testing results.
 */
function report_test_results() {
    console.log("--------------------------------------------------");
    console.log("total of ", passed_counter, "/", passed_counter + failed_counter, " tests were passed");
    console.log("--------------------------------------------------");
}


/**
 * running the tester with all the tests in test_l on the server.
 */
function run_server_tests() {
    setTimeout(function() {
        single_server_test(test_l[index].options, test_l[index].expected)
    }, 1000);
}

// array of all the tests that we're running on the server
var test_l = [
    {
        options: {
            path:"/exception",
            method:"GET",
            test_name:"testing resource throws exception"
        },
        expected:{
            status:500,
            data:"Server Error"
        }
    },
    {
        options: {
            path:"/lala/../index.html",
            method:"GET",
            test_name:"testing static forbidden request"
        },
        expected:{
            status:403,
            data:"Cannot access to file"
        }
    },
    {
        options: {
            path:"/query?param1=value1&param2=value2",
            method:"GET",
            test_name:"testing query params"
        },
        expected:{
            status:200,
            data:"{\"param1\":\"value1\",\"param2\":\"value2\"}"
        }
    },
    {
        options: {
            path:"/params/value1/text/value2",
            method:"GET",
            test_name:"testing params"
        },
        expected:{
            status:200,
            data:"{\"param1\":\"value1\",\"param2\":\"value2\"}"
        }
    },
    {
        options: {
            path:"/params/value1",
            method:"GET",
            test_name:"testing resource does not exist"
        },
        expected:{
            status:404,
            data:"The requested resource not found"
        }
    },
    {
        options: {
            path:"/is",
            method:"POST",
            test_name:"testing request.is function",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":"html".length },
            data:"html"
        },
        expected:{
            status:200,
            data:"true"
        }
    },
    {
        options: {
            path:"/get",
            method:"GET",
            test_name:"testing request.get function"
        },
        expected:{
            status:200,
            data:"localhost:8080"
        }
    },
    {
        options: {
            path:"/lala/index.html",
            method:"GET",
            test_name:"testing static request"
        },
        expected:{
            status:200,
            data:"<HTML>\r\n<HEAD>\r\n<title>ex 2 </title>\r\n\r\n<LINK rel=\"stylesheet\" type = \"text/css\" href=\"style.css\"></LINK>\r\n\r\n</HEAD>\r\n<BODY>\r\n\t<SCRIPT src = 'main.js'></SCRIPT>\r\n</BODY>\r\n\r\n</HTML>"
        }
    },
    {
        options: {
            path:"/body",
            method:"POST",
            test_name:"testing request.body",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":"Hello!\r\nIt's me!".length },
            data:"Hello!\r\nIt's me!"
        },
        expected:{
            status:200,
            data:"Hello!\r\nIt's me!"
        }
    },
    {
        options: {
            path:"/body/another",
            method:"GET",
            test_name:"testing requesting resource longer then the one exist",
            headers:{"Content-Type": "text/html; charset=utf-8", "Content-Length":"Hello! It's me!".length },
            data:"Hello! It's me!"
        },
        expected:{
            status:200,
            data:"Hello! It's me!"
        }
    },

];