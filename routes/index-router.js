var express = require('express');
var router = express.Router();
var News = require('../models/news-models'),
    User = require('../models/user-models'),
    Message=require('../models/message-models');

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

router.get('/count/user',function(req, res) {
    User.count(function(err, total) {
        if(err) {
            console.log(err);
        } else {
            res.jsonp({totalItems:total});
        }
    });
});

router.post('/user/toggle',function(req, res) {
    User.updateStatus(req.body._id, req.body.status, function(err) {
        console.log(req.body.status);
        if (err) {
            return res.jsonp({ result: 'error', message: "修改失败"})
        } else {
            res.jsonp({ result:'success' , message: "修改成功"})
        }
    });
});

router.post('/user/remove',function(req, res) {
    User.remove(req.body.id, function(err,data) {
        console.log(data);
        if (err) {
            return res.jsonp({ result: 'error' , message: "删除用户失败"});
        } else if(data){
            res.jsonp({ result: "success" , message: "删除用户成功"});
        } else {
            res.jsonp({ result: "error" , message: "id is not found"});
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
    newUser.save(function (err) {
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
        News.getAll(skip,pageSize, function(err,news){
            if(err){
                console.log('error');
            }else{
                res.jsonp(news);
            }
        });
    }
});

router.post('/news',function(req,res){
    var newNews = new News({
        name: req.body.name,
        title:req.body.title,
        content: req.body.content
    });
    newNews.save(function(err,news){
        if (err) {
            return res.jsonp({result: 'error', message: "修改新闻失败"});
        } else {
            res.jsonp({result: 'success', message: "修改新闻成功"});
        }
    });
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

router.get('/news/:id',function(req,res){
  News.get(req.params.id,function(err,news){
    if(err){
      console.log(err);
    }
    res.jsonp(news);
  });
});

router.post('/news/update',function(req,res) {
    News.update(req.body.id, req.body.title, req.body.name, req.body.content, function (err) {
        if (err) {
            return res.jsonp({result: 'error', message: "修改新闻失败"});
        } else {
            res.jsonp({result: 'success', message: "修改新闻成功"});
        }
    });
});

router.post('/news/remove', function(req,res) {
    News.remove(req.body.id, function(err) {
        if (err) {
            return res.jsonp({ result: 'error' , message: "删除新闻失败"});
        } else {
            res.jsonp({ result: "success" , message: "删除新闻成功"});
        }
    });
});

router.post('/message',function(req,res){
    var newMessage = new Message({
        name: req.body.name,
        content: req.body.content
    });
    newMessage.save(function(err){
        if (err) {
            return res.jsonp({ result: "error", message: err});
        }
        res.jsonp({ result:'success', message:'添加成功!'});
    });
});

router.get('/message',function(req, res){
    var skip = req.query.skip || 0;
    var pageSize = req.query.pageSize || 10;
    Message.getAll(skip, pageSize, function(err,message){
        if(err){
            console.log(err);
        }else{
            res.jsonp(message);
        }
    });
});

router.get('/count/message', function(req,res) {
    Message.count(function(err,total) {
        if(err) {
            console.log(err);
        } else {
            res.jsonp({totalItems:total});
        }
    })
});

router.post('/message/remove',function(req, res) {
    Message.remove(req.body.id, function(err) {
        if (err) {
            return res.jsonp({ result: 'error' , message: "删除留言失败"});
        } else {
            res.jsonp({ result: "success" , message: "删除留言成功"});
        }
    });
});

router.get('/news-editor', function(req,res) {
    res.render('news-editor', { title: 'Express' });
})

module.exports = router;
