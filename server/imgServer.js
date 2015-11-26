var path = require('path');
var fs = require('fs');
var extend = require('node.extend');

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
                  name:img,
                  folder:folder,
                  start:idx*imgConfig.secs,
                  end:(idx+1)*imgConfig.secs-1/imgConfig.sampleRate,
                  markers:{
                    seg:[]
                  }
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
    };

    self.updateMarkerState = function(user, marker){
        marker = self.processMarker(marker);
        if(user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[marker.type].length > [marker.index]){
          user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[marker.type][marker.index] = marker;
        } else {
          user.batches[user.idx].imgs[user.batches[user.idx].idx].markers[marker.type].push(marker)
        }
    };

    self.processMarker = function(marker){ //TODO do y
      marker.xSecs = (marker.relToImg.x-imgConfig.margins.left+imgConfig[marker.type].w)*(imgConfig.secs/imgConfig.img.w);
      console.log(marker.xSecs);
      return marker
    };

    self.getMarkers = function (user){
      return user.batches[user.idx].imgs[user.batches[user.idx].idx].markers;
    };


    self.getImage = function(user,inc) {
        var msg = 'ok';
        user.batches[user.idx].idx += inc; //TODO fix inc greater than one
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
        var folder = self.batches[user.idx].imgs[user.batches[user.idx].idx].folder;
        var fileName = self.batches[user.idx].imgs[user.batches[user.idx].idx].name;
        return {url:'/img/' +folder + '/' + fileName,msg:msg};
    };
};

module.exports = imgServer;