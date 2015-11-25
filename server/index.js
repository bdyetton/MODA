var express= require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');
var usr = require('./user');
var users = new usr;
var imgServer = require('./imgServer');
var imServ = new imgServer;
var Ben = {};
var currentUser;

var app = express();
var imgNum = 0;
var static_path = path.join(__dirname, './../build');
//var img_path = path.join(__dirname, './../app/Assets');

app.enable('trust proxy');

app.use(compression());

app.options('/api/currentTime', cors());
app.get('/api/currentTime', cors(), function(req, res) {
  res.send({ time: new Date() });
});

app.get('/api/nextRemImage',cors(),function(req,res){
    res.send({imageURL: imServ.getImage(currentUser,1)});
});

app.get('/api/previousRemImage',cors(),function(req,res){
    res.send({imageURL: imServ.getImage(currentUser,-1)});
});

app.get('/api/getUser',cors(),function(req,res){
    var out = {};
    if(users.login(req.query.user)){
        out.login = true;
        out.createdUser = false;
    } else {
        currentUser = users.createUser(req.query.user,imServ);
        out.login = true;
        out.createdUser = true;
    }
    res.send(out);
});

app.route('/').get(function(req, res) {
    res.header('Cache-Control', "max-age=60, must-revalidate, private");
    res.sendFile('index.html', {
        root: static_path
    });
});

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use('/', express.static(static_path, {
    maxage: 31557600
}));
//app.use('/img', express.static(static_path+'/img'));

var server = app.listen(process.env.PORT || 5000, function () {

    var host = server.address().address;
    var port = server.address().port;
    console.log('SleepScoring App listening at http://%s:%s', host, port);
});