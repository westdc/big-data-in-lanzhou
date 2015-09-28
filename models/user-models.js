/**
 * Created by maxd on 15-9-17.
 */
var crypto = require('crypto');
var mongoose = require('./db');
var Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');
var UserSchema = new Schema({
    name:String,
    createAt: { type: Date, default: Date.now },
    status: { type: Number, default: 1 }
});

UserSchema.plugin(passportLocalMongoose);

var UserModel = mongoose.model('User', UserSchema);
module.exports.UserModel = UserModel;

function User(user) {
    this.name = user.name;
    this.status = user.status;
};

module.exports.User = User;

User.get = function(email, callback) {
    UserModel.findOne({email:email}, function (err, user)
    {
        if(err){
            return callback(err);
        }
        callback(null, user);
    });
};

User.getAll = function (skip,pageSize,keyword,callback) {
    var pattern = new RegExp(keyword, "i");
    UserModel.find({name:pattern}).skip(skip).limit(pageSize).sort({createAt: -1}).exec(function(err,users){
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

User.updateStatus = function(id,status, callback) {
    UserModel.findOneAndUpdate({_id:id},{ $set: {status:status}}).exec(function (err, user) {
        if (err) {
            return callback(err);
        }
        callback(null,user);
    });
};

User.remove = function(id, callback) {
    UserModel.where({_id:id}).findOneAndRemove().exec(function(err, users) {
        if (err){
            return callback(err);
        }
        callback(null, users);
    });
};