var fs = require('fs');
var userList_ = [];

function user(){
    var self = this;
    self.userList = userList_;
    self.login = function(userName){
        return self.userList.some(function(user){
            return user.name == userName;
        })
    };
    self.createUser = function(userName,imServ){
        var user = {name:userName};
        imServ.initUser(user);
        self.userList.push(user);
        return user;
    };
};

module.exports = user;