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
        images.push({imgs:a.slice(i, i += n),scoredBy:[]});
    }
    return images;
}

function imgOb(fileName,sub,idx,sizeOfImg){
    this.fileName = fileName;
    this.sub = sub;
    this.idx =
    this.sizeOfImg = sizeOfImg || 30;
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
                packedImgs.push({fileName:img,set:folder,start:idx*self.sizeOfImg,end:(idx+1)*self.sizeOfImage-1,scoredBy:[]});
            });
            Array.prototype.push.apply(self.batches,split(packedImgs,self.batchSize));
        });
    };
    self.init();

    self.initUser = function(user) {
        user.batches = Array.apply(null, {length: this.batches.length}).map(Number.call, Number);
        user.completedBatches = [];
        var randBatch = getRandomInt(0,user.batches.length);
        user.currentBatch = user.batches[randBatch];
        user.imgIdx = -1;
    };

    self.getNextImage = function(user) {
        user.imgIdx += 1;
        if (user.imgIdx >= self.batches[user.currentBatch].imgs.length) { //Need to get another batch
            user.batches.splice(user.currentBatch,1);
            user.completedBatches.push(user.currentBatch);
            var randBatch = getRandomInt(0,user.batches.length);
            user.currentBatch = user.batches[randBatch];
            user.imgIdx = 0;
        }
        var folder = self.batches[user.currentBatch].imgs[user.imgIdx].set;
        var fileName = self.batches[user.currentBatch].imgs[user.imgIdx].fileName;
        return '/img/' +folder + '/' + fileName;
    };

    self.getPreviousImage =  function(user) {
        user.imgIdx -= 1;
        if (user.imgIdx < 0) { //Need to get another batch
            var lastBatch = user.completedBatches.pop();

            if (lastBatch != undefined) {
                user.currentBatch = lastBatch;
                user.imgIdx = self.batches[user.currentBatch].imgs.length-1;
            } else {
                user.imgIdx = 0;
            }
        }
        var folder = self.batches[user.currentBatch].imgs[user.imgIdx].set;
        var fileName = self.batches[user.currentBatch].imgs[user.imgIdx].fileName;
        return '/img/' +folder + '/' + fileName;
    };
};

module.exports = imgServer;