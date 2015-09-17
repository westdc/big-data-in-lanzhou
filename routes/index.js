var express = require('express');
var router = express.Router();
var News = require('../models/news')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/homepage', function(req, res, next) {
  res.render('homepage', { title: 'Express' });
});

router.get('/news/last', function(req, res) {
  News.getFive(null,function(err, news) {
    if (err) {
      console.log('error');
    }
    res.jsonp(news);
  });
});


router.get('/news/:id',function(req,res){
  News.get(req.params.id,function(err,news){
    if(err){
      console.log(err);
    }
    res.jsonp(news);
  });
});

module.exports = router;
