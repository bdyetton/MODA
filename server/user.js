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

    this.getPracData = function(cb){
        self.aws.getFile('PracData_1',cb);
    };

    this.createUser = function(userName,imServ,cb){
        var user = {name:userName};
        this.getPracData(function(err,pracData){
            imServ.initUser(user,err,pracData,cb);
        });
    };

    this.saveUser = function(user,loc){
        loc = loc || 's3';
        //Write to s3
        if (loc == 's3') {
            self.aws.postFile('UserData_' + user.name, JSON.stringify(user));
        }

        //Write to local disk
        if (loc == 'local') {
            fs.writeFile('./server/Data/User/' + user.name + '.txt', JSON.stringify(user), function (err) {
                if (err) {
                    console.log(err);
                    return false;
                }
                return true;
            })
        }
    };

    this.loadUser = function(userName,cb,loc) {
        loc = loc || 's3';

        //Write to s3
        if (loc == 's3') {
            self.aws.getFile('UserData_'+userName,cb);
        }

        if (loc == 'local') {
            try {
                var fileData = fs.readFileSync('./server/Data/User/' + userName + '.txt');
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