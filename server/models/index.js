var db = require('../db');

var connection = db.dbConnection;

// Calls DB, called by Controllers

module.exports = {
  messages: {
    // a function which produces all the messages
    get: function (roomname, callback) {
      var queryString = 'select * from messages left outer join users on messages.userId = users.id;';
      // var queryString = 'SELECT * FROM messages;';
      connection.query(queryString, function(err, results) {
        results.forEach(function(obj) {
          obj.username = obj ? obj.name : 'Anon';
        });
        callback({results:results});
      });
    }, 
    // a function which can be used to insert a message into the database
    post: function (request, response, callback) {
      var queryString = 'insert into Messages (text, userId) VALUES ("'+request.body.message+'", '+request.body.userId+');'
      console.log("queryString :" + queryString);
      connection.query(queryString, callback);
    } 
  },

  group: {
    // Ditto as above.
    getOne: function(groupName, callback, group) {
      module.exports[group].get(function(results) { // Get One
        var foundAt = -1;
        for (var i = 0; i<results.length; i++) {
          if (results[i].name === groupName) {
            foundAt = results[i].id;
            break;
          }
        }
        callback(foundAt);
      });
    },
    get: function (callback, group) {
      console.log('group: ' + group);
      var queryString = 'SELECT * FROM ' + group + ';';
      connection.query(queryString, function(err, groupTable){
        if (err){
          console.log('Error on retrieving users');
        }  else {
          callback(groupTable);
        }
      });
    },
    post: function (groupName, callback, group) {
      console.log("group: " +group);
      var queryString = 'insert into '+group+' (name) values (?);';
      console.log("qs" + queryString);
      connection.query(queryString, [groupName], callback);
    }
  },

  rooms: {
    // Ditto as above.
    getOne: function(roomname, callback) {
      module.exports.group.getOne(roomname, callback, 'rooms');
    },

    get: function (callback) {
      module.exports.group.get(callback, 'rooms');
    },
    post: function (roomname, callback) {
      module.exports.group.get(roomname, callback, 'rooms');
    }
  },


  users: {
    // Ditto as above.
    getOne: function(username, callback) {
      module.exports.group.getOne(username, callback, 'users');
    },

    get: function (callback) {
      module.exports.group.get(callback, 'users');
    },
    post: function (username, callback) {
      module.exports.group.post(username, callback, 'users');
    }
  }
};

