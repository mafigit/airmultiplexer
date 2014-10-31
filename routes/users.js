var express = require('express');
var router = express.Router();

var exec = require('child_process').exec;
/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});


module.exports = router;
