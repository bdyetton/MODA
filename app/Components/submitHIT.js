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
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <rb.Button onClick={this.props.submitHit}>Confirm Submission</rb.Button>
            <rb.Button onClick={this.props.closeSubmit}>Cancel</rb.Button>
          </rb.Modal.Footer>
        </rb.Modal>
    );
  }
});