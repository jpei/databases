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
        res.end(data);
      })

      // Calls Models with Query (Which Room) and Callback/Promise
    }, // a function which handles a get request for all messages
    post: function (req, res) {
      module.exports.users.post(req, res, function(id) {
        // right now our request has a username instead of userid field
        delete req.body.username;
        req.body.userId = id;
        req.body.message = req.body.message || req.body.text;
        models.messages.post(req, res, function(err, success) {
          if (err) {
            res.writeHead(400);
            res.end(err);
          } else {
            res.writeHead(201);
            res.end('Created');
          }
        });
      });

    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above

    // Post:
    // Step 1: Get Users to determine if user is unique, get userID
    // Step 2: Post User if necessary
    // Step 3: Post Message
    get: function (req, res) { // Gets All
      var users = models.users.get();

    },
    post: function (req, res, callback) { // New User
      var username = req.body.username;
      models.users.getOne(username, function(id){
        if (id < 0){
          models.users.post(username, function(err, success){
            if (err) {
              res.writeHead(400);
              res.end(err);
            } else models.users.getOne(username, function(id) {
              callback(id);
            });
          });    
        } else {
          callback(id);
        }
      });
    }
  }
};
