var express = require('express');
var router = express.Router();
var News = require('../models/news-models'),
    User = require('../models/user-models');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/user',function(req, res){
  var skip = req.query.skip || 0;
  var pageSize = req.query.pageSize || 10;
  User.getAll(skip, pageSize, function(err,users){
    if(err){
      console.log('error');
    }else{
      res.jsonp(users);
      }
  });
});

router.post('/user', function (req, res) {
  var newUser = new User({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password
  });
  User.get(newUser.email, function (err, user) {
    if (err) {
      return res.jsonp({ result: 'error', message: err});
    }
    if (user) {
      return res.jsonp({ result: 'error', message: '邮箱已注册!'});
    }
    newUser.save(function (err, user) {
      if (err) {
        return res.jsonp({ result: "error", message: err});
      }
      res.jsonp({ result:'success', message:'注册成功!'});
    });
  });
});

router.post('/login', function (req, res) {
  User.get(req.body.email, function (err, user) {
    if (!user) {
      return res.jsonp({ result: 'error', message: '用户不存在!' })
    }
    if (!User.authenticate(user.password, req.body.password)) {
      return res.jsonp({ result: 'error', message: '密码错误!' })
    }
    res.jsonp({ result: 'success', message: '登陆成功!'})
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

router.get('/news',function(req,res){
  var last = req.query.last || false;
  var num = req.query.num || 3;
  if(last) {
    News.getLast(num, function(err, news) {
      if(err) {
        console.log(err);
      } else {
        res.jsonp(news);
      }
    });
  } else {
    var skip = req.query.skip || 0;
    var pageSize = req.query.pageSize || 10;
    News.getAll(skip, pageSize, function(err,news){
      if(err){
        console.log('error');
      }else{
        res.jsonp(news);
      }
    });
  }
});

router.get('/count/news', function(req,res) {
  News.count(function(err,total) {
    if(err) {
      console.log(err);
    } else {
      res.jsonp({totalItems:total});
    }
  })
});

router.get('/count/user',function(req, res) {
  User.count(function(err, total) {
    if(err) {
      console.log(err);
    } else {
      res.jsonp({totalItems:total});
    }
  });
});

router.get('/paging/:page/:pageSize',function(req,res) {
    News.getAll(req.params.page, req.params.pageSize,function (err, news) {
      if (err) {
        console.log(err);
      } else {
        res.jsonp(news);
      }
    });

  });

router.post('/user/toggle',function(res, req) {
    User.updateStatus(req.body.user, function(err) {
        if (err) {
            return res.jsonp({ result: 'error', message: "修改失败"})
        } else {
            res.jsonp({result:'success' , message: "修改成功"})
        }
    })
})

module.exports = router;
