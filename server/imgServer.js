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
    var metaDataFileHandle = fs.readFileSync('./app/Assets/metaData.json');
    var metaDataFile = JSON.parse(metaDataFileHandle.toString('utf8'));
    var imageFolders = fs.readdirSync('./build/img/');
    imageFolders = imageFolders.filter(function(item){return item.indexOf("Sub") > -1});
    self.numSets = imageFolders.length;
    imageFolders.forEach(function(folder){
      var imgs = fs.readdirSync('./build/img/'+folder);
      imgs = imgs.filter(function(item){return item.indexOf("fig") > -1});
      self.folderLengthMap[folder] = imgs.length;
      var packedImgs = [];
      imgs.forEach(function(img,idx){
        packedImgs.push({
          name:img, //TODO multi image (channel) support
          folder:folder,
          start:metaDataFile[img].start,
          end:metaDataFile[img].end,
          meta: metaDataFile[img].meta || {
            noMarkers:metaDataFile[img].noMarkers, //This is also modified by user
            prac:metaDataFile[img].prac,
            stage:metaDataFile[img].stage,
            gsMarkers:metaDataFile[img].gsMarkers || []
          },
          markers:[], //Only this is modified by user... the rest is static
        });
      });
      Array.prototype.push.apply(self.batches,split(packedImgs,self.batchSize));
    });
  };
  self.init();

  self.initUser = function(userData,cb) {
    userData.batches = clone(self.batches);
    //user.batches = shuffleArray(this.batches); //TODO turn shuffle on from the second batch onwards
    userData.idx = 0;
    userData.markerIndex = 0;
    cb(false,userData);
  };

  self.loadImageMeta = function(img,folder){

    var fileData = fs.readFileSync('./server/Data/User/' + userName + '.txt');

  };

  self.updateImgMeta = function(user, meta){
    user.batches[user.idx].imgs[user.batches[user.idx].idx].meta = meta;
  };

  self.updateMarkerState = function(user, marker){
    if (user.markerIndex < marker.markerIndex){ //set new number of marker
      user.markerIndex = marker.markerIndex;
    }
    marker = self.processMarker(marker); //convert px to secs (adds xSecs field)

    //check if this marker exists in the server already
    var exists = false;
    user.batches[user.idx].imgs[user.batches[user.idx].idx].markers.forEach(function(currentMarker,i){
      if (currentMarker.markerIndex == marker.markerIndex){
        user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[i] = marker; //this was just a move
        exists = true;
      }
    });
    //else, this is a new marker
    if(!exists){
      user.batches[user.idx].imgs[user.batches[user.idx].idx].markers.push(marker);
    }
  };

  self.processMarker = function(marker){ //TODO do y

    if (marker.type==='seg') {
      marker.xSecs = (marker.relToImg.x - imgConfig.margins.left + imgConfig[marker.type].w) * (imgConfig.secs / imgConfig.img.w);
    } else if (marker.type==='box'){
      marker.wSecs = secPerPx*marker.w;
      marker.xSecs = secPerPx*(marker.x - imgConfig.margins.left);//FIXME check this

    }
    return marker
  };

  self.compareToGS = function(user){
    //Step through each non deleted marker and check against GS markers.
    user.batches[user.idx].imgs[user.batches[user.idx].idx].markers.forEach(function(marker,mIdx){
      var matches = user.batches[user.idx].imgs[user.batches[user.idx].idx].meta.gsMarkers.map(function(gsMarker){
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

  self.getMarkers = function (user){
    return user.batches[user.idx].imgs[user.batches[user.idx].idx].markers;
  };

  self.getImage = function(user,inc) {
    var msg = 'ok';
    user.batches[user.idx].idx += inc; //FIXME fix inc greater than one
    if (user.batches[user.idx].idx >= user.batches[user.idx].imgs.length) { //Need to get another batch
      user.batches[user.idx].idx -= inc; //undo what we did
      user.idx += 1;
      if (user.idx >= user.batches.length){
        user.idx=user.batches.length-1;
        msg = 'lastEpoch';
      }
    }
    else if (user.batches[user.idx].idx < 0) { //Need to get another batch
      user.batches[user.idx].idx -= inc; //undo what we did
      user.idx -= 1;
      if (user.idx < 0){
        user.idx=0;
      }
    }

    if(user.idx===0 && user.batches[user.idx].idx===0){msg = 'firstEpoch';}
    var folder = user.batches[user.idx].imgs[user.batches[user.idx].idx].folder;
    var fileName = user.batches[user.idx].imgs[user.batches[user.idx].idx].name;
    var meta = user.batches[user.idx].imgs[user.batches[user.idx].idx].meta;
    return {
      url:'/img/' +folder + '/' + fileName,
      msg:msg,
      imgIdx:user.batches[user.idx].idx,
      batchSize:user.batches[user.idx].imgs.length,
      meta:meta
    };
  };
};

module.exports = imgServer;