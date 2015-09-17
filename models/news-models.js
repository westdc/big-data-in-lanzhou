/**
 * Created by maxd on 15-9-16.
 */
var mongoose = require('./db');

var newsSchema = new mongoose.Schema({
    name:String,
    title: String,
    content: String
});

var NewsModel = mongoose.model('News', newsSchema);

function News(news) {
    this.name = news.name;
    this.title = news.title;
    this.content = news.content;
};

News.getAll = function (page,pageSize,callback) {
    var s = (page-1) * pageSize;
    NewsModel.find().skip(s).limit(pageSize).exec(function(err,total){
        if (err) {
            return callback(err);
        }
        callback(null,total);
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


News.getLast = function (num, callback) {
    NewsModel.find().limit(num).sort({name: 1}).exec(function(err,newss){
        if (err) {
            return callback(err);
        }
        callback(null,newss);
    });
};


module.exports = News;
