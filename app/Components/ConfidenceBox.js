var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'ConfidenceBox',


    componentWillMount:function(){
     document.addEventListener("keydown", this.handleKey, false);
    },

    handleKey: function(event){
      if (event.keyCode===48){
        this.props.changeStage('high');
      }
      else if (event.keyCode===49){
        this.props.changeStage('med');
      }
      else if (event.keyCode===50){
        this.props.changeStage('low');
      }
    },

  updateConf: function(e){
    var clickedButton = ReactDOM.findDOMNode(e.currentTarget).getAttribute("data-id");
    this.props.updateConf(clickedButton);
  },

  render: function () {
    var self = this;

    return (<div>
      <div key='changeConfBut' className='conf-gyp-holder'>
        <rb.Button className='gyp-x' bsSize='xsmall' onClick={self.props.toggleConf}>
          <rb.Glyphicon style={{'fontSize': '23px'}} glyph="glyphicon glyphicon-th-list"/>
        </rb.Button>
      </div>
      {self.props.confActive ? <div className='arrow_box_container'>
        <div className={"arrow_box " + (self.props.confActive ? "active" : "")}>Confidence?
          <rb.ButtonGroup bsSize='medium' block vertical position='relative' width='100%' data-toggle="buttons">
            <rb.Button bsClass='btn btn-conf-high btn-white-act' data-id='high' onClick={this.updateConf} ref='confHigh'
                       active={this.props.conf==='high'}>High
            </rb.Button>
            <rb.Button bsClass='btn btn-conf-med btn-white-act' data-id='med' onClick={this.updateConf} ref='confMed'
                       active={this.props.conf==='med'}>Med
            </rb.Button>
            <rb.Button bsClass='btn btn-conf-low btn-white-act' data-id='low' onClick={this.updateConf} ref='confLow'
                       active={this.props.conf==='low'}>Low
            </rb.Button>
          </rb.ButtonGroup>
        </div>
      </div> : ''}
    </div>)
  }
});