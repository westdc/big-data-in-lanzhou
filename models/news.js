/**
 * Created by maxd on 15-9-16.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://192.168.0.50/big_data_in_lanzhou');

var newsSchema = new mongoose.Schema({
    name:String,
    title: String,
    content: String
},{
    collection:'news'
});

var newsModel = mongoose.model('News', newsSchema);

function News(news) {
    this.name = news.name;
    this.title = news.title;
    this.content = news.content;
};


module.exports = News;


News.getAll = function (name, callback) {
    newsModel.find('news',function(err,newss){
            if (err) {
                return callback(err);//失败！返回 err
            }
            callback(null,newss);//成功！以数组形式返回查询的结果
        });
};


News.get=function(_id,callback){
  newsModel.findOne({_id:_id},function(err,news){
      if(err){
          return callback(err);
      }
      callback(null,news);
  });
};


News.getLast = function (name, callback) {
    newsModel.find('news').limit(5).sort({name: 1}).exec(function(err,newss){
        if (err) {
            return callback(err);//失败！返回 err
        }
        callback(null,newss);//成功！以数组形式返回查询的结果
    });
};
