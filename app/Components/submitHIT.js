var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'SubmitHIT',

  componentDidMount: function(){
    $( "#mturk_form" ).submit(function( event ) {
      //alert( "Handler for .submit() called." );
      event.preventDefault();
    });
  },

  render: function() {
    return (
        <rb.Modal show={this.props.showSubmit} onHide={this.props.closeSubmit}
                  bsSize="small" aria-labelledby="contained-modal-title-lg" className='confirm-modal'>
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>Confirm HIT Submission</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            Once this HIT is submitted you will not be able to edit spindle markers.
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <form name="mturk_form" method="post" id="mturk_form" action={this.props.submitTo + "/mturk/externalSubmit"}>
              <input type="hidden" value='' name="assignmentId" id={this.props.assignmentId}/>
              <rb.Input type="submit" style={{width:'70%', float: "left"}} onClick={this.props.submitHit}/>
              <rb.Button onClick={this.props.closeSubmit}>Cancel</rb.Button>
            </form>
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});