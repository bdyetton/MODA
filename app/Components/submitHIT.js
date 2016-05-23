var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'SubmitHIT',

  componentDidMount: function(){
    var self = this;
    $( "#mturk_form" ).submit(function( event ) {
      //alert( "Handler for .submit() called." );
      self.props.submitHit();
      console.log(event)
      //event.preventDefault();
    });
  },

  render: function() {
    var self=this;
    return (
        <rb.Modal show={self.props.showSubmit} onHide={self.props.closeSubmit}
                  bsSize="small" aria-labelledby="contained-modal-title-lg" className='confirm-modal'>
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>Confirm HIT Submission</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            Once this HIT is submitted you will not be able to edit spindle markers.
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <form name="mturk_form" method="post" id="mturk_form" action={self.props.userData.turkSubmitTo + "/mturk/externalSubmit"}>
              <input type="hidden" value='' name="assignmentId" id={self.props.userData.assignmentId}/>
              <rb.Input type="submit" style={{width:'70%', float: "left"}}/>
              <rb.Button onClick={self.props.closeSubmit}>Cancel</rb.Button>
            </form>
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});