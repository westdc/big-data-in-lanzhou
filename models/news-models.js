/**
 * Created by maxd on 15-9-16.
 */
var mongoose = require('./db');

var newsSchema = new mongoose.Schema({
    name:String,
    title: String,
    content: String,
    createAt:{ type: Date, default: Date.now },
});

var NewsModel = mongoose.model('News', newsSchema);

function News(news) {
    this.name = news.name;
    this.title = news.title;
    this.content = news.content;
};

News.prototype.save=function(callback){
    var news={
        name:this.name,
        title:this.title,
        content:this.content
    };
    var newNews=new NewsModel(news);
    newNews.save(function(err,news){
        if(err){
            return callback(err);
        }else{
            callback(null, news);
        }
    });
};

News.getAll = function (skip,pageSize,callback) {
    NewsModel.find().skip(skip).limit(pageSize).sort({createAt: -1}).exec(function(err,news){
        if (err) {
            return callback(err);
        }
        callback(null,news);
    });
};

News.count = function(callback) {
    NewsModel.count().exec(function(err,total) {
       if(err) {
           return callback(err);
       }
        callback(null,total);
    });
};


News.getLast = function (num, callback) {
    NewsModel.find().limit(num).sort({createAt: -1}).exec(function(err,newss){
        if (err) {
            return callback(err);
        }
        callback(null,newss);
    });
};



News.get=function(_id,callback){
    NewsModel.findOne({_id:_id},function(err,news){
      if(err){
          return callback(err);
      }
      callback(null,news);
  });
};

News.update = function(news, callback) {
    NewsModel.findOneAndUpdate({_id:news._id},{ $set: {title:news.title,name:news.name,content:news.content}}).exec(function (err, n) {
        if (err) {
            return callback(err);
        }
        callback(null,n);
    });
};

News.remove = function(id, callback) {
    NewsModel.where({_id:id}).findOneAndRemove().exec(function(err, newss) {
        if (err){
            return callback(err);
        }
        callback(null, newss);
    });
};


module.exports = News;
