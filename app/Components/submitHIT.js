var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'SubmitHIT',

  componentDidMount: function(){
    var self = this;
    $( "#mturk_form" ).submit(function( event ) {
      //alert( "Handler for .submit() called." );
      self.props.submitHit();
      console.log(event);
      //event.preventDefault();
    });
  },

  stdSubmit: function(){
    return (<div>
              <rb.Button onClick={self.props.closeSubmit}>Cancel</rb.Button>
              <rb.Button onClick={self.props.submitHit}>Submit</rb.Button>
            </div>)
  },

  turkerSubmit: function(){
    return (<form name="mturk_form"
                  method="post"
                  id="mturk_form"
                  action={self.props.userData.turkSubmitTo + "/mturk/externalSubmit?assignmentId=" + self.props.userData.assignmentId}>
              <input type="hidden" value={self.props.userData.assignmentId} name="assignmentId" id="assignmentId"/>
              <input type="hidden" value={self.props.userData.workerId} name="workerId" id="workerId"/>
              <input type="hidden" value={self.props.userData.hitId} name="hitId" id="hitId"/>
              <rb.Input type="submit" style={{width:'70%', float: "left"}}/>
              <rb.Button onClick={self.props.closeSubmit}>Cancel</rb.Button>
            </form>)
  },

  render: function() {
    var self=this;
    return (
        <rb.Modal show={self.props.showSubmit} onHide={self.props.closeSubmit}
                  bsSize="small" aria-labelledby="contained-modal-title-lg" className='confirm-modal'>
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>Confirm Submission?</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            {self.props.prac ?
              (<p>You are in <b style={{color:'orange'}}>practice mode.</b>
              After clicking submit you will be granted a qualification that lets you complete more MODA HITs.
              The first of these HITs will be automatically shown next and
              <b style={{color:'red'}}>must be completed before the current HIT is approved<b>.
              after that, find more HITs by searching with keywords like "sleep", "MODA" and "spindles".</p>) :
              (<p>Once this HIT is submitted you will not be able to edit spindle markers.</p>)
            }
          </rb.Modal.Body>
          <rb.Modal.Footer>
            {self.props.userData.userType==='mturker' ?
              (self.props.prac ? self.stdSubmit() : self.turkerSubmit()) :
            self.stdSubmit()}
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});