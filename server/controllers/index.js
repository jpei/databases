var bluebird = require('bluebird');
var url = require('url');
var path = require('path');
var _ = require('underscore');

var db = require('../db');
var User = db.User;
var Message = db.Message;

module.exports = {
  messages: {
    get: function(req, res) {
      var query = url.parse(req.url, true).query;
      console.log('Query: ', JSON.stringify(query));
      var queryObj = {include: [User]};
      if (query['where[roomname]']) {
        queryObj.where = {roomname: query['where[roomname]']};
      }
      console.log('QueryObj: ', JSON.stringify(queryObj.where));
      Message.findAll(queryObj)
        .complete(function(err, results){
          if (err) {
            console.log('Get Message Err: ', err);
          } else {
            _.each(results, function(result) { // Grab username from with User object
              result.dataValues.username = result.dataValues.User ? result.dataValues.User.username : 'Anon';
              delete result.dataValues.User;
            });
            res.json({results:results});
          }
        });
    },
    post: function(req, res) {
      // console.log('body: ', req.body);
      // console.log('username: ', req.body.username);
      req.body.text = req.body.text || req.body.message;
      User.findOrCreate({where: {username: req.body.username}})
        .complete(function(err, user){
          var params = {
            text: req.body.text, 
            UserId: user[0].id,
            roomname: req.body.roomname
          };
          Message.create(params)
            .complete(function(err, results){
              res.sendStatus(201);
            })
        })
    }
  },
  users: {
    get: function(req, res) {
      User.findAll()
        .complete(function(err, results){
          res.json(results);
        });
    },
    post: function(req, res) {
      User.create({username: req.body.username})
        .complete(function(err, user){
          res.sendStatus(201);
        })
    }
  }
}