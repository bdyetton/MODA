var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Instructions',

  render() {
    return (
      <div>
        <rb.Button
          bsStyle="primary"
          bsSize="medium"
          onClick={this.props.openInst}
        >
        Instructions
        </rb.Button>

        <rb.Modal show={this.props.showInst} onHide={this.props.closeInst} bsSize="large" aria-labelledby="contained-modal-title-lg">
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>MODA Instructions</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            <h4>Welcome to the Massive Online Data Annotation Tool</h4>
            <p>Here are some instructions</p>
            
            <hr />

            <h4>YAY a video!</h4>
            <rb.ResponsiveEmbed a16by9>
              <embed type="image/svg+xml" src="https://www.youtube.com/embed/FavUpD_IjVY" />
            </rb.ResponsiveEmbed>
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <rb.Button onClick={this.props.closeInst}>Close</rb.Button>
          </rb.Modal.Footer>
        </rb.Modal>
      </div>
    );
  }
});