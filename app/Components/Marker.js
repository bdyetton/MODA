import ResizableAndMovable from '../../node_modules/react-resizable-and-movable';
var ConfidenceBox = require('./ConfidenceBox');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Marker',

  getInitialState: function() {
    return {
      conf:this.props.conf || '',
      confActive:(this.props.confActive===undefined) ? true : this.props.confActive,
      x:this.props.x-(this.props.w || 50) || 0,
      w:this.props.w || 100,
      type:'box',
      deleted:false,
      gs:this.props.gs || false,
    };
  },

  componentWillMount: function(){
    if(!this.state.gs){this.props.updateMarkerState(this.state)};
  },

  componentDidMount: function() {
    setTimeout(function() {
      ReactDOM.findDOMNode(this.refs['Marker'+ this.props.markerIndex]).focus();
    }.bind(this), 0);
  },

  handleKey: function(event) {
    if (event.keyCode === 39) {
      this.setState({x:this.state.x+1});
    } else if (event.keyCode === 37) {
      this.setState({x:this.state.x-1});
    } else if (event.keyCode===72){
        this.updateConf('high');
      }
      else if (event.keyCode===77){
        this.updateConf('med');
      }
      else if (event.keyCode===76){
        this.updateConf('low');
      } else {
        return;//Do nothing, let event propagate
      }
      event.stopPropagation();
      event.preventDefault();
  },


  updateConf: function(conf){
    if (this.state.conf===''){
      this.props.decrementConfCounter();
    }
    this.setState({conf:conf, confActive:false},function(){
      this.props.updateMarkerState(this.state);
    });
  },

  removeMarker: function(){
    var self = this;
    self.setState({deleted:true},function(){
      self.props.updateMarkerState(self.state);
      self.props.removeMarker(self.props.markerIndex);
    })
  },

  updatePos: function(e, pos){
    var self=this;
    self.setState({x:pos.position.left},function(){self.props.updateMarkerState(self.state)});
  },

  updateSize: function(size){
    var self=this;
    self.setState({w:size.width},function(){self.props.updateMarkerState(self.state)});
  },

  getColor: function(){
    if (this.state.conf==='high'){ return "rgba(140, 217, 140, 0.7)"}
    else if (this.state.conf==='med'){ return "rgba(255, 204, 102, 0.7)"}
    else if (this.state.conf==='low'){ return "rgba(255, 153, 153, 0.7)"}
    else if (this.state.gs){ return "rgba(64,31,124,0.7)"}
    else { return "rgba(136, 183, 213, 0.7)" }
  },

  toggleConf: function(){
    this.setState({confActive:!this.state.confActive});
  },

  render: function () {
    var self = this;

    var removeButton =
      <div key='removeBut' className='remove-gyp-holder'>
        <rb.Button className='gyp-x' bsSize='xsmall' onClick={self.removeMarker}>
          <rb.Glyphicon style={{'fontSize': '25px'}} glyph="glyphicon glyphicon-remove-circle" />
        </rb.Button>
      </div>;

    var initialProps={
        start:{x:self.state.x, y:0, width:self.state.w, height:self.props.h},
        minWidth:20,
        isResizable:{x: !self.state.gs, y: false, xy: false},
        moveAxis: self.state.gs ? 'none' : 'x', //TODO update to be none also.
        onResizeStop:self.updateSize,
        onDragStop:self.updatePos,
        customStyle:{background: self.getColor(), border: '1p solid #0d0'},
        children: !self.state.gs ? [
          <ConfidenceBox key='confBox'
                         tabIndex='0'
                         index={'confBox'+ this.props.markerIndex}
                         ref={'confBox'+ this.props.markerIndex}
                         updateConf={self.updateConf}
                         toggleConf={self.toggleConf}
                         conf={self.state.conf}
                         confActive={self.state.confActive}/>,
          removeButton] : <div style={{color:'#f0ad4e',fontSize:'24'}}>GS</div>
    };
    return (<div ref={'Marker'+ this.props.markerIndex}
                 tabIndex='0'
                 onKeyDown={this.handleKey}>
      <ResizableAndMovable key={'ResizableAndMovable'+ initialProps.start.x} {...initialProps}/>
    </div>)
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>