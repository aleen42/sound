/***********************************************************************
 *                                                                   _
 *       _____  _                           ____  _                 |_|
 *      |  _  |/ \   ____  ____ __ ___     / ___\/ \   __   _  ____  _
 *      | |_| || |  / __ \/ __ \\ '_  \ _ / /    | |___\ \ | |/ __ \| |
 *      |  _  || |__. ___/. ___/| | | ||_|\ \___ |  _  | |_| |. ___/| |
 *      |_/ \_|\___/\____|\____||_| |_|    \____/|_| |_|_____|\____||_|
 *
 *      ================================================================
 *                 More than a coder, More than a designer
 *      ================================================================
 *
 *
 *      - Document: server.js
 *      - Author: aleen42
 *      - Description: a script for create a server.
 *      - Create Time: Aug 25th, 2016
 *      - Update Time: Aug 26th, 2016
 *
 *
 **********************************************************************/

var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var port = process.argv[2] || 9000;

http.createServer(function(request, response) {
    var uri = decodeURI(url.parse(request.url).pathname);
    var filename = path.join(process.cwd(), uri);

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}).listen(parseInt(port, 10));

console.log('Listening at\n  => http://localhost:' + port + '/\nCTRL + C to shutdown');
