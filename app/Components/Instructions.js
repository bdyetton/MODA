var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Instructions',

  getInitialState: function() {
    return {
      page: 1
    };
  },

  nextPage: function(){
    this.changePage(1)
  },

  previousPage: function(){
    this.changePage(-1)
  },

  changePage: function(inc){
    var self = this;
    self.setState({page:self.state.page+inc})
  },

  dispPage: function(){
    var self = this;
    if (self.state.page ==1) {
      return self.page1();
    }
    else if (self.state.page==2) {
      return self.page2();
    }
  },

  page1: function() {
    return (
      <div>
      <h4><i>You must read these instructions at least once.</i></h4>
        <p>Welcome to the Beta version of MODA. You task is to find <b>spindles</b> in brainwaves recorded from sleeping subjects.</p>
          <p>
            Score spindles by drawing boxes around them. Rate your confidence.
            If there are no spindles in that epoch then click the corresponding button below the signal.
            There are 60 epochs in total broken down into 6 sets (HITs) of 10 epochs.
            If you have any trouble at at, then just refresh the browser and log back in.
            Your data is saved automatically, so you wont loose any work.
          </p>
            PRESS CLOSE TO BEGIN SCORING
        </div>
    )
  },
              /*
              Here is an example of a window containing
            two spindles (underlined in green).
              <img src="https://www.marketingcloud.com/blog/wp-content/uploads/2014/06/long_or_short.jpg" alt="Mountain View">
            </img>*/

      //  <rb.ResponsiveEmbed a16by9>
      //  <embed type="image/svg+xml" src="https://www.youtube.com/embed/FavUpD_IjVY"/>
      //</rb.ResponsiveEmbed>

  page2: function(){
    return (<div>
      <h4>Watch the following short video to learn how to detect spindles in sleeping brainwaves</h4>
    </div>)
  },

  render: function() {
    return (
      <div>
        <rb.Button
          bsStyle="primary"
          onClick={this.props.openInst}
        >
        Instructions
        </rb.Button>

        <rb.Modal show={this.props.showInst} onHide={this.props.closeInst}
                  bsSize="large" aria-labelledby="contained-modal-title-lg">
          <rb.Modal.Header closeButton>
            <rb.Modal.Title>Welcome to the Massive Online Data Annotation Tool</rb.Modal.Title>
          </rb.Modal.Header>
          <rb.Modal.Body>
            {this.dispPage()}
          </rb.Modal.Body>
          <rb.Modal.Footer>
            <rb.Button onClick={this.previousPage}>Back</rb.Button>
            <rb.Button onClick={this.nextPage}>Next</rb.Button>
            <rb.Button onClick={this.props.closeInst}>Close</rb.Button>
          </rb.Modal.Footer>
        </rb.Modal>
      </div>
    );
  }
});