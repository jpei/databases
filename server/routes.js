var controllers = require('./controllers');
var router = require('express').Router();

// Calls Controllers, Called by App

for (var route in controllers) {
  router.route("/" + route)
    .get(controllers[route].get)
    .post(controllers[route].post);
}

module.exports = router;

