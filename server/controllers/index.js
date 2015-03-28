var models = require('../models');
var bluebird = require('bluebird');
var url = require('url');
var path = require('path');

// Calls Models, called by Router

module.exports = {
  messages: {
    // Calls Models with Query (Which Room) and Callback/Promise
    // a function which handles a get request for all messages
    get: function (req, res) {
      console.log("Serving request type " + req.method + " for url " + req.url);

      var parsedUrl = url.parse(req.url);
      var pathname = parsedUrl.pathname;
      var roomname = pathname.slice(9) || 'lobby';

      models.messages.get(roomname, function(data){
        res.json(data);
      });
    }, 
    // a function which handles posting a message to the database
    post: function (req, res) {
      module.exports.users.post(req, res, function(id) {
        // right now our request has a username instead of userid field
        delete req.body.username;
        req.body.userId = id;
        req.body.message = req.body.message || req.body.text;
        models.messages.post(req, res, function(err, success) {
          if (err) {
            console.log('option 1');
            res.sendStatus(400);
          } else {
            res.sendStatus(201);
          }
        });
      });
    } 
  },

  group: {
    get: function (req, res, callback, group) { // Gets All
      callback(models[group].get());
    },
    post: function (req, res, callback, group) { // New User
      var groupName = req.body[group.substr(0, group.length-1)+'name'];
      models[group].getOne(groupName, function(id){
        if (id < 0){
          models[group].post(groupName, function(err, success){
            if (err) {
              console.log('option 2 ', err);
              res.sendStatus(400);
            } else models[group].getOne(groupName, function(id) {
              callback(id);
            });
          });    
        } else {
          callback(id);
        }
      });
    }
  },

  rooms: {
    get: function (req, res, callback) { // Gets All
      module.exports.group.get(req, res, callback, 'rooms');
    },
    post: function (req, res, callback) { // New User
      module.exports.group.post(req, res, callback, 'rooms');
    }
  },

  users: {
    get: function (req, res, callback) { // Gets All
      module.exports.group.get(req, res, callback, 'users');
    },
    post: function (req, res, callback) { // New User
      module.exports.group.post(req, res, callback, 'users');
    }
  }
};
