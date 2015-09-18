/**
 * Created by maxd on 15-9-17.
 */
var crypto = require('crypto');
var mongoose = require('./db');


var userSchema = new mongoose.Schema({
    email: String,
    name:String,
    password: String,
    createAt: { type: Date, default: Date.now },
    status: { type: Number, default: 1 }
});

var UserModel = mongoose.model('User', userSchema);

function User(user) {
    this.email = user.email;
    this.name = user.name;
    this.password = user.password;
    this.status = user.status;
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5');

    var user = {
        email: this.email,
        name: this.name,
        password: md5.update(this.password).digest('hex'),
        status: 1
    };

     console.log(user);
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
    var md5 = crypto.createHash('md5');

    return p == md5.update(password).digest('hex');
}

//读取用户信息
User.get = function(email, callback) {
    UserModel.findOne({email:email}, function (err, user)
    {
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};

User.getAll = function (skip,pageSize,callback) {
    UserModel.find().skip(skip).limit(pageSize).exec(function(err,users){
        if (err) {
            return callback(err);
        }
        callback(null,users);
    });
};

User.count = function(callback) {
    UserModel.count().exec(function(err,total) {
        if(err) {
            return callback(err);
        }
        callback(null,total);
    });
};

User.updateStatus = function(user, callback) {
    UserModel.findOneAndUpdate({_id:user._id},{ $set: {status:user.status}}).exec(function (err, user) {
        if (err) {
            return callback(err);
        }
        callback(null,user);
    });
};