var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1';

function aws() {
  var self = this;
  self.s3 = new AWS.S3();
  self.bucketName = 'moss-assets';
  self.s3bucket = new AWS.S3({params: {Bucket: self.bucketName}});
  self.allKeys = [];


  this.postFile = function(key, body) {
    self.s3bucket.createBucket(function () {
      var params = {Key: key, Body: body};
      self.s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading data: ", err);
        } else {
          console.log("Successfully uploaded data to " + self.bucketName +'/'+ key);
        }
      });
    });
  };

  this.getFileList = function(fileNameContainer, prefix, marker, cb){
    params = {Bucket: self.bucketName, Prefix: prefix}
    if (marker !== undefined){params['Marker'] = marker}
    self.s3.listObjects(params, function(err, data){
        if(err !== null){console.log('Error getting all files for status', err)}
        fileNameContainer = fileNameContainer.concat(data.Contents);

        if(data.IsTruncated)
          getFileList(fileNameContainer, prefix, data.NextMarker, cb);
        else
          cb(fileNameContainer);
      });
  };

  this.getFile = function(key,cb) {
    self.s3.getObject({Bucket: self.bucketName, Key:key}, function(err, data) {
      if (err) {
        cb(err, 'ERROR1');
      }
      else{
        cb(false, JSON.parse(data.Body.toString())); // successful response
      }
    });
  }
}

module.exports = aws;