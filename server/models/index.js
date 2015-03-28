var db = require('../db');

var connection = db.dbConnection;

// Calls DB, called by Controllers

module.exports = {
  messages: {
    get: function (username, roomname, callback) {
      var queryString = 'SELECT * FROM messages;';
      connection.query(queryString, function(err, results) {
        // results = results.map(function(obj){
        //   return {username: obj.userId, text: obj.text};
        // // })
        // results.forEach(function(result){
        //   result.text = result.text;
        // })
        module.exports.users.get(function(userTable) {
          // Use userTable to convert userId to username

          results.forEach(function(obj) {
            obj.username = userTable[obj.userId - 1] ? userTable[obj.userId - 1].name : 'Anon';
          });
          callback(JSON.stringify({results:results}));
        });
      });
    }, // a function which produces all the messages
    post: function (request, response, callback) {
      var queryString = 'insert into Messages (text, userId) VALUES ("'+request.body.message+'", '+request.body.userId+');'
      connection.query(queryString, callback);
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    getOne: function(username, callback) {
      module.exports.users.get(function(results) { // Get One
        var foundAt = -1;
        for (var i = 0; i<results.length; i++) {
          if (results[i].name === username) {
            foundAt = results[i].id;
            break;
          }
        }
        callback(foundAt);
      });
    },


    get: function (callback) {
      var queryString = 'SELECT * FROM Users;';
      connection.query(queryString, function(err, userTable){
        if (err){
          console.log('Error on retrieving users');
        }  else {
          callback(userTable);
        }
      });
    },
    post: function (username, callback) {
      var queryString = 'insert into Users (name) value ("' + username + '");';
      connection.query(queryString, callback);
    }
  }
};

