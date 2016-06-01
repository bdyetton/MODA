var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'SubmitHIT',

  getInitialState: function() {
    return {
      confirmOk:false
    }
  },

  componentDidMount: function(){
    var self = this;
    $( "#mturk_form" ).submit(function(event) {
      //alert( "Handler for .submit() called." );
      self.props.closeSubmit()
      self.setState({confirmOk:false})
      //event.preventDefault();
    });
  },

  okClicked: function(){
    var self = this;
    self.props.submitHit();
    self.setState({confirmOk:true})
  },

  stdSubmitClicked(){
    var self = this;
    self.setState({confirmOk:true});
    self.props.submitHit()
  },

  stdSubmit: function(){
    var self = this;
    return (<div>
              <rb.Button onClick={self.props.closeSubmit}>Cancel</rb.Button>
              <rb.Button onClick={self.props.stdSubmitClicked}>Submit</rb.Button>
            </div>)
  },

  confirmOkSubmit: function(){
    var self = this;
    return (<div>
              <rb.Button onClick={self.props.closeSubmit}>Cancel</rb.Button>
              <rb.Button onClick={self.okClicked}>I understand</rb.Button>
            </div>)
  },

  drawButtons: function(){
    var self = this;
    if (self.props.userData.userType==='mturker'){
      if (!self.state.confirmOk){
        return self.confirmOkSubmit()
      } else {
         if (self.props.prac){
           return self.stdSubmit()
         } else {
           return self.turkerSubmit()
         }
      }
    } else {
      return self.stdSubmit()
    }

  },

  turkerSubmit: function(){
    var self = this;
    return (<form name="mturk_form"
                  method="post"
                  id="mturk_form"
                  action={self.props.userData.turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + self.props.userData.assignmentId}>
              <input type="hidden" value={self.props.userData.assignmentId} name="assignmentId" id="assignmentId"/>
              <input type="hidden" value={self.props.userData.workerId} name="workerId" id="workerId"/>
              <input type="hidden" value={self.props.userData.hitId} name="hitId" id="hitId"/>
              <input type="hidden" value={self.props.userData.version} name="version" id="version"/>
              <input type="hidden" value={self.props.userData.browser} name="browser" id="browser"/>
              <input type="hidden" value={self.props.viewedImgs} name="viwedImgs" id="viwedImgs"/>
              <rb.Input type="submit" style={{width:'70%', float: "left"}}/>
            </form>)
  },

  render: function() {
    var self=this;
    return (
        <rb.Modal show={self.props.showSubmit} onHide={self.props.closeSubmit}
                  bsStyle={self.props.prac ? '' : 'sm'}aria-labelledby="contained-modal-title-lg" className='confirm-modal'>
          <rb.Modal.Header>
            <rb.Modal.Title>Confirm Submission?</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            {self.props.prac ?
              (<p className='std-para'>You are in <b style={{color:'orange'}}>practice mode. &nbsp;</b>After clicking submit you will be
                granted a qualification that lets you complete more MODA HITs. <br/><br/>The first of these HITs will be
                automatically shown next and&nbsp;<b style={{color:'red'}}>must be completed before the current HIT is approved</b>.
              After that hit is completed, find more HITs by searching with keywords like <i>"sleep", "MODA"</i> and <i>"spindles".</i></p>) :
              (!self.state.confirmOk ? <p>Once this HIT is submitted you will not be able to edit spindle markers.</p> : <p><b style={{color:'red'}}>Click submit to post results to Mturk</b></p>)
            }
          </rb.Modal.Body>
          <rb.Modal.Footer>
            {self.drawButtons()}
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});