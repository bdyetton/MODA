var express= require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');
var usr = require('./user');
var users = new usr;
var imgServer = require('./imgServer');
var imServ = new imgServer;

var currentUsers = {};

var app = express();
var imgNum = 0;
var static_path = path.join(__dirname, './../build');

app.enable('trust proxy');

app.use(compression());

app.options('/api/currentTime', cors());
app.get('/api/currentTime', cors(), function(req, res) {
  res.send({ time: new Date() });
});

app.get('/api/nextRemImage',cors(),function(req,res){
    var nextImg = imServ.getImage(currentUsers[req.query.user],1);
    var nextMarkers = imServ.getMarkers(currentUsers[req.query.user]);
    res.send({image: nextImg, markers: nextMarkers});
    users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/previousRemImage',cors(),function(req,res){
    var nextImg = imServ.getImage(currentUsers[req.query.user],-1);
    var nextMarkers = imServ.getMarkers(currentUsers[req.query.user]);
    res.send({image: nextImg, markers: nextMarkers});
    users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/updateMarkerState',cors(),function(req,res){ //TODO get very first image working
    imServ.updateMarkerState(currentUsers[req.query.user], req.query.marker);
    res.send({success: true});
});

app.get('/api/getUser',cors(),function(req,res){
  users.loadUser(req.query.user,function(err,userData){
    var out = {};
    if (!err) { //load user
      out.login = true;
      out.createdUser = false;
      currentUsers[req.query.user] = userData;
      out.userName = currentUsers[req.query.user].name;
      out.img = {};
      out.img = imServ.getImage(currentUsers[req.query.user], 0);
      out.img.markers = imServ.getMarkers(currentUsers[req.query.user]);
      out.img.markerIndex = currentUsers[req.query.user].markerIndex;
    } else { //create user
      if(err.code == 'NoSuchKey') {
        currentUsers[req.query.user] = users.createUser(req.query.user, imServ);
        out.login = true;
        out.createdUser = true;
        out.userName = currentUsers[req.query.user].name;
        out.markers = {};
        out.img = imServ.getImage(currentUsers[req.query.user], 0);
      } else { console.log(err)}
    }
    res.send(out);
  });
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

var server = app.listen(process.env.PORT || 5000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('SleepScoring App listening at http://%s:%s', host, port);
});