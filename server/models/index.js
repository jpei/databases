var db = require('../db');

var connection = db.dbConnection;

// Calls DB, called by Controllers

module.exports = {
  messages: {
    get: function (username, roomname, callback) {
      var queryString = 'SELECT * FROM messages;';
      connection.query(queryString, function(err, results) {
        results = results.map(function(obj){
          return {username: obj.userId, text: obj.text};
        })
        callback(JSON.stringify({results:results}));
      });
    }, // a function which produces all the messages
    post: function (request, response, callback) {
      var queryString = 'insert into Messages (text) VALUES ("hello");'
      connection.query(queryString, callback);
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function () {},
    post: function () {}
  }
};

