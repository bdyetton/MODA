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
    var img = imServ.getImage(currentUsers[req.query.user],1);
    var nextMarkers = imServ.getMarkers(currentUsers[req.query.user]);
    res.send({image: img, markers: nextMarkers});
    users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/previousRemImage',cors(),function(req,res){
    var img = imServ.getImage(currentUsers[req.query.user],-1);
    var nextMarkers = imServ.getMarkers(currentUsers[req.query.user]);
    res.send({image: img, markers: nextMarkers});
    users.saveUser(currentUsers[req.query.user]);
});

app.get('/api/compareToGS',cors(),function(req,res){
    var markers = imServ.compareToGS(currentUsers[req.query.user]);
    res.send({markers: markers});
});

app.get('/api/updateMarkerState',cors(),function(req,res){
    imServ.updateMarkerState(currentUsers[req.query.user], req.query.marker);
    res.send({success: true});
});

app.get('/api/updateImgMeta',cors(),function(req,res){
    imServ.updateImgMeta(currentUsers[req.query.user], req.query.imgMeta);
    res.send({success: true});
});

app.get('/api/getUser',cors(),function(req,res){
  users.loadUser(req.query.user,function(err,userData){ //async callback
    if (!err) { //load user
      var out = {};
      out.login = true;
      out.createdUser = false;
      currentUsers[req.query.user] = userData;
      out.userName = currentUsers[req.query.user].name;
      out.image = imServ.getImage(currentUsers[req.query.user], 0);
      out.image.markers = imServ.getMarkers(currentUsers[req.query.user]);
      out.image.markerIndex = currentUsers[req.query.user].markerIndex;
      res.send(out);
    } else { //create user
      if(err.code == 'NoSuchKey') {
        users.createUser(req.query.user, imServ, function(err, userData){ //async callback
          if (!err) {
            currentUsers[req.query.user] = userData;
            var out = {};
            out.login = true;
            out.createdUser = true;
            out.userName = currentUsers[req.query.user].name;
            out.image = imServ.getImage(currentUsers[req.query.user], 0);
            out.image.markers = imServ.getMarkers(currentUsers[req.query.user]);
            console.log(out.image.markers);
            out.image.markerIndex = currentUsers[req.query.user].markerIndex;
            res.send(out);
          } else {
            var out = {};
            out.image = {};
            out.image.url = 'http://i.imgur.com/xEv2LWQ.jpg';
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
        out.image.url = 'http://i.imgur.com/xEv2LWQ.jpg';
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

var server = app.listen(process.env.PORT || 5000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('MODA App listening at http://%s:%s', host, port);
});