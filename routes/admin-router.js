var express = require('express');
var router = express.Router();
//var News = require('../models/news');

router.get('/', function(req, res) {
  res.render('admin');
});

router.get('/news-editor', function(req,res) {
  var id = req.query.id;
  var n = {};
  if(id) {
    News.get(req.query.id, function(err,news) {
      if(err){
        console.log(err);
      }
      n = news
    })
  }

  res.render('news-editor', { n: n });
});


module.exports = router;
