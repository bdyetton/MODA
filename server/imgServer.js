var path = require('path');
var fs = require('fs');
var mturk = require('./mturkConnect');
var mturk = new mturk;
var Status = require('./status');
var status = new Status;

var phases = ['practice', 'phase1'];

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function split(a, n) {
    var len = a.length, images = [], i = 0;
    while (i < len) {
        images.push({
            imgs: a.slice(i, i += n),
            complete: false,
            idx: 0
        });
    }
    return images;
}

var imgConfig = { //THIS DATA NEEDS TO BE UPDATED! //TODO break out into a file //Don't think this is used anymore...
    secs: 25,
    sampleRate: 256,
    margins: {
        left: 70,
        top: 7,
        bottom: 45,
        right: 9
    },
    img: {
        h: 90,
        w: 900
    },
    seg: {
        w: 3,
        h: null
    },
    box: {
        w: null,
        h: null
    }
};

var matchThreshs = {
    wDiffThreshLow: 0.75,
    xDiffThreshLow: 0.6,
    wDiffThreshHigh: 0.15,
    xDiffThreshHigh: 0.1
};

var secPerPx = (imgConfig.secs / imgConfig.img.w);

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function clone(a) {
    return JSON.parse(JSON.stringify(a));
}

function imgServer() {
    var self = this;
    self.status = status;
    self.status.initStatusCheck();
    self.batchSize = 5;
    self.folderLengthMap = {};
    self.batches = {};
    phases.forEach(function (phase) {
        var metaDataFileHandle = fs.readFileSync('./app/Assets/metaData' + phase + '.json');
        self.batches[phase] = JSON.parse(metaDataFileHandle.toString('utf8')); //batches (5 images) are indexed by number strings, and are NOT grouped into sets
    });

    self.motMesg = ['Keep up the good work!',
        'Thanks for you help so far, we really appreciate it!',
        "You're doing well. Thanks for helping science!",
        "Don't watch the clock; do what it does. Keep going.",
        "Pat yourself on the back, your doing a great job.",
        "Your a sleep scientist in the making",
        "Your work helps us develop treatments for poor sleep. Thanks for helping!",
        "Your a star scorer.",
        "Keep spotting those spindles!",
        ":)",
        "We think your awesome for helping us!",
        "If your questioning your quality, have a read of the instructions again",
        "Keep those eyes open for spindles!",
        "Want to score faster? Try using the keyboard shortcuts. See page 10 of the instructions for details.",
        "Want to score faster? Try using the keyboard shortcuts. See page 10 of the instructions for details.",
        "Want to score faster? Try using the keyboard shortcuts. See page 10 of the instructions for details."
    ];

    self.initUser = function (user, cb) {
        user.batches = clone(self.batches);
        user.batchesIdxs = {};
        user.currentSet = {};
        user.setsCompleted = {};
        user.idx = {};
        user.phaseIdx = 0;
        user.currentPhase = user.currentPhase || phases[user.phaseIdx];
        user.batchesCompleted = {};
        phases.forEach(function (phase) { //Init that shit
            user.batchesIdxs[phase] = Array.apply(null, {length: user.batches[phase].batchMeta.numBatches}).map(Number.call, Number); //fancy way to do pythons range()
            if (phase != 'practice') {
                user.batchesIdxs[phase] = shuffleArray(user.batchesIdxs[phase]) //Shuffle idxs for each sub
            }
            user.currentSet[phase] = [0, 1]; //set idx is 0 or 1
            user.setsCompleted[phase] = 0;
            user.batchesCompleted[phase] = [];
            user.idx[phase] = 0; //incs to 0-9
        });
        user.markerIndex = 0;
        cb(false, user);
    };

    self.loadImageMeta = function (img, folder) { //Dont think this is used. TODO delete
        var fileData = fs.readFileSync('./server/Data/User/' + userName + '.txt');
    };

    self.updateNoMakers = function (user, noMarkers) {
        var setIdx = Math.floor((user.idx[user.currentPhase]) / user.batches[user.currentPhase].batchMeta.imgPerBatch);
        var batchIdx = Math.floor((user.idx[user.currentPhase]) % user.batches[user.currentPhase].batchMeta.imgPerBatch);
        user.batches[user.currentPhase]
            [user.batchesIdxs[user.currentPhase]
            [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].noMarkers = noMarkers;
    };

    self.updateMarkerState = function (user, marker) {
        if (user.markerIndex < marker.markerIndex) { //set new number of marker
            user.markerIndex = marker.markerIndex;
        }
        marker = self.processMarker(marker); //convert px to secs (adds xSecs field)
        //check if this marker exists in the server already
        var exists = false;
        var setIdx = Math.floor((user.idx[user.currentPhase]) / user.batches[user.currentPhase].batchMeta.imgPerBatch);
        var batchIdx = Math.floor((user.idx[user.currentPhase]) % user.batches[user.currentPhase].batchMeta.imgPerBatch);
        user.batches[user.currentPhase]
            [user.batchesIdxs[user.currentPhase]
            [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers.forEach(function (currentMarker, i) {
            if (currentMarker.markerIndex == marker.markerIndex) {
                if (user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[i].timeStamp < marker.timeStamp) {
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[i] = marker; //this was just a move
                }
                exists = true;
            }
        });
        //else, this is a new marker
        if (!exists) {
            marker.firstCreated = marker.timeStamp;
            user.batches[user.currentPhase]
                [user.batchesIdxs[user.currentPhase]
                [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers.push(marker);
        }
        return self.getImageData(user, 0);
    };

    self.processMarker = function (marker) {
        if (marker.type === 'seg') {
            marker.xSecs = marker.xP * imgConfig.secs;
        } else if (marker.type === 'box') {
            marker.wSecs = marker.wP * imgConfig.secs;
            marker.xSecs = marker.xP * imgConfig.secs;
        }
        return marker
    };

    self.compareToGS = function (user) { //FIXME
        var setIdx = Math.floor((user.idx[user.currentPhase]) / user.batches[user.currentPhase].batchMeta.imgPerBatch);
        var batchIdx = Math.floor((user.idx[user.currentPhase]) % user.batches[user.currentPhase].batchMeta.imgPerBatch);
        //Step through each non deleted marker and check against GS markers.
        user.batches[user.currentPhase]
            [user.batchesIdxs[user.currentPhase]
            [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers.forEach(function (marker, mIdx) {
            var matches = user.batches[user.currentPhase]
                [user.batchesIdxs[user.currentPhase]
                [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].gsMarkers.map(function (gsMarker) {
                var posMatch = self.compare2Markers(gsMarker, marker);
                if (posMatch === 'matchHigh') {
                    var confMatch = gsMarker.conf === marker.conf;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].match = true;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].confMatch = confMatch;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].matchMessage = 'Welldone! this spindle marker is placed correctly.'// + [!confMatch ?
                    // ' However, the experts mark this with ' + gsMarker.conf + ' confidence' : ''];
                    return true;
                } else if (posMatch === 'matchLow') {
                    var confMatch = gsMarker.conf === marker.conf;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].match = true;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].confMatch = confMatch;
                    user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].matchMessage = 'Good Try! This spindle marker is almost right'// + [!confMatch ?
                    // ' However, the experts mark this with ' + gsMarker.conf + ' confidence' : ''];
                    return true;
                } else {
                    return false;
                }
            });
            if (matches.every(function (el) {
                    return el === false;
                })) {
                user.batches[user.currentPhase]
                    [user.batchesIdxs[user.currentPhase]
                    [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].match = false;
                user.batches[user.currentPhase]
                    [user.batchesIdxs[user.currentPhase]
                    [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].confMatch = false;
                user.batches[user.currentPhase]
                    [user.batchesIdxs[user.currentPhase]
                    [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers[mIdx].matchMessage = 'Woops, this spindle marker is incorrect. Try again'
            }
        });
        return user.batches[user.currentPhase]
            [user.batchesIdxs[user.currentPhase]
            [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].markers;
    };

    self.compare2Markers = function (m1, m2) {
        if ((m1.deleted === 'false' || !m1.deleted) && (m2.deleted === 'false' || !m2.deleted)) {
            var xDiff = Math.abs(parseFloat(m1.xSecs) - parseFloat(m2.xSecs));
            var wDiff = Math.abs(parseFloat(m1.wSecs) - parseFloat(m2.wSecs));
            if (wDiff < matchThreshs.wDiffThreshHigh && xDiff < matchThreshs.xDiffThreshHigh) {
                return 'matchHigh'
            } else if (wDiff < matchThreshs.wDiffThreshLow && xDiff < matchThreshs.xDiffThreshLow) {
                return 'matchLow'
            } else {
                return 'missMatch'
            }
        } else {
            return 'markerDeleted'
        }
    };

    self.getMotivMesg = function () {
        var rando = getRandomInt(0, 20);
        if (rando === 1) {
            return self.motMesg[getRandomInt(0, self.motMesg.length)]
        }
    };

    self.incrementSet = function (user) {
        var completedMODA = false;
        user.setsCompleted[user.currentPhase] += 1;
        user.batchesCompleted[user.currentPhase].push(user.batchesIdxs[user.currentPhase][user.currentSet[user.currentPhase][0]]); //add completed batches to completed var
        user.batchesCompleted[user.currentPhase].push(user.batchesIdxs[user.currentPhase][user.currentSet[user.currentPhase][1]]);

        var newBatchs = self.getNewBatchesForSet(user);

        if (newBatchs === false) { //FINISHED PHASE
            if (user.userType === 'mturker') {
                mturk.markPhaseComplete(user, user.currentPhase);
            }
            user.phaseIdx += 1;
            user.currentPhase = phases[user.phaseIdx];
            if (user.phaseIdx >= phases.length) {
                user.idx[user.currentPhase] -= inc;
                user.phaseIdx -= 1;
                user.currentPhase = phases[user.phaseIdx];
                completedMODA = true
            }
            user.idx[user.currentPhase] = 0

        } else { //Not finished phase, normal update
            user.currentSet[user.currentPhase] = newBatchs;
            user.idx[user.currentPhase] = 0;
        }
        return completedMODA
    };

    self.getNewBatchesForSet = function (user) {
        var incompleteBatchesAll = self.status.getIncompleteBatches();

        if (incompleteBatchesAll === undefined) { //server has not loaded aws data and generated status yet....
            return user.currentSet[user.currentPhase].map(function(val){
                return val+2 //just increment set the old school way then
            });
        }


        if ('RPSGTNum' in user.registerData) {
            var userType = 'psgTech';
        } else {
            var userType = 'researcherOrOther';
        }
        var incompleteBatches = incompleteBatchesAll[userType][user.currentPhase];


        user.batchesCompleted[user.currentPhase].forEach(function (completedBatch) { //Remove the ones we have already done
            var index = incompleteBatches.indexOf(completedBatch);
            if (index != -1) {
                incompleteBatches.splice(index, 1);
            }
        });

        if (incompleteBatches.length === 0) {return false}//no more batches in phase, phase complete
        if (user.currentPercentDone === undefined){
            user.currentPercentDone = {practice:0, phase1:0, phase2:0}
        }
        user.currentPercentDone[user.currentPhase] = 100*user.batchesCompleted[user.currentPhase].length/(incompleteBatches.length+user.batchesCompleted[user.currentPhase].length);
        console.log(user.userName,'has',incompleteBatches.length,'more batches in',user.currentPhase,'(',user.currentPercentDone[user.currentPhase],')% done');

        var shuffledBatches = shuffleArray(incompleteBatches);
        var chosenBatchIdxs = shuffledBatches.slice(0, 2);

        var chosenSetIdxs = [];
        chosenBatchIdxs.forEach(function (batchIdx) {
            chosenSetIdxs.push(user.batchesIdxs[user.currentPhase].indexOf(batchIdx))
        });

        return chosenSetIdxs;

    };

    self.getImageData = function (user, inc, cleanUpdate) {
        var completedMODA = false;
        user.idx[user.currentPhase] += inc;
        var maxSets = user.batches[user.currentPhase].batchMeta.numBatches / user.batches[user.currentPhase].batchMeta.batchPerSet;
        if (user.idx[user.currentPhase] >= user.batches[user.currentPhase].batchMeta.imgPerSet) { //10 images per set, after that increment set
            completedMODA = self.incrementSet(user)
        }
        var setIdx = Math.floor((user.idx[user.currentPhase]) / user.batches[user.currentPhase].batchMeta.imgPerBatch); //set index ticks through users batches
        var batchIdx = Math.floor((user.idx[user.currentPhase]) % user.batches[user.currentPhase].batchMeta.imgPerBatch); //batch index ticks through images?

        var dataOut = user.batches[user.currentPhase]
            [user.batchesIdxs[user.currentPhase]
            [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx];
        //save hit information
        if (user.userType === 'mturker') {
            if (user.batches[user.currentPhase]
                    [user.batchesIdxs[user.currentPhase]
                    [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].mturkInfo !== undefined) {
                if (user.batches[user.currentPhase]
                        [user.batchesIdxs[user.currentPhase]
                        [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].mturkInfo.assignmentId !== user.userData.assignmentId) {
                    console.log('Warning... THIS SET HAS ALREADY BEEN DONE WITH DIFFERENT HIT ID!');
                    if (user.currentPhase !== 'practice') {
                        self.incrementSet(user)
                    }
                }
            }
            if (cleanUpdate === undefined) {
                user.batches[user.currentPhase]
                    [user.batchesIdxs[user.currentPhase]
                    [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].mturkInfo = {
                    hitId: user.userData.hitId,
                    assignmentId: user.userData.assignmentId,
                    workerId: user.userData.workerId,
                    turkSubmitTo: user.userData.turkSubmitTo
                }
            }
        }

        if (inc === 0) {
            user.batches[user.currentPhase]
                [user.batchesIdxs[user.currentPhase]
                [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].loadedViews += 1
        } else {
            dataOut.msg = self.getMotivMesg();
            user.batches[user.currentPhase]
                [user.batchesIdxs[user.currentPhase]
                [user.currentSet[user.currentPhase][setIdx]]].imgs[batchIdx].backNextViews += 1
        }
        dataOut.idx = user.idx[user.currentPhase];
        dataOut.idxMax = user.batches[user.currentPhase].batchMeta.imgPerSet - 1;
        dataOut.setsCompleted = user.setsCompleted[user.currentPhase];
        dataOut.setsMax = maxSets;
        if (completedMODA){
            dataOut.msg = 'YOU HAVE COMPLETED ALL SETS. THANK SO SO SO SO MUCH FOR YOUR HELP! YOU ARE AMAZING!!!'
        }
        return dataOut;
    };

};


module.exports = imgServer;