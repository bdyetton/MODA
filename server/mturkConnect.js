var mturkApi = require('mturk-api');

function mturk() {
  var self = this;
  self.phases = {
    practice:'3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93',
    phase1:'3OFCXZK7I1YMQQ45Q5LPJ2OOHCHK93'
  };
  var config = {
    access : process.env.AWS_ACCESS_KEY_ID,
    secret : process.env.AWS_SECRET_ACCESS_KEY,
    sandbox: true
  };

  mturkApi.connect(config).then(function(api){
  self.api = api;
  }).catch(console.error);

  //self.api = mturkApi.createClient(config);

  self.approveHIT = function(user,cb) {
    self.api.req('ApproveAssignment',{assignmentId:user.assignmentId}).then(function(resp){
      console.log(resp)
    })
  };

  self.markPhaseComplete = function(user,phase){
    self.api.req('AssignQualification',{QualificationTypeId:self.phases[phase], WorkerId:user.userName}).then(function(resp){
      console.log(resp)
    })
  };

}

module.exports = mturk;