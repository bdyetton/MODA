var bootstrap = require('bootstrap');
var rb = require('react-bootstrap');

module.exports = React.createClass({
    displayName: 'Stager',

    componentWillMount:function(){
     document.addEventListener("keydown", this.handleKey, false);
    },

    handleKey: function(event){
      console.log(event); // TODO The button last pushed cannot be selected again...
      if (event.keyCode===48){
        this.props.changeStage('0');
      }
      else if (event.keyCode===49){
        this.props.changeStage('1');
      }
      else if (event.keyCode===50){
        this.props.changeStage('2');
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
      this.props.changeStage(clickedButton);
    },

    render: function () {
      return (
          <rb.ButtonGroup  bsSize='medium' position='relative' width='100%'>
             <rb.Button bsClass='btn active-green' data-id='0' onClick={this.updateConf} ref='0' active={this.props.stage==='0'}>Wake</rb.Button>
             <rb.Button bsClass='btn active-green' data-id='1' onClick={this.updateConf} ref='1' active={this.props.stage==='1'}>S1</rb.Button>
             <rb.Button bsClass='btn active-green' data-id='2' onClick={this.updateConf} ref='2' active={this.props.stage==='2'}>S2</rb.Button>
             <rb.Button bsClass='btn active-green' data-id='3' onClick={this.updateConf} ref='3' active={this.props.stage==='3'}>SWS</rb.Button>
             <rb.Button bsClass='btn active-green' data-id='4' onClick={this.updateConf} ref='4' active={this.props.stage==='4'}>REM</rb.Button>
          </rb.ButtonGroup>)
    }
});