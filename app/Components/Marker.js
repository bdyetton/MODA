import ResizableAndMovable from '../../node_modules/react-resizable-and-movable';
var ConfidenceBox = require('./ConfidenceBox');
var rb = require('react-bootstrap');

module.exports = React.createClass({
  displayName: 'Marker',

  getInitialState: function() {
    return {
      markerIndex: this.props.markerIndex,
      conf:this.props.conf || '',
      confActive:(this.props.confActive===undefined) ? true : this.props.confActive,
      x:this.props.x-(this.props.w || 50) || 0,
      w:this.props.w || 100,
      type:'box',
      deleted:false,
      gs:this.props.gs || false
    };
  },

  componentWillMount: function(){
    if(!this.state.gs){this.props.updateMarkerState(this.state)};
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
        moveAxis:'x', //TODO update to be none also.
        onResizeStop:self.updateSize,
        onDragStop:self.updatePos,
        customStyle:{background: self.getColor(), border: '1p solid #0d0'},
        children: !self.state.gs ? [
          <ConfidenceBox key='confBox' updateConf={self.updateConf} toggleConf={self.toggleConf} conf={self.state.conf}  confActive={self.state.confActive}/>,
          removeButton] : []
    };
    return <ResizableAndMovable {...initialProps}/>
  }
});

//<p>Now logged in as {self.props.user}</p><p>Epoch ID: {self.state.currentRemImage}</p>
//<Stager stage={self.state.stage} changeStage={self.changeStage}/>