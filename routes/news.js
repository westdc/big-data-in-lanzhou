var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.jsonp([
    {
      title:'aaaaaa'
    },
    {
      title: 'bbbbbbbbbbb'
    },
    {
      title: 'ccccccccccc'
    }
  ]);
});

module.exports = router;
