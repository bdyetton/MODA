var mturkApi = require('../node_modules/mturk-api');

function mturk() {
  var self = this;
  self.host = process.env.MODA_MTURK_HOST;
  self.phasesQualID = {
    sandbox:{
      practice:'3LJ6LLBDMBQTWUTLG75O5EUQMZM6A6',
      phase1:'3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93'
    },
    real:{
      practice:'3EOSKS3N0DQYQTMKNK1E0HHQOWRVU1',
      phase1:'3874R5DF6Q5C7TEUP9O1NNJXLRMPJ6'
    }
  };
  var config = {
    access : process.env.AWS_ACCESS_KEY_ID,
    secret : process.env.AWS_SECRET_ACCESS_KEY,
    sandbox: self.host==='sandbox'
  };

  mturkApi.connect(config).then(function(api){
    self.api = api;
  }).catch(console.error);

  self.approveHIT = function(user,cb) {
    self.api.req('ApproveAssignment',{assignmentId:user.assignmentId}).then(function(resp){
      console.log(resp)
    })
  };

  self.markPhaseComplete = function(user,phase){
    console.log('Granting ' + phase + ' qualification to ' + user.userName);
    self.api.req('AssignQualification',{QualificationTypeId:self.phasesQualID[self.host][phase], WorkerId:user.userName}).then(function(resp){
      console.log(resp)
    })
  };

}

module.exports = mturk;