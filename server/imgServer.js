var path = require('path');
var fs = require('fs');
var extend = require('extend');

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
          idx:0,
          marks:[]});
    }
    return images;
}

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

function imgServer(){
    var self = this;
    self.batchSize = 5;
    self.sizeOfImage = 30;
    self.folderLengthMap = {};
    self.batches = [];
    self.init = function (){
        var imageFolders = fs.readdirSync('./build/img/');
        imageFolders = imageFolders.filter(function(item){return item.indexOf("Set") > -1});
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
                  start:idx*self.sizeOfImg,
                  end:(idx+1)*self.sizeOfImage-1,
                  scoredBy:[]
                });
            });
            Array.prototype.push.apply(self.batches,split(packedImgs,self.batchSize));
        });
    };
    self.init();

    self.initUser = function(user) {
        user.batches = extend({},this.batches);
        //user.batches = shuffleArray(this.batches); //TODO turn shuffle on!
        user.idx = 0;
    };

    self.getImage = function(user,inc) {
        user.batches[user.idx].idx += inc; //TODO fix inc greater than one
        if (user.batches[user.idx].idx >= user.batches[user.idx].imgs.length) { //Need to get another batch
          user.batches[user.idx].idx -= inc; //undo what we did
          user.idx += 1;
        }
        else if (user.batches[user.idx].idx < 0) { //Need to get another batch
          user.batches[user.idx].idx -= inc; //undo what we did
          user.idx -= 1;
        }
        var folder = self.batches[user.idx].imgs[user.batches[user.idx].idx].folder;
        var fileName = self.batches[user.idx].imgs[user.batches[user.idx].idx].name;
        console.log('/img/' +folder + '/' + fileName);
        return '/img/' +folder + '/' + fileName;
    };

  
};

module.exports = imgServer;