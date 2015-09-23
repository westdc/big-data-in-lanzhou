var mongoose=require('./db');

var uploadSchema=new mongoose.Schema({
    picture:String,
    createAt: { type: Date, default: Date.now }
});

var UploadModel=mongoose.model('Upload',uploadSchema);

function Upload(upload){
    this.picture=upload.picture;
    this.createAt=upload.createAt;
};

module.exports=Upload;

Upload.prototype.save=function(callback) {
    var upload = {
        picture: this.picture
    };

    var newUpload = new UploadModel(upload);

    newUpload.save(function(err, upload){
        if(err){
            return callback(err);
        }
        callback(null, upload);
    });
};