var models = require('../models');
var bluebird = require('bluebird');
var url = require('url');
var path = require('path');

// Calls Models, called by Router

module.exports = {
  messages: {
    get: function (req, res) {
      console.log("Serving request type " + req.method + " for url " + req.url);

      var parsedUrl = url.parse(req.url);
      var pathname = parsedUrl.pathname;
      var roomname = pathname.slice(9) || 'lobby';

      models.messages.get("default", roomname, function(data){
        res.writeHead(200, {"Content-Type":"application/json"});
        console.log(data);
        res.end(data);
      })

      // Calls Models with Query (Which Room) and Callback/Promise
    }, // a function which handles a get request for all messages
    post: function (req, res) {


    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above

    // Post:
    // Step 1: Get Users to determine if user is unique, get userID
    // Step 2: Post User if necessary
    // Step 3: Post Message
    get: function (req, res) {},
    post: function (req, res) {}
  }
};

// setTimeout(models.messages.post(null, null, function(){}), 0);