var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'SubmitHIT',

  render: function() {
    return (
        <rb.Modal show={this.props.showSubmit} onHide={this.props.closeSubmit}
                  bsSize="small" aria-labelledby="contained-modal-title-lg" className='confirm-modal'>
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>Confirm HIT Submission</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            Once this HIT is submitted you will not be able to edit spindle markers.
            <form name="mturk_form" method="post" id="mturk_form" action="http://workersandbox.mturk.com/mturk/externalSubmit">
              <input type="hidden" value='' name="assignmentId" id="assignmentId"/>
              <input type="hidden" value="my_data" name="data" id="data"/>
              <input type="submit" value="Send to MTurk"/>
            </form>
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <rb.Button onClick={this.props.submitHit}>Confirm Submission</rb.Button>
            <rb.Button onClick={this.props.closeSubmit}>Cancel</rb.Button>
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});