var express = require('express');
var router = express.Router();
var News = require('../models/news')

router.get('/last', function(req, res) {
  News.getAll(null,function(err, news) {
    if (err) {
      console.log('error');
    }
    res.jsonp(news);
  });
});

router.get('/:id',function(req,res){
  News.get(req.params.id,function(err,news){
    if(err){
      console.log(err);
    }
    res.jsonp(news);
  });
});


module.exports = router;
