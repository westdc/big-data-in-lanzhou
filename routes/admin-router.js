var express = require('express');
var router = express.Router();
//var News = require('../models/news');

router.get('/', function(req, res) {
  res.render('admin');
});

router.get('/news-editor', function(req,res) {
  res.render('news-editor', { title: 'Express' });
});


module.exports = router;
