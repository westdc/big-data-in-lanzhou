/**
 * Created by maxd on 15-9-17.
 */
var crypto = require('crypto');
var mongoose = require('./db');

var userSchema = new mongoose.Schema({
    name:String,
    password: String,
    email: String
},{
    collection:'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5');
    email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    };
    //打开数据库
    var newUser = new userModel(user);

    newUser.save(function(err, user){
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};

//读取用户信息
User.get = function(name, callback) {
    userModel.findOne({name:name}, function (err, user)
    {
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};