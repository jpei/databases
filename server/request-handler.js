/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var url = require('url');
var fs = require('fs');
var path = require('path');

var readRooms = function() {
  fs.readFile('roomlist.txt', function(err, data) {
    if (err) {
      fs.writeFile('roomlist.txt', '');
    } else {
      var arr = data.toString().split(',');
      arr.forEach(function(item) {
        roomList[item] = true;
      });
    }
  });
};

var roomList = {};
readRooms();

var id = 1;

var actions = {
  'GET': function(request, response, roomname) {
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    // var roomname = roomname || 'room1';
    headers['Content-Type'] = 'application/json';
    response.writeHead(statusCode, headers);
    if (!roomList[roomname]) {
      //no results
      response.end(JSON.stringify({results:[]}));
    } else {
      //request.query
      readMessages(roomname, response);
    }
  },
  'POST': function(request, response, roomname) {
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      storeMessage(body, roomname, response);
    });
  },
  'OPTIONS': function(request, response, roomname) {
    // The outgoing status.
    var statusCode = 200;

    // See the note below about CORS headers.
    var headers = defaultCorsHeaders;

    // Tell the client we are sending them plain text.
    //
    // You will need to change this if you are sending something
    // other than plain text, like JSON or HTML.
    headers['Content-Type'] = "text/plain";
    // headers['Content-Type'] = 'application/json';

    // .writeHead() writes to the request line and headers of the response,
    // which includes the status and all headers.
    response.writeHead(statusCode, headers);

    // Make sure to always call response.end() - Node may not send
    // anything back to the client until you do. The string you pass to
    // response.end() will be the body of the response - i.e. what shows
    // up in the browser.
    //
    // Calling .end "flushes" the response's internal buffer, forcing
    // node to actually send all the data over to the client.
    response.end("Hello, World!");
  }
};

exports.requestHandler = function(request, response) {
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log("Serving request type " + request.method + " for url " + request.url);

  var parsedUrl = url.parse(request.url);// || url.parse(request.uri);
  var pathname = parsedUrl.pathname;
  var roomname = pathname.slice(9) || 'lobby';

  if(pathname.slice(0,9) !== '/classes/' || pathname === '/classes')
  {
    var statusCode = 404;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = "text/plain";
    response.writeHead(statusCode, headers);
    response.end("Error: File not Found.");
  } else {
    var action = actions[request.method];  
    if (action) {
      action(request, response, roomname);
    } else {}//todo
  }
};

var readMessages = function(roomname, response) {
  console.log(path.join(__dirname, '/storage/', roomname + '.txt'));
  fs.readFile(path.join(__dirname, '/storage/', roomname + '.txt'), function(err, data) {
    if (err) throw err;
    response.end('{"results":['+data+']}');
  });
};

var storeMessage = function(body, roomname, response) {
  message = JSON.parse(body);
  var timestamp = new Date().toString();
  message.updatedAt = message.createdAt = timestamp;
  message.objectId = id++;
  // console.log(roomname);
  if(!roomList[roomname]) {
    // add room to roomlist.txt
    roomList[roomname] = true;
    fs.appendFile('roomlist.txt', roomname + ',', function(err) {
      if (err) throw err;
    });
    // post to room
    fs.writeFile(path.join(__dirname, '/storage/', roomname + '.txt'), JSON.stringify(message), function(err) {
      if (err) throw err;
      var statusCode = 201;
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = "text/plain";
      response.writeHead(statusCode, headers);
      response.end("File Created");
    });
  } else {
    // append message 
    fs.appendFile(path.join(__dirname, '/storage/', roomname + '.txt'), ','+JSON.stringify(message), function(err) {
      if (err) throw err;
      var statusCode = 201;
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = "text/plain";
      response.writeHead(statusCode, headers);
      response.end("Message Appended to File");
    });
  }
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "X-Parse-Application-Id, X-Parse-REST-API-Key, content-type, accept",
  "access-control-max-age": 10 // Seconds.
};

