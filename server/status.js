/**
 * Created by bdyet on 6/13/2017.
 *
 * Get the current status of the MODA project, in each phase and for each type of scorer.
 *
 */

var aws_ = require('./aws');
var aws = new aws_;


batchesToSkip = {
    psgTech:{
        phase1: [],
        phase2: []},
    researcherOrOther:{
        phase2: [],
        phase1: [99, 115, 160, 345, 371, 387, 389, 394, 13, 20, 23, 37, 38, 66, 75, 95, 108, 110, 135, 139, 153, 155, 157, 164, 174, 186, 187, 219, 225, 231, 233, 240, 246, 267, 270, 271, 297, 311, 320, 343, 346, 349, 350, 367, 379, 384, 2, 3, 5, 6, 7, 9, 14, 15, 16, 21, 30, 31, 33, 34, 42, 45, 46, 48, 61, 63, 64, 69, 70, 71, 73, 74, 81, 83, 94, 105, 113, 114, 116, 122, 123, 124, 125, 126, 129, 131, 132, 133, 141, 143, 144, 146, 147, 149, 154, 156, 161, 165, 167, 168, 169, 173, 176, 178, 180, 191, 198, 229, 235, 238, 239, 241, 242, 243, 244, 249, 254, 257, 259, 263, 264, 268, 269, 274, 278, 279, 282, 295, 308, 316, 325, 328, 333, 334, 337, 340, 342, 344, 348, 351, 359, 361, 365, 375, 376, 381, 385, 393, 397, 398, 399, 400, 401, 0, 1, 4, 8, 18, 19, 24, 25, 26, 27, 28, 29, 32, 39, 41, 44, 52, 55, 62, 65, 68, 72, 76, 80, 84, 87, 89, 92, 93, 106, 112, 117, 119, 121, 136, 137, 138, 142, 148, 172, 179, 182, 184, 190, 192, 193, 194, 202, 203]
    }
};

var statusUpdateInterval = 1000*60*5; //update every 5 mins

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
  self.incompleteBatchesPerPhase = undefined; //undefined until we have gone to aws to update

  self.updateStatusPeriodically = function(){
      var currentFiles = [];
      aws.getFileList(currentFiles,prefixes[0], undefined, function(fileList){
        if (self.incompleteBatchesPerPhase === undefined){
            setTimeout(self.updateStatusPeriodically, statusUpdateInterval/15);
        } else {
            setTimeout(self.updateStatusPeriodically, statusUpdateInterval); //incase saveCurrentBatchProgress does not get all files, we restart countdown to next update
        }
        self.saveCurrentBatchProgress(fileList);
      });
  };

  self.saveCurrentBatchProgress = function(userList){ //async save current status
    var filesStillToReturn = userList.length;
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
            });

            filesStillToReturn = filesStillToReturn - 1;
            if (filesStillToReturn === 0){ //This is the last file, so go and calculate status
                self.incompleteBatchesPerPhase = self.updateCurrentStatus();
            }
        });
    })
  };

  self.initStatusCheck = function(){
      self.updateStatusPeriodically();
  };

  self.updateCurrentStatus = function(){ //sync calculate and get current status (from async written object)
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

      var incompleteBatchesPerPhase = {
          psgTech:{phase1:[], phase2:[], practice:[]},
          researcherOrOther:{phase1:[], phase2:[], practice:[]}
      };

      var countsPerBatch = {psgTech:[], researcherOrOther:[]};
      self.userTypes.forEach(function(userType){
          self.phases.forEach(function(phase){ //Get counts per batch
              if (statusPerPhase[userType][phase] === undefined){return} //skip this phase if it does not exist

              statusPerPhase[userType][phase].unique().forEach(function(uniqueNum){
                  var counts = countInArray(statusPerPhase[userType][phase],uniqueNum);
                  if (batchesToSkip[userType][phase].indexOf(uniqueNum) === -1) {
                      if (phase === 'phase1') {
                          countsPerBatch[userType].push([uniqueNum, counts]);
                      }
                  }
                  if (counts <= self.numBatchesNeededPerUserType[userType]) {
                      if (batchesToSkip[userType][phase].indexOf(uniqueNum) === -1){
                          incompleteBatchesPerPhase[userType][phase].push(uniqueNum)
                      }
                  }
              });
          })
      });


      console.log('Remaining in counts per batch:', countsPerBatch['researcherOrOther'].length);

      console.log('For PSG techs');
      console.log(incompleteBatchesPerPhase['psgTech']['phase1'].length, 'Remaining in phase 1');
      console.log(incompleteBatchesPerPhase['psgTech']['phase2'].length, 'Remaining in phase 2');
      console.log('For Researchers or Other');
      console.log(incompleteBatchesPerPhase['researcherOrOther']['phase1'].length, 'Remaining in phase 1');
      console.log(incompleteBatchesPerPhase['researcherOrOther']['phase2'].length, 'Remaining in phase 2');
      return incompleteBatchesPerPhase
  };

  self.getIncompleteBatches = function(){
     return self.incompleteBatchesPerPhase
  }

}

module.exports = status;

