var path = require('path');
var fs = require('fs');

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function split(a, n) {
  var len = a.length, images = [], i = 0;
  while (i < len) {
    images.push({
      imgs:a.slice(i, i += n),
      complete:false,
      idx:0
    });
  }
  return images;
}

var imgConfig = { //THIS DATA NEEDS TO BE UPDATED! //TODO break out into a file
  secs:25,
  sampleRate:256,
  margins:{
    left:70,
    top:7,
    bottom:45,
    right:9},
  img:{
    h:90,
    w:900
  },
  seg:{
    w:3,
    h:null
  },
  box:{
    w:null,
    h:null
  }
};

var matchThreshs = {
  wDiffThresh:0.5,
  xDiffThresh:0.5
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

function imgServer(){
  var self = this;
  self.batchSize = 5;
  self.folderLengthMap = {};
  self.batches = [];

  self.init = function (){
    var metaDataFileHandle = fs.readFileSync('./app/Assets/metaDataTraining2.json');
    self.batches = JSON.parse(metaDataFileHandle.toString('utf8'));
  };
  self.init();

  self.initUser = function(user,cb) {
    user.batches = clone(self.batches);
    user.batchesIdxs = Array.apply(null, {length: user.batches.batchMeta.numBatches}).map(Number.call, Number);
    user.batchesIdxs = shuffleArray(user.batchesIdxs);
    user.currentSet = [0,1];
    user.setsCompleted = 0;
    user.idx = 0; //incs to 0-9
    user.markerIndex = 0;
    user.batchesCompleted = [];
    cb(false,user);
  };

  //self.getNewSet = function(user){
  //  return [self.getNewBatch(user), self.getNewBatch(user)]
  //};
  //
  //self.getNewBatch = function(user){
  //  var randBatchIdx = Math.floor(Math.random() * (user.noncompleteBatches.length-1)); //TODO do i need to seed rand?
  //  var randBatch = user.noncompleteBatches.splice(randBatchIdx, 1);
  //  return randBatch;
  //};

  self.loadImageMeta = function(img,folder){
    var fileData = fs.readFileSync('./server/Data/User/' + userName + '.txt');
  };

  self.updateNoMakers = function(user, noMarkers){
    var setIdx = Math.floor((user.idx) / user.batches.batchMeta.imgPerBatch);
    var batchIdx = Math.floor((user.idx) % user.batches.batchMeta.imgPerBatch);
    user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].noMarkers = noMarkers;
  };

  self.updateMarkerState = function(user, marker){
    if (user.markerIndex < marker.markerIndex){ //set new number of marker
      user.markerIndex = marker.markerIndex;
    }
    marker = self.processMarker(marker); //convert px to secs (adds xSecs field)

    //check if this marker exists in the server already
    var exists = false;
    var setIdx = Math.floor((user.idx) / user.batches.batchMeta.imgPerBatch);
    var batchIdx = Math.floor((user.idx) % user.batches.batchMeta.imgPerBatch);
    user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].markers.forEach(function(currentMarker,i){
      if (currentMarker.markerIndex == marker.markerIndex){
        user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].markers[i] = marker; //this was just a move
        exists = true;
      }
    });
    //else, this is a new marker
    if(!exists){
      user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].markers.push(marker);
    }
  };

  self.processMarker = function(marker){
    console.log(marker.xP);
    if (marker.type==='seg') {
      marker.xSecs = marker.xP*imgConfig.secs;
    } else if (marker.type==='box'){
      marker.wSecs = marker.wP*imgConfig.secs;
      marker.xSecs = marker.xP*imgConfig.secs;
    }
    return marker
  };

  self.compareToGS = function(user){ //FIXME
    var setIdx = Math.floor((user.idx) / user.batches.batchMeta.imgPerBatch);
    var batchIdx = Math.floor((user.idx) % user.batches.batchMeta.imgPerBatch);
    //Step through each non deleted marker and check against GS markers.
    user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].markers.forEach(function(marker,mIdx){
      var matches = user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].meta.gsMarkers.map(function(gsMarker){
        var posMatch = self.compare2Markers(gsMarker,marker);
        if (posMatch === 'match'){
          var confMatch = gsMarker.conf === marker.conf;
          user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].match = true;
          user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].confMatch = confMatch;
          user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].matchMessage = 'Welldone! this spindle marker is placed correctly.'// + [!confMatch ?
           // ' However, the experts mark this with ' + gsMarker.conf + ' confidence' : ''];
          return true;
        } else {
          return false;
        }
      });
      if (matches.every(function(el){return el===false;})){
        user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].match = false;
        user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].confMatch = false;
        user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[mIdx].matchMessage = 'Woops, this spindle marker is incorrect. Try again'
      }
    });
    return user.batches[user.idx].imgs[user.batches[user.idx].idx].markers;
  };

  self.compare2Markers = function(m1,m2){
    if (m1.deleted==='false' && m2.deleted==='false'){
      if (m1.type === m2.type) {
        if (m1.type === 'box') {
          var xDiff = Math.abs(m1.xSecs - m2.xSecs);
          var wDiff = Math.abs(m1.wSecs - m2.wSecs);
          if (wDiff < matchThreshs.wDiffThresh && xDiff < matchThreshs.xDiffThresh) {
            return 'match'
          } else {
            return 'missMatch'
          }
        } else {
          //TODO other types of markers...
        }
      } else {
        return 'typeMissmatch';
      }
    } else {
      return 'markerDeleted'
    }
  };

  self.getImageData = function(user,inc) {
    user.idx += inc;
    var maxSets = user.batches.batchMeta.numBatches/user.batches.batchMeta.batchPerSet;
    if (user.idx >= user.batches.batchMeta.imgPerSet) { //10 images per set
      user.setsCompleted += 1;
      if (user.setsCompleted >= maxSets) {
        user.setsCompleted = maxSets
        console.log('All sets complete');
        user.idx -= inc
      } else {
        user.batchesCompleted.push(user.batchesIdxs[user.currentSet]);
        user.currentSet = user.currentSet.map(function (val) {
          return val + user.batches.batchMeta.batchPerSet
        });
        user.idx = 0;
      }
    }
    var setIdx = Math.floor((user.idx) / user.batches.batchMeta.imgPerBatch);
    var batchIdx = Math.floor((user.idx) % user.batches.batchMeta.imgPerBatch);
    console.log(user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx].markers);
    var dataOut = user.batches[user.batchesIdxs[user.currentSet[setIdx]]].imgs[batchIdx];
    dataOut.idx = user.idx;
    dataOut.idxMax = user.batches.batchMeta.imgPerSet-1;
    dataOut.setsCompleted = user.setsCompleted;
    dataOut.setsMax = maxSets;
    return dataOut;
  };
};

module.exports = imgServer;