var express = require('express');
var router = express.Router();
//var News = require('../models/news');

router.get('/', function(req, res) {
  res.render('admin');
});

module.exports = router;
