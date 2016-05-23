
var express= require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');
var mturk = require('./mturk');
var mturk= new mturk;
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

app.get('/api/submitHit', cors(), function(req, res) {
  mturk.approveHIT(currentUsers[req.query.user]);
  res.send({ success: true });
});

app.get('/api/nextRemImage',cors(),function(req,res){
  var img = imServ.getImageData(currentUsers[req.query.user],1);
  res.send({image: img});
  users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/previousRemImage',cors(),function(req,res){
  var img = imServ.getImageData(currentUsers[req.query.user],-1);
  res.send({image: img});
  users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/compareToGS',cors(),function(req,res){
  var markers = imServ.compareToGS(currentUsers[req.query.user]);
  res.send({markers: markers});
});

app.get('/api/updateMarkerState',cors(),function(req,res){
  var imgData = imServ.updateMarkerState(currentUsers[req.query.user], req.query.marker);
  res.send({success: true, imgData:imgData});
});

app.get('/api/updateNoMakers',cors(),function(req,res){
  imServ.updateNoMakers(currentUsers[req.query.user], req.query.noMarkers);
  res.send({success: true});
});

app.get('/api/getUser',cors(),function(req,res){
  users.loadUser(req.query.userData,function(err,userData){ //async callback
    if (!err) { //load user
      var out = {};
      out.login = true;
      out.createdUser = false;
      currentUsers[userData.userName] = userData;
      out.userName = userData.userName;
      out.userData = req.query.userData;
      out.image = imServ.getImageData(currentUsers[userData.userName], 0);
      out.image.markerIndex = currentUsers[userData.userName].markerIndex;
      res.send(out);
    } else { //create user
      if(err.code == 'NoSuchKey') {
        users.createUser(req.query.userData, imServ, function(err, userData){ //async callback
          if (!err) {
            currentUsers[userData.userName] = userData;
            var out = {};
            out.login = true;
            out.createdUser = true;
            out.userName = currentUsers[userData.userName].name;
            out.userData = req.query.userData;
            out.image = imServ.getImageData(currentUsers[userData.userName], 0);
            console.log(out.image.markers);
            out.image.markerIndex = currentUsers[userData.userName].markerIndex;
            res.send(out);
          } else {
            var out = {};
            out.image = {};
            out.image.filename = 'http://i.imgur.com/xEv2LWQ.jpg';
            out.userName = 'Invalid User *Slothmode Enabled*';
            out.login = true;
            out.sme = true;
            out.createdUser = false;
            console.log(err);
            res.send(out);
          }
        });
      } else {
        var out = {};
        out.image = {};
        out.image.filename = 'http://i.imgur.com/xEv2LWQ.jpg';
        out.userName = 'Invalid User *Slothmode Enabled*';
        out.login = true;
        out.sme = true;
        out.createdUser = false;
        console.log(err);
        res.send(out);
      }
    }

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

//app.use(function(req, res, next) {
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//    next();
//});

var server = app.listen(process.env.PORT || 5000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('MODA App listening at http://%s:%s', host, port);
});