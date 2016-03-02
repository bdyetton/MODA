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

imgConfig = {
  secs:30,
  sampleRate:256,
  margins:{
    left:45,
    top:7,
    bottom:45,
    right:9},
  img:{
    h:338,
    w:1148
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
                  start:idx*imgConfig.secs, //TODO pack into meta block, this data should come from a csv
                  end:(idx+1)*imgConfig.secs-1/imgConfig.sampleRate,
                  meta:{
                    noMarkers:false,
                    stage:''
                  },
                  markers:[]
                });
            });
            Array.prototype.push.apply(self.batches,split(packedImgs,self.batchSize));
        });
    };
    self.init();

    self.initUser = function(user) {
        user.batches = clone(this.batches);
        //user.batches = shuffleArray(this.batches); //TODO turn shuffle on!
        user.idx = 0;
        user.markerIndex = 0;
    };

    self.setStage = function(user, stage){return true};
    self.getStage = function(user){return 0};

    self.updateImgMeta = function(user, meta){
      user.batches[user.idx].imgs[user.batches[user.idx].idx].meta = meta;
      console.log(user.batches[user.idx].idx);
      console.log(user.batches[user.idx].imgs[user.batches[user.idx].idx])
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
      //console.log( user.batches[user.idx].imgs[user.batches[user.idx].idx].markers);
    };

    self.processMarker = function(marker){ //TODO do y
      if (marker.type==='seg') {
        marker.xSecs = (marker.relToImg.x - imgConfig.margins.left + imgConfig[marker.type].w) * (imgConfig.secs / imgConfig.img.w);
      } else if (marker.type==='box'){
        var secPerPx = (imgConfig.secs / imgConfig.img.w);
        marker.wSecs = marker.w * secPerPx;
        marker.xSecs = (marker.x - imgConfig.margins.left + marker.w/2) * secPerPx;

      }
      return marker
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
            msg = 'This is the last Epoch';
          }
        }
        else if (user.batches[user.idx].idx < 0) { //Need to get another batch
          user.batches[user.idx].idx -= inc; //undo what we did
          user.idx -= 1;
          if (user.idx < 0){
            user.idx=0;
            msg = 'This is the first Epoch';
          }
        }
        //Get other data //TODO include all in metaData
        var folder = self.batches[user.idx].imgs[user.batches[user.idx].idx].folder;
        var fileName = self.batches[user.idx].imgs[user.batches[user.idx].idx].name;
        var meta = self.batches[user.idx].imgs[user.batches[user.idx].idx].meta;
        console.log(self.batches[user.idx].imgs[user.batches[user.idx].idx]);
        return {url:'/img/' +folder + '/' + fileName,msg:msg, meta:meta};
    };
};

module.exports = imgServer;