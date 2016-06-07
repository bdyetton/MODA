var fs = require('fs');
var aws_ = require('./aws');
var aws = new aws_;

function user(){
  var self = this;
  self.aws = new aws_;

  this.loginFromFileSystem = function(userName){
    self.userList = fs.readdirSync('./server/Data/User/');
    self.userList = self.userList.filter(function(item){return item.indexOf(".txt") > -1});
    if (self.userList.some(function(user){
        userParts = user.split('.');
        return userParts[0] === userName;
      })){
      return self.loadUser(userName);
    }
    return false;
  };

  this.createUser = function(userData,imServ,cb){
    var user = userData;
    imServ.initUser(user,cb);
  };

  this.saveUser = function(user,loc){
    loc = loc || 's3';
    //Write to s3
    if (loc == 's3') {
      if (user.userName==='preview'){return;} //dont save preview data
      console.log('Saving User' + user.userName);
      if (user.userType == 'mturker') {
        self.aws.postFile('UserData_' + user.currentPhase + '_' + user.userName, JSON.stringify(user));
      } else {
        self.aws.postFile('UserData_expert_' + user.userName, JSON.stringify(user));
      }
    }

    //Write to local disk
    if (loc == 'local') {
      fs.writeFile('./server/Data/User/' + user.userName + '.txt', JSON.stringify(user), function (err) {
        if (err) {
          console.log(err);
          return false;
        }
        return true;
      })
    }
  };

  this.loadUser = function(user,cb,loc) {
    loc = loc || 's3';

    //Get from s3
    if (loc == 's3') {
      if (user.userType == 'mturker') {
        self.aws.getFile('UserData_' + user.currentPhase + '_' + user.userName, cb);
      } else {
        self.aws.getFile('UserData_expert_' + user.userName, cb);
      }
    }

    if (loc == 'local') {
      try {
        var fileData = fs.readFileSync('./server/Data/User/' + user.userName + '.txt');
        fileData = fileData.toString('utf8');
        cb(false,JSON.parse(fileData));
      } catch (err) {
        console.log('User not found');
        console.log(err);
        cb(true,err)
      }
    }
  };
};

module.exports = user;