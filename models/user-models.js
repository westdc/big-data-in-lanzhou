/**
 * Created by maxd on 15-9-17.
 */
var crypto = require('crypto');
var mongoose = require('./db');

var userSchema = new mongoose.Schema({
    email: String,
    name:String,
    password: String
},{
    collection:'users'
});

var userModel = mongoose.model('User', userSchema);

function User(user) {
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    var user = {
        email: this.email,
        name: this.name,
        password: this.password
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
User.get = function(email, callback) {
    userModel.findOne({email:email}, function (err, user)
    {
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};