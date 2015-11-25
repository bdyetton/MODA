var fs = require('fs');

var userList_ = [];

function user(){
    var self = this;
    self.userList = fs.readdirSync('./server/Data/User/');
    self.userList = self.userList.filter(function(item){return item.indexOf(".txt") > -1});
    self.login = function(userName){
        if (self.userList.some(function(user){
            return user.indexOf(userName) > -1;
        })){
            return self.loadUser(userName);
        }
        return false;
    };
    self.createUser = function(userName,imServ){
        var user = {name:userName};
        imServ.initUser(user);
        self.userList.push(user);
        return user;
    };

    self.saveUser = function(user){
        fs.writeFile('./server/Data/User/' + user.name + '.txt', JSON.stringify(user),function(err) {
            if (err) {
                console.log(err);
                return false;
            }
            return true;
        })
    };

    self.loadUser = function(userName) {
        try {
            var fileData = fs.readFileSync('./server/Data/User/' + userName + '.txt');
        } catch (err){
            console.log('User not found');
            console.log(err);
            return false
        }
        return JSON.parse(fileData.toString('utf8'));
    };
};

module.exports = user;