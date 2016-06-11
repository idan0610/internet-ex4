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
    response.send("Hello World!");
});

setTimeout(function() {
    server.stop();
    console.log("server shutdown")
}, 5000);
for(var i = 0; i < 10000; i++) {
    run_server_tests(); // start running test
}


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
    console.log("SUCCESS!");
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
            path:"/",
            method:"GET",
            test_name:"test loading"
        },
        expected:{
            status:200,
            data:"Hello World!"
        }
    },
];