var fs = require('fs');

function user(){
    var self = this;
    self.userList = fs.readdirSync('./server/Data/User/');
    self.userList = self.userList.filter(function(item){return item.indexOf(".txt") > -1});

    self.login = function(userName){
        console.log(userName);
        if (self.userList.some(function(user){
            userParts = user.split('.');
            return userParts[0] === userName; //FIXME some strange, occasional, errors here
        })){
            return self.loadUser(userName);
        }
        return false;
    };
    self.createUser = function(userName,imServ){
        var user = {name:userName};
        imServ.initUser(user);
        self.userList.push(user);
        self.saveUser(user);
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
        console.log('Loaded user data');
        return JSON.parse(fileData.toString('utf8'));

    };
};

module.exports = user;