var express = require('express');
var router = express.Router();

var md = require("node-markdown").Markdown;

var News = require('../models/news-models'),
    User = require('../models/user-models').User,
    UserModel = require('../models/user-models').UserModel,
    Message=require('../models/message-models');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/user',function(req, res){
  var skip = req.query.skip || 0;
  var pageSize = req.query.pageSize || 10;
    var keyword=req.query.keyword || '';

    console.log(keyword);
  User.getAll(skip, pageSize,keyword, function(err,users){
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
    User.remove(req.body._id, function(err) {
        if (err) {
            return res.jsonp({ result: 'error' , message: "删除用户失败"});
        } else {
            res.jsonp({ result: "success" , message: "删除用户成功"});
        }
    });
});

router.post('/user', function (req, res) {
    UserModel.register(new UserModel({ username : req.body.email, name: req.body.name }), req.body.password, function(err) {
        if (err) {
            return res.jsonp({ result: "error", message: err});
        }
        res.jsonp({ result:'success', message:'注册成功!'});
    });
});

router.post('/login', function(req, res) {
    res.jsonp({ result: 'success', message: '登陆成功!'});
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
        var keyword = req.query.keyword || '';
        News.getAll(skip, pageSize, keyword, function(err,news){
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
        title:req.body.title,
        content: md(req.body.text)
    });
    newNews.save(function(err,news){
        if (err) {
            return res.jsonp({result: 'error', message: "修改新闻失败"});
        } else {
            res.redirect('/admin#/news-manage');
            //res.jsonp({result: 'success', message: "修改新闻成功"});
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
    News.update(req.body.news, function (err) {
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

var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb) {
        console.log("fileFilter:"+ file.originalname);
        var name = file.originalname;
        var exts = ['.jpg','.png','.gif'];
        for(var ext in exts) {
            if(name.indexOf(ext, name.length - ext.length) === -1) {
                cb(null,false);
                break;
            }
        }
        cb(null,true);
    }
});

router.post('/upload', upload.single('upload'),function(req,res){

    res.set('Content-Type', 'text/plain');
    if(req.file) {
        res.send('/uploads/'+req.file.filename);
    } else {
        res.send('UPLOAD_TYPE_ERROR');
    }
});

module.exports = router;
