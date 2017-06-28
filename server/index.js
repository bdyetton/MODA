var express = require('express');
var compression = require('compression');
var path = require('path');
var cors = require('cors');
var usr = require('./user');
var fs = require('fs');
var users = new usr;
var imgServer = require('./imgServer');
var imServ = new imgServer;

var AWS = require('./aws');
var aws = new AWS;

var currentUsers = {};

var app = express();
var imgNum = 0;
var static_path = path.join(__dirname, './../build');

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

app.enable('trust proxy');

app.use(compression());

app.options('/api/currentTime', cors());
app.get('/api/currentTime', cors(), function (req, res) {
    res.send({time: new Date()});
});

app.get('/api/submitHit', cors(), function (req, res) {
    imServ.getImageData(currentUsers[req.query.user], 1, true);
    users.saveUser(currentUsers[req.query.user]);
    res.send({success: true});
});

app.get('/api/getRemImage', cors(), function (req, res) {
    var img = imServ.getImageData(currentUsers[req.query.user], parseInt(req.query.inc));
    users.saveUser(currentUsers[req.query.user]);
    res.send({success: true, image: img});
});

app.get('/api/saveUser', cors(), function (req, res) {
    users.saveUser(currentUsers[req.query.user]);
    res.send({success: true});
});

app.get('/api/compareToGS', cors(), function (req, res) {
    var markers = imServ.compareToGS(currentUsers[req.query.user]);
    res.send({success: true, markers: markers});
});

app.get('/api/updateMarkerState', cors(), function (req, res) {
    var imgData = imServ.updateMarkerState(currentUsers[req.query.user], req.query.marker);
    res.send({success: true, imgData: imgData});
});

app.get('/api/updateNoMakers', cors(), function (req, res) {
    imServ.updateNoMakers(currentUsers[req.query.user], req.query.noMarkers);
    res.send({success: true});
});

app.get('/api/loginOther', cors(), function (req, res) {
    console.log('Requesting login for:', req.query.userData);
    users.loadUser(req.query.userData, function (err, userDataAll) { //async callback
        if (!err) { //load user
            console.log('server returned correctly')
            var out = {};
            if (req.query.userData.password !== userDataAll.userData.password) {
                out.err = 'Password incorrect';
                out.success = false;
                res.send(out);
                return;
            }
            out.login = true;
            out.createdUser = false;
            currentUsers[userDataAll.userName] = userDataAll;
            currentUsers[userDataAll.userName].userData = req.query.userData;
            if (req.query.userData.currentPhase) {
                currentUsers[userDataAll.userName].currentPhase = req.query.userData.currentPhase;
            }
            out.userName = userDataAll.userName;
            out.userData = req.query.userData;
            out.success = true;
            out.image = imServ.getImageData(currentUsers[userDataAll.userName], 0);
            out.image.markerIndex = currentUsers[userDataAll.userName].markerIndex;
            res.send(out);
        } else {
            console.log('Error occured', err)
            var out = {};
            if (err.code === 'NoSuchKey') {
                out.err = 'That email/password combination does not exist';

            } else {
                out.err = 'Some unknown error occurred: 2335';
                console.log('Unknown Error: 2335')
            }
            out.success = false;
            res.send(out)
        }
    })
});

app.get('/api/registerOther', cors(), function (req, res) {
    users.loadUser(req.query.userData, function (err) {
        if (!err) {
            var out = {};
            out.err = 'That email is already already taken';
            out.success = false;
            res.send(out);
        } else {
            users.createUser(req.query.userData, imServ, function (err, userDataAll) { //async callback
                if (!err) {
                    currentUsers[userDataAll.userName] = userDataAll;
                    currentUsers[userDataAll.userName].userData = clone(req.query.userData);
                    if (req.query.userData.currentPhase) {
                        currentUsers[userDataAll.userName].currentPhase = req.query.userData.currentPhase;
                    }
                    users.saveUser(currentUsers[userDataAll.userName]);

                    var out = {};
                    out.login = true;
                    out.createdUser = true;
                    out.userName = currentUsers[userDataAll.userName].name;
                    out.userData = req.query.userData;
                    out.success = true;
                    out.image = imServ.getImageData(currentUsers[userDataAll.userName], 0);
                    out.image.markerIndex = currentUsers[userDataAll.userName].markerIndex;
                    res.send(out);

                } else {
                    var out = {};
                    out.image = {};
                    out.image.filename = 'http://i.imgur.com/xEv2LWQ.jpg';
                    out.userName = 'Invalid User *Slothmode Enabled*';
                    out.login = true;
                    out.sme = true;
                    out.success = true;
                    out.createdUser = false;
                    console.log(err);
                    res.send(out);
                }
            });
        }
    });
});

app.get('/api/loginMturker', cors(), function (req, res) {
    users.loadUser(req.query.userData, function (err, userDataAll) { //async callback
        if (!err) { //load user
            currentUsers[userDataAll.userName] = userDataAll;
            currentUsers[userDataAll.userName].userData = req.query.userData;
            if (req.query.userData.currentPhase) {
                currentUsers[userDataAll.userName].currentPhase = req.query.userData.currentPhase;
            }

            var out = {};
            out.login = true;
            out.createdUser = false;
            out.userName = userDataAll.userName;
            out.userData = req.query.userData;
            out.success = true;
            out.image = imServ.getImageData(currentUsers[userDataAll.userName], 0);
            out.image.markerIndex = currentUsers[userDataAll.userName].markerIndex;
            res.send(out);
        } else { //create user
            if (err.code === 'NoSuchKey') {
                users.createUser(req.query.userData, imServ, function (err, userDataAll) { //async callback
                    if (!err) {
                        currentUsers[userDataAll.userName] = userDataAll;
                        currentUsers[userDataAll.userName].userData = clone(req.query.userData);
                        if (req.query.userData.currentPhase) {
                            currentUsers[userDataAll.userName].currentPhase = req.query.userData.currentPhase;
                        }
                        var out = {};
                        out.login = true;
                        out.createdUser = true;
                        out.userName = currentUsers[userDataAll.userName].name;
                        out.userData = req.query.userData;
                        out.success = true;
                        out.image = imServ.getImageData(currentUsers[userDataAll.userName], 0);
                        out.image.markerIndex = currentUsers[userDataAll.userName].markerIndex;
                        res.send(out);
                    } else {
                        var out = {};
                        out.image = {};
                        out.image.filename = 'http://i.imgur.com/xEv2LWQ.jpg';
                        out.userName = 'Invalid User *Slothmode Enabled*';
                        out.login = true;
                        out.sme = true;
                        out.success = true;
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
                out.success = true;
                console.log(err);
                res.send(out);
            }
        }

    });
});

app.route('/').get(function (req, res) {
    res.header('Cache-Control', "max-age=60, must-revalidate, private");
    res.sendFile('index.html', {
        root: static_path
    });
});

function updateUsersToPhase2() {
    var metaDataFileHandle = fs.readFileSync('./app/Assets/metaDataphase1.json');
    var phase2Data = JSON.parse(metaDataFileHandle.toString('utf8'));
    var currentFiles = [];
    aws.getFileList(currentFiles, 'UserData_expert_', undefined, function (fileList) {
        fileList.forEach(function (userFile) {
            aws.getFile(userFile.Key, function (err, userJSON) {
                userJSON.batches['phase2'] = phase2Data;
                console.log('Updated', userJSON.userData.userName)
                //users.saveUser(userJSON);
            })
        })
    })
}

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
    updateUsersToPhase2()
});