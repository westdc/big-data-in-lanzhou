/**
 * Created by maxd on 15-9-17.
 */
var crypto = require('crypto');
var mongoose = require('./db');
var md5 = crypto.createHash('md5');


var userSchema = new mongoose.Schema({
    email: String,
    name:String,
    password: String
});

var UserModel = mongoose.model('User', userSchema);

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
        password: md5.update(this.password).digest('hex')
    };
    //打开数据库
    var newUser = new UserModel(user);

    newUser.save(function(err, user){
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};

User.authenticate = function(p,password) {
    return p == md5.update(password).digest('hex');
}

//读取用户信息
User.get = function(email, callback) {
    UserModel.findOne({email:email}, function (err, user)
    {
        console.log(user);
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};

User.getAll = function (callback) {
    UserModel.find().exec(function(err,users){
        if (err) {
            return callback(err);
        }
        callback(null,users);
    });
};
