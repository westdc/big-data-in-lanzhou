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


router.get('/news/:id',function(req,res){
  News.get(req.params.id,function(err,news){
    if(err){
      console.log(err);
    }
    res.jsonp(news);
  });
});

router.get('/news',function(req,res){
  var last = req.params.last;
  var num = req.params.num || 3;
  console.log(last);
  console.log(num);
  if(last) {
    News.getLast(num, function(err, news) {
      if(err) {
        console.log(err);
      } else {
        res.jsonp(news);
      }
    });
  } else {
    News.getAll(function(err,news){
      if(err){
        console.log('error');
      }else{
        res.jsonp(news);
      }
    });
  }

});


module.exports = router;
