var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'ConfidenceBox',

    componentWillMount:function(){
     document.addEventListener("keydown", this.handleKey, false);
    },

    handleKey: function(event){
      console.log(event); // TODO The button last pushed cannot be selected again...
      if (event.keyCode===48){
        this.props.changeStage('high');
      }
      else if (event.keyCode===49){
        this.props.changeStage('med');
      }
      else if (event.keyCode===50){
        this.props.changeStage('low');
      }
      else if (event.keyCode===51){
        this.props.changeStage('3');
      }
      else if (event.keyCode===52){
        this.props.changeStage('4');
      }
    },

  updateConf: function(e){
    var clickedButton = ReactDOM.findDOMNode(e.currentTarget).getAttribute("data-id");
    this.props.updateConf(clickedButton);
  },

  render: function () {
    return (<div className='arrow_box_container'>
      <div className='arrow_box'>Confidence?
        <rb.ButtonGroup  bsSize='medium' block vertical position='relative' width='100%' data-toggle="buttons">
           <rb.Button bsClass='btn btn-conf-high btn-white-act' data-id='high' onClick={this.updateConf} ref='confHigh' active={this.props.conf==='high'}>High</rb.Button>
           <rb.Button bsClass='btn btn-conf-med btn-white-act' data-id='med' onClick={this.updateConf} ref='confMed' active={this.props.conf==='high'}>Med</rb.Button>
           <rb.Button bsClass='btn btn-conf-low btn-white-act' data-id='low' onClick={this.updateConf} ref='confLow' active={this.props.conf==='high'}>Low</rb.Button>
        </rb.ButtonGroup>
      </div>
    </div>)
  }
});