/**
 * Created by bdyet on 6/13/2017.
 *
 * Get the current status of the MODA project, in each phase and for each type of scorer.
 *
 */

var aws_ = require('./aws');
var aws = new aws_;


var statusUpdateInterval = 1000*10*5; //update every 5 mins

prefixes = ['UserData_expert_'];

function countInArray(array, value) {
  return array.reduce((n, x) => n + (x === value), 0);
}

Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
};

function status() {
  var self = this;
  self.aws = aws;
  self.completedBatchesAll = {};
  self.phases = ['phase1','phase2'];
  self.userTypes = ['psgTech','researcherOrOther'];
  self.numBatchesNeededPerUserType = {'psgTech':5,'researcherOrOther':5};
  self.incompleteBatchesPerPhase = {
      psgTech:{phase1:[], phase2:[], practice:[]},
      researcherOrOther:{phase1:[], phase2:[], practice:[]}
  };

  self.updateStatusPeriodically = function(){
      self.calcCurrentStatus(); //Process the last read from userFiles.
      var currentFiles = [];
      aws.getFileList(currentFiles,prefixes[0], undefined, function(fileList){
        self.saveCurrentBatchProgress(fileList);
        setTimeout(self.updateStatusPeriodically, statusUpdateInterval);
      });
  };

  self.saveCurrentBatchProgress = function(userList){ //async save current status
    userList.forEach(function(userFile){
        self.aws.getFile(userFile.Key, function(err, userJSON){
            if (!(userJSON.userName in self.completedBatchesAll)){
                self.completedBatchesAll[userJSON.userName] = {}; //init spot for user if not already there
                self.completedBatchesAll[userJSON.userName]['batchesCompleted'] = {};
                if ('RPSGTNum' in userJSON.registerData){
                    self.completedBatchesAll[userJSON.userName]['userType'] = 'psgTech'
                } else {
                    self.completedBatchesAll[userJSON.userName]['userType'] = 'researcherOrOther'
                }
            }
            self.phases.forEach(function(phase){
                self.completedBatchesAll[userJSON.userName]['batchesCompleted'][phase] = userJSON['batchesCompleted'][phase]
            })
        });
    })
  };

  self.initStatusCheck = function(postStatusCB){
      self.postStatus = postStatusCB;
      setTimeout(self.updateStatusPeriodically, statusUpdateInterval);
  };

  self.calcCurrentStatus = function(){ //sync calculate and get current status (from async written object)
      if (self.completedBatchesAll.length === 0){return}
      var statusPerPhase = {
          psgTech:{phase1:[], phase2:[], practice:[]},
          researcherOrOther:{phase1:[], phase2:[], practice:[]}
      };

      Object.keys(self.completedBatchesAll).forEach(function(userName){
          self.phases.forEach(function(phase){
              if (self.completedBatchesAll[userName]['batchesCompleted'][phase] === undefined){return} //skip this phase if it does not exist
              self.userTypes.forEach(function(userType){
                  statusPerPhase[userType][phase] = statusPerPhase[userType][phase].concat(self.completedBatchesAll[userName]['batchesCompleted'][phase]);
              });
          })
      });

      self.userTypes.forEach(function(userType){
          self.phases.forEach(function(phase){ //Get counts per batch
              if (statusPerPhase[userType][phase] === undefined){return} //skip this phase if it does not exist

              statusPerPhase[userType][phase].unique().forEach(function(uniqueNum){
                  var counts = countInArray(statusPerPhase[userType][phase],uniqueNum);
                  if (counts < self.numBatchesNeededPerUserType[userType]) {
                      self.incompleteBatchesPerPhase[userType][phase].push(uniqueNum)
                  }
              });
          })
      });
      console.log('Status Updated')
  };

  self.getIncompleteBatches = function(){
      return self.incompleteBatchesPerPhase
  }

}

module.exports = status;